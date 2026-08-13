"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase, Lesson } from "@/lib/supabase";
import { getLessonById, getLessons, hasUserPurchasedLesson, purchaseLesson } from "@/lib/api";
import { ContentShield } from "@/components/ContentShield";
import { Paywall } from "@/components/Paywall";
import { ArrowLeft, Play, Loader2, BookOpen, CheckCircle, Lightbulb, Check, Code } from "lucide-react";
import { PageSpinner } from "@/components/ui/page-spinner";
import dynamic from "next/dynamic";
import LessonChat from "../_components/LessonChat";
import { useAuth } from "@/components/AuthProvider";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Helper to structure a flat text content into rich sections
function parseLessonContent(content: string) {
  if (!content) return { definition: "", theory: [], summary: [] };
  
  const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
  
  if (paragraphs.length <= 1) {
    return { definition: paragraphs[0] || "", theory: [], summary: [] };
  }
  
  const definition = paragraphs[0];
  const summary = paragraphs.length > 2 ? [paragraphs[paragraphs.length - 1]] : [];
  
  const theory = paragraphs.slice(1, paragraphs.length > 2 ? paragraphs.length - 1 : paragraphs.length);
  
  return { definition, theory, summary };
}

function getLevelFromId(id: string): 'beginner' | 'intermediate' | 'advanced' {
  const num = parseInt(id.split('-').pop() || '0');
  if (id.includes('py-') || id.includes('js-')) {
    if (num <= 7) return 'beginner';
    if (num <= 12) return 'intermediate';
    return 'advanced';
  } else if (id.includes('ts-') || id.includes('java-')) {
    if (num <= 3) return 'beginner';
    if (num <= 6) return 'intermediate';
    return 'advanced';
  } else {
    if (num <= 4) return 'beginner';
    if (num <= 7) return 'intermediate';
    return 'advanced';
  }
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const { user, session, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  
  const [completed, setCompleted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !params.id) return;

    async function loadLesson() {
      setLoading(true);
      try {
        // The progress query only needs user.id, so it doesn't have to wait
        // on the lesson fetch - run them concurrently. getLessons() genuinely
        // depends on lessonData.language, so that one still has to come after.
        const [lessonData, progressResult] = await Promise.all([
          getLessonById(params.id as string),
          supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("completed", true),
        ]);

        if (!lessonData) {
          setLoading(false);
          return;
        }

        if (lessonData.is_premium) {
          const purchased = await hasUserPurchasedLesson(user.id, lessonData.id);
          setHasAccess(purchased);
        } else {
          setHasAccess(true);
        }

        setLesson(lessonData);
        setCode(lessonData.tryStarter || lessonData.codeExample || "// Write your code here");

        const fetchedLessons = await getLessons(lessonData.language);
        setAllLessons(fetchedLessons);
        setTotalLessons(fetchedLessons.length);

        const progressData = progressResult.data;

        if (progressData) {
          const completedIds = new Set(progressData.map(p => p.lesson_id));
          setCompleted(completedIds.has(params.id as string));
          const completedInLang = fetchedLessons.filter(l => completedIds.has(l.id)).length;
          setCompletedCount(completedInLang);
        }
      } catch (error) {
        console.error("Failed to load lesson", error);
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [user, params.id]);

  const handleRunCode = async () => {
    setRunning(true);
    setOutput("");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          code,
          language: lesson?.language || "javascript",
        }),
      });

      const result = await response.json();
      setOutput(result.output || result.error || "No output");
    } catch (error) {
      setOutput("Error running code");
    } finally {
      setRunning(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !lesson) return;

    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      completed: true,
    });

    setCompleted(true);
    setCompletedCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageSpinner label="Loading lesson data..." size="full" />
      </div>
    );
  }

  if (!user || !lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold mb-4">Lesson Not Found</h1>
          <p className="text-muted-foreground mb-8">The lesson you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path</Button>
        </div>
      </div>
    );
  }

  const parsedContent = parseLessonContent(lesson.content || "");
  const currentIdx = allLessons.findIndex(l => l.id === params.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const levelText = getLevelFromId(lesson.id);

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      <Navbar />

      {/* Top Bar */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">{levelText}</Badge>
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block truncate max-w-[200px] capitalize">
              {lesson.language}
            </span>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">/</span>
            <span className="font-semibold text-sm truncate max-w-[200px]">{lesson.title}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm mr-4">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">{completedCount}</span>/{totalLessons} completed
            </span>
          </div>
          {prevLesson && (
            <Link href={`/learn/${prevLesson.id}`}>
              <Button variant="outline" size="sm" className="hidden md:flex">Prev</Button>
            </Link>
          )}
          {nextLesson && (
            <Link href={`/learn/${nextLesson.id}`}>
              <Button variant="outline" size="sm" className="hidden md:flex">Next</Button>
            </Link>
          )}
          <Button 
            variant={completed ? "outline" : "default"} 
            size="sm" 
            onClick={handleMarkComplete}
            className={completed ? "text-green-500 border-green-500 hover:bg-green-500/10" : ""}
          >
            {completed ? <><CheckCircle className="mr-2 h-4 w-4" /> Completed</> : "Mark Complete"}
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <ContentShield>
        <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden relative h-[calc(100vh-3.5rem)] ${!hasAccess ? 'pointer-events-none select-none overflow-hidden' : ''}`}>
          
          {!hasAccess && (
            <div className="pointer-events-auto">
              <Paywall 
                lessonTitle={lesson.title} 
                price={lesson.price || 0} 
                userId={user.id}
                itemId={lesson.id}
              />
            </div>
          )}
          
          {/* Left Pane - Theory & Content */}
          <div className="w-full lg:w-[45%] h-full flex flex-col border-r bg-card overflow-y-auto custom-scrollbar">
              <div className="p-6 md:p-8 space-y-8">
                
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">Lesson {currentIdx + 1} of {totalLessons}</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
                  {parsedContent.definition && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
                      <Lightbulb className="h-6 w-6 text-primary shrink-0" />
                      <div>
                        <h3 className="font-semibold text-primary mb-1">Concept Definition</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{parsedContent.definition}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Theory Sections */}
                {parsedContent.theory.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b pb-2 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      Understanding {lesson.title}
                    </h2>
                    <div className="space-y-5">
                      {parsedContent.theory.map((paragraph, idx) => (
                        <div key={idx}>
                          <p className="text-sm text-muted-foreground leading-relaxed">{paragraph}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Example reference (Read-only reference) */}
                {lesson.codeExample && (
                  <div className="bg-[#1e1e1e] rounded-xl border border-border overflow-hidden">
                    <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-[#404040]">
                      <Code className="h-4 w-4 text-gray-300" />
                      <span className="text-xs font-medium text-gray-300">Reference Example</span>
                    </div>
                    <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                      {lesson.codeExample}
                    </pre>
                  </div>
                )}

                {/* Summary */}
                {parsedContent.summary.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Summary</h2>
                    <ul className="space-y-2">
                      {parsedContent.summary.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pb-10" />
              </div>
            </div>

            {/* Right Pane - Code Playground */}
            <div className="w-full lg:w-[55%] h-full flex flex-col bg-[#1e1e1e] relative">
              
              {/* Editor Header */}
              <div className="h-12 bg-[#2d2d2d] flex items-center justify-between px-4 shrink-0 border-b border-[#404040]">
                <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                  <Code className="h-4 w-4" />
                  Practice Environment ({lesson.language})
                </div>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs gap-1"
                  onClick={handleRunCode}
                  disabled={running}
                >
                  {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  Run Code
                </Button>
              </div>

              {/* Editor Area */}
              <div className="flex-1 relative">
                <MonacoEditor
                  language={lesson.language === "python" ? "python" : "javascript"}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                  }}
                />
              </div>

              {/* Console Output */}
              <div className="h-[25%] min-h-[150px] bg-[#1e1e1e] border-t border-[#404040] flex flex-col shrink-0">
                <div className="px-4 py-2 bg-[#2d2d2d] text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-[#404040]">
                  Console Output
                </div>
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm z-10">
                  {output ? (
                    <pre className={`whitespace-pre-wrap ${output.includes("Error") ? "text-red-400" : "text-gray-300"}`}>
                      {output}
                    </pre>
                  ) : (
                    <p className="text-gray-500 italic">Click 'Run Code' to test your learning...</p>
                  )}
                </div>
              </div>
              
              {/* AI Chat Overlay Container */}
              <div className="absolute right-4 bottom-4 w-80 shadow-2xl z-20">
                <LessonChat
                  lessonTitle={lesson.title}
                  lessonContent={lesson.content}
                  currentCode={code}
                  language={lesson.language}
                />
              </div>

            </div>
          </div>
        </ContentShield>
    </div>
  );
}
