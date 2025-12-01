"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, Lesson, isSupabaseConfigured } from "@/lib/supabase";
import { CheckCircle, Play, ArrowLeft, ArrowRight, Loader2, BookOpen } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEMO_LESSONS: Record<string, Lesson> = {
  "py-01": { id: "py-01", title: "Introduction to Python", language: "python", content: "Python is a high-level programming language...", codeExample: "print('Hello, World!')", tryStarter: "# Write your first Python program\nprint('Hello!')" },
  "py-02": { id: "py-02", title: "Variables and Data Types", language: "python", content: "Variables store data values...", codeExample: "name = 'Alice'\nage = 25", tryStarter: "# Create variables\nname = ''" },
  "py-03": { id: "py-03", title: "Operators", language: "python", content: "Python supports various operators...", codeExample: "a = 10\nb = 5\nprint(a + b)", tryStarter: "# Try operators\nx = 10" },
  "js-01": { id: "js-01", title: "Introduction to JavaScript", language: "javascript", content: "JavaScript is a versatile language...", codeExample: "console.log('Hello, World!');", tryStarter: "// Write your first JS program\nconsole.log('Hello!');" },
  "js-02": { id: "js-02", title: "Variables and Data Types", language: "javascript", content: "JavaScript uses let, const, var...", codeExample: "let name = 'Alice';", tryStarter: "// Create variables\nlet name = '';" },
  "ts-01": { id: "ts-01", title: "Introduction to TypeScript", language: "typescript", content: "TypeScript adds types to JavaScript...", codeExample: "let name: string = 'Alice';", tryStarter: "// Write TypeScript\nlet name: string = '';" },
  "java-01": { id: "java-01", title: "Introduction to Java", language: "java", content: "Java is an object-oriented language...", codeExample: "System.out.println(\"Hello\");", tryStarter: "// Java basics\n" },
  "c-01": { id: "c-01", title: "Introduction to C", language: "c", content: "C is a powerful systems language...", codeExample: "printf(\"Hello\");", tryStarter: "// C basics\n" },
  "cpp-01": { id: "cpp-01", title: "Introduction to C++", language: "cpp", content: "C++ extends C with OOP...", codeExample: "cout << \"Hello\";", tryStarter: "// C++ basics\n" },
};

const DEMO_LESSONS_LIST = [
  { id: "py-01", language: "python" },
  { id: "py-02", language: "python" },
  { id: "py-03", language: "python" },
  { id: "js-01", language: "javascript" },
  { id: "js-02", language: "javascript" },
  { id: "ts-01", language: "typescript" },
  { id: "java-01", language: "java" },
  { id: "c-01", language: "c" },
  { id: "cpp-01", language: "cpp" },
];

const FALLBACK_LESSON: Lesson = {
  id: "demo",
  title: "Demo Lesson",
  language: "python",
  content: "This is a demo lesson. Configure Supabase to see real content.",
  codeExample: "print('Hello!')",
  tryStarter: "# Demo code\nprint('Hello!')"
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user || !params.id) return;

    async function loadLesson() {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        const lessonId = params.id as string;
        const demoLesson = DEMO_LESSONS[lessonId] || FALLBACK_LESSON;
        setLesson(demoLesson);
        setCode(demoLesson.tryStarter || "");
        const sameLangLessons = DEMO_LESSONS_LIST.filter(l => l.language === demoLesson.language);
        setAllLessons(sameLangLessons);
        setTotalLessons(sameLangLessons.length);
        setLoading(false);
        return;
      }

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", params.id)
        .single();

      const { data: allLessonsData } = await supabase
        .from("lessons")
        .select("id, language")
        .order("id");

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (lessonData) {
        const mappedLesson: Lesson = {
          id: lessonData.id,
          title: lessonData.title,
          content: lessonData.content,
          codeExample: lessonData.codeexample || lessonData.codeExample || "",
          tryStarter: lessonData.trystarter || lessonData.tryStarter || "",
          language: lessonData.language,
        };
        setLesson(mappedLesson);
        setCode(mappedLesson.tryStarter || "");

        if (allLessonsData) {
          const sameLangLessons = allLessonsData.filter(l => l.language === lessonData.language);
          setAllLessons(sameLangLessons);
          setTotalLessons(sameLangLessons.length);
        }
      } else {
        setLesson(FALLBACK_LESSON);
        setCode(FALLBACK_LESSON.tryStarter || "");
      }

      if (progressData) {
        const completedIds = new Set(progressData.map(p => p.lesson_id));
        setCompleted(completedIds.has(params.id as string));

        if (allLessonsData && lessonData) {
          const sameLangLessons = allLessonsData.filter(l => l.language === lessonData.language);
          const completedInLang = sameLangLessons.filter(l => completedIds.has(l.id)).length;
          setCompletedCount(completedInLang);
        }
      }

      setLoading(false);
    }

    loadLesson();
  }, [user, params.id]);

  const handleRunCode = async () => {
    setRunning(true);
    setOutput("");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    if (isSupabaseConfigured()) {
      await supabase.from("lesson_progress").upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
      });
    }

    setCompleted(true);
    setCompletedCount(prev => prev + 1);
  };

  const getCurrentIndex = () => {
    return allLessons.findIndex(l => l.id === params.id);
  };

  const getPrevLesson = () => {
    const idx = getCurrentIndex();
    return idx > 0 ? allLessons[idx - 1] : null;
  };

  const getNextLesson = () => {
    const idx = getCurrentIndex();
    return idx < allLessons.length - 1 ? allLessons[idx + 1] : null;
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      python: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      javascript: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      typescript: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      java: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      c: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      cpp: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[lang] || "bg-gray-500/10 text-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !lesson) return null;

  const prevLesson = getPrevLesson();
  const nextLesson = getNextLesson();
  const currentIdx = getCurrentIndex();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/learn?lang=${lesson.language}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to {lesson.language} lessons
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{completedCount}</span>/{totalLessons} completed
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Lesson {currentIdx + 1} of {totalLessons}</span>
              </div>
              <h1 className="text-3xl font-bold mb-3">{lesson.title}</h1>
              <Badge className={getLanguageColor(lesson.language)}>
                {lesson.language}
              </Badge>
            </div>
            {completed && (
              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground">{lesson.content}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="code-block">
                  <pre className="text-sm">{lesson.codeExample}</pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Try It Yourself</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="300px"
                    language={lesson.language === "python" ? "python" : "javascript"}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      padding: { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                <Button onClick={handleRunCode} disabled={running} className="w-full">
                  {running ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Output:</p>
                  <pre className="text-sm whitespace-pre-wrap font-mono min-h-[60px]">
                    {output || "Click 'Run Code' to see output..."}
                  </pre>
                </div>
                {!completed && (
                  <Button onClick={handleMarkComplete} variant="outline" className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t pt-6">
          {prevLesson ? (
            <Link href={`/learn/${prevLesson.id}`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Previous Lesson
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link href={`/learn/${nextLesson.id}`}>
              <Button className="gap-2">
                Next Lesson
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/learn?lang=${lesson.language}`}>
              <Button className="gap-2">
                Back to All Lessons
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
