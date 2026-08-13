// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/page-spinner";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Play,
  Loader2,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Check,
  Code,
  Compass,
  Layers,
  Cpu,
  AlertCircle,
  HelpCircle,
  Wrench,
  XCircle,
  Menu,
  X,
  Eye,
} from "lucide-react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/components/AuthProvider";
import LessonChat from "@/app/learn/_components/LessonChat";
import { ContentShield } from "@/components/ContentShield";
import { Paywall } from "@/components/Paywall";
import { hasUserPurchasedLesson, purchaseLesson } from "@/lib/api";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Lazy-loads highlight.js from a CDN and re-highlights whenever content changes.
const SyntaxMarkdown = ({ children }: { children: string }) => {
  useEffect(() => {
    if (!document.getElementById("hljs-style")) {
      const link = document.createElement("link");
      link.id = "hljs-style";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("hljs-script")) {
      const script = document.createElement("script");
      script.id = "hljs-script";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
      script.onload = () => {
        if ((window as any).hljs) (window as any).hljs.highlightAll();
      };
      document.head.appendChild(script);
    } else {
      if ((window as any).hljs) setTimeout(() => (window as any).hljs.highlightAll(), 100);
    }
  }, [children]);

  return <ReactMarkdown>{children}</ReactMarkdown>;
};

// Rule-based checker used for the final module project's requirements checklist.
const validateHTMLCode = (code: string, rules: any[]) => {
  return rules.map((ruleObj) => {
    const rule = ruleObj.rule || ruleObj.requirement;
    const id = ruleObj.id || rule;
    let passed = false;
    const cleanCode = code.toLowerCase();

    if (rule.includes("<!DOCTYPE html>")) {
      passed = cleanCode.includes("<!doctype html>");
    } else if (rule.includes("<html>") || rule.includes("head") || rule.includes("body")) {
      passed = cleanCode.includes("<html") && cleanCode.includes("<head") && cleanCode.includes("<body");
    } else if (rule.includes("heading tag") || rule.includes("h1") || rule.includes("heading Level") || rule.includes("six heading tags")) {
      if (rule.includes("all six heading tags")) {
        passed = ["h1", "h2", "h3", "h4", "h5", "h6"].every((h) => cleanCode.includes(`<${h}`));
      } else if (rule.includes("h1")) {
        passed = cleanCode.includes("<h1");
      } else {
        passed = /<h[1-6]/.test(cleanCode);
      }
    } else if (rule.includes("paragraph") || rule.includes("<p>")) {
      const matchCount = (cleanCode.match(/<p/g) || []).length;
      if (rule.includes("two <p> tags")) {
        passed = matchCount >= 2;
      } else if (rule.includes("4 <p> tags") || rule.includes("at least 4")) {
        passed = matchCount >= 4;
      } else {
        passed = matchCount >= 1;
      }
    } else if (rule.includes("<strong>") || rule.includes("em") || rule.includes("bold") || rule.includes("italic")) {
      if (rule.includes("strong") && rule.includes("em")) {
        passed = cleanCode.includes("<strong") && cleanCode.includes("<em");
      } else if (rule.includes("strong") || rule.includes("bold")) {
        passed = cleanCode.includes("<strong");
      } else if (rule.includes("em") || rule.includes("italic")) {
        passed = cleanCode.includes("<em");
      }
    } else if (rule.includes("title must not be empty") || rule.includes("<title>")) {
      const match = code.match(/<title>([\s\S]*?)<\/title>/i);
      passed = !!match && match[1].trim().length > 0;
    } else if (rule.includes("style tag") || rule.includes("inline styles")) {
      passed = !cleanCode.includes("<style") && !cleanCode.includes("style=");
    } else if (rule.includes("website") || rule.includes("explainer") || rule.includes("explaining what a website is")) {
      passed = cleanCode.includes("<h2") && cleanCode.includes("<p");
    } else if (rule.includes("4 steps") || rule.includes("at least 4 steps")) {
      passed = (cleanCode.match(/step \d/g) || []).length >= 4 || (cleanCode.match(/<li>/g) || []).length >= 4;
    } else if (rule.includes("browser does")) {
      passed = cleanCode.includes("browser");
    } else if (rule.includes("at least 3 important terms")) {
      const terms = ["dom", "dns", "server", "ip", "client", "url", "http", "html", "css", "javascript"];
      const boldMatch = code.match(/<strong>([\s\S]*?)<\/strong>/gi) || [];
      let count = 0;
      boldMatch.forEach((m) => {
        const inner = m.replace(/<\/?strong>/gi, "").toLowerCase();
        if (terms.some((t) => inner.includes(t))) count++;
      });
      passed = count >= 3 || boldMatch.length >= 3;
    } else if (rule.includes("title in <head> should match")) {
      const titleMatch = code.match(/<title>([\s\S]*?)<\/title>/i);
      const h1Match = code.match(/<h1>([\s\S]*?)<\/h1>/i);
      passed = !!titleMatch && !!h1Match && titleMatch[1].trim().toLowerCase() === h1Match[1].trim().toLowerCase();
    } else {
      passed = true;
    }

    return { id, rule, passed };
  });
};

export default function LessonPracticePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get("category");

  const { user, session, loading: authLoading } = useAuth();
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  // Checkpoint states
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [orderingAnswers, setOrderingAnswers] = useState<Record<string, number[]>>({});
  const [checkpointStatus, setCheckpointStatus] = useState<Record<string, string>>({});

  // Challenge states
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [challengePassed, setChallengePassed] = useState(false);
  const [showChallengeSuccess, setShowChallengeSuccess] = useState(false);

  // Project states
  const [projectValidationResults, setProjectValidationResults] = useState<any[]>([]);
  const [projectPassed, setProjectPassed] = useState(false);
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const [iframeSrcDoc, setIframeSrcDoc] = useState("");
  const [activeTab, setActiveTab] = useState("preview");

  // Editor features
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [notes, setNotes] = useState("");

  // Sidebar & navigation state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [curriculumTree, setCurriculumTree] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});

  const [timeSpent, setTimeSpent] = useState(0);

  // Restore persisted notes/time/hints for this lesson, and keep tracking time spent.
  useEffect(() => {
    if (params.slug && params.slug.length === 3) {
      const lessonId = params.slug[2];

      const savedNotes = localStorage.getItem(`notes_${lessonId}`);
      if (savedNotes) setNotes(savedNotes);

      const savedTime = localStorage.getItem(`time_${lessonId}`);
      if (savedTime) setTimeSpent(parseInt(savedTime, 10));

      const savedHints = localStorage.getItem(`hints_${lessonId}`);
      if (savedHints) setHintLevel(parseInt(savedHints, 10));

      const interval = setInterval(() => {
        setTimeSpent((prev) => {
          const newTime = prev + 1;
          localStorage.setItem(`time_${lessonId}`, newTime.toString());
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [params.slug]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !params.slug || params.slug.length !== 3) return;
    const [level, moduleId, lessonId] = params.slug as string[];

    async function fetchLesson() {
      setLoading(true);
      try {
        const url = `/api/practice/${level}/${moduleId}/${lessonId}${categoryQuery ? `?category=${encodeURIComponent(categoryQuery)}` : ""}`;

        // The curriculum tree and progress lookup don't depend on the lesson
        // response, so fire all three requests concurrently instead of
        // waiting on the lesson fetch before starting the other two.
        const [res, treeRes, progressResult] = await Promise.all([
          fetch(url),
          fetch(`/api/practice?category=${encodeURIComponent(categoryQuery || "Web dev")}`),
          supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", user.id),
        ]);

        if (res.ok) {
          const data = await res.json();
          setLessonData(data);

          if (lessonId === "project") {
            setCode(
              "<!DOCTYPE html>\n<html>\n  <head>\n    <title>Web Development Explainer</title>\n  </head>\n  <body>\n    <!-- Write your final project code here -->\n\n  </body>\n</html>"
            );
          } else if (data.lesson?.coding_quest?.starter_code?.code) {
            setCode(data.lesson.coding_quest.starter_code.code);
          } else if (data.lesson?.codingChallenge?.starterCode) {
            setCode(data.lesson.codingChallenge.starterCode);
          } else if (data.lesson?.basicCode?.code) {
            setCode(data.lesson.basicCode.code);
          } else if (data.lesson?.mini_challenge) {
            const challengeLines = data.lesson.mini_challenge.split("\n");
            const commentedChallenge = challengeLines.map((line: string) => `// ${line}`).join("\n");
            setCode(`${commentedChallenge}\n\n// Write your solution below\nfunction solution() {\n  \n}`);
          } else {
            setCode("// Write your code here to practice the concepts\nconsole.log('Ready to practice!');");
          }

          const progressId =
            lessonId === "project"
              ? data.module?.finalModuleProject?.projectId || `${moduleId}-project`
              : lessonId;

          if (treeRes.ok) {
            const treeData = await treeRes.json();
            setCurriculumTree(treeData);

            let moduleIndex = -1;
            let isFound = false;
            for (const lvl of treeData) {
              for (const mod of lvl.modules) {
                if (!isFound) {
                  moduleIndex++;
                  if (mod.moduleId === moduleId) {
                    isFound = true;
                  }
                }
              }
            }
            
            if (isFound && moduleIndex >= 3) {
              const purchased = await hasUserPurchasedLesson(user.id, "practice_premium_bundle");
              setHasAccess(purchased);
            } else {
              setHasAccess(true);
            }
          }

          const allProgress = progressResult.data;

          if (allProgress) {
            const progressMap: Record<string, boolean> = {};
            allProgress.forEach((p: any) => {
              progressMap[p.lesson_id] = p.completed;
            });
            setUserProgress(progressMap);
            if (progressMap[progressId]) {
              setCompleted(true);
            }
          }
        } else {
          console.error("Lesson not found");
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [user, params.slug]);

  const markComplete = async () => {
    if (!user || !lessonData) return;
    const [, moduleId, lessonIdParam] = params.slug as string[];
    const progressId =
      lessonIdParam === "project"
        ? lessonData.module?.finalModuleProject?.projectId || `${moduleId}-project`
        : lessonData.lesson.lessonId;

    try {
      await supabase.from("lesson_progress").upsert({
        user_id: user.id,
        lesson_id: progressId,
        completed: true,
      });
      setCompleted(true);
      setUserProgress((prev) => ({ ...prev, [progressId]: true }));
    } catch (error) {
      console.error("Failed to mark as complete", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageSpinner label="Loading lesson data..." size="full" />
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold mb-4">Lesson Not Found</h1>
          <p className="text-muted-foreground mb-8">The practice lesson you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Practice Arena
          </Button>
        </div>
      </div>
    );
  }

  const { module, lesson, category, prev, next } = lessonData;
  const [level, moduleId, lessonId] = params.slug as string[];
  const isProjectView = lessonId === "project";
  const projectData = module?.finalModuleProject;
  const editorLanguage =
    isProjectView ||
    lesson?.language === "html" ||
    (lesson?.sections && lesson.sections.some((s: any) => s.type === "codeLesson" && s.language === "html"))
      ? "html"
      : "javascript";

  const handleRunCode = async () => {
    setRunning(true);
    setOutput("");

    if (editorLanguage === "html") {
      setIframeSrcDoc(code);
      setOutput("Rendered successfully inside the Live Preview tab!");
      setActiveTab("preview");
      setRunning(false);
      return;
    }

    try {
      const startTime = performance.now();
      let codeToRun = code;

      const lessonTestCases = lesson?.test_cases || lesson?.coding_quest?.test_cases;
      if (lessonTestCases && lessonTestCases.length > 0) {
        const isQuest = !!lesson?.coding_quest;
        const testRunner = `\nconst testCases = ${JSON.stringify(lessonTestCases)};\nconst results = [];\nfor (let i = 0; i < testCases.length; i++) {\n   const tc = testCases[i];\n   try {\n     const actual = ${isQuest ? "eval(tc.input)" : "solution(tc.input)"};\n     if (JSON.stringify(actual) === JSON.stringify(tc.expected)) {\n         results.push({ pass: true, input: tc.input, expected: tc.expected, actual: actual });\n     } else {\n         results.push({ pass: false, input: tc.input, expected: tc.expected, actual: actual });\n     }\n   } catch(e) {\n     results.push({ pass: false, input: tc.input, expected: tc.expected, error: e.message });\n   }\n}\nconsole.log("===TEST_RESULTS===" + JSON.stringify(results));\n`;
        codeToRun = code + "\n\n" + testRunner;
      }

      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ code: codeToRun, language: "javascript", testInput: "" }),
      });
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));

      const result = await response.json();
      let outputText = result.output || result.error || "No output";

      if (outputText.includes("===TEST_RESULTS===")) {
        const parts = outputText.split("===TEST_RESULTS===");
        try {
          const parsedResults = JSON.parse(parts[1].trim());
          setTestResults(parsedResults);
          outputText = parts[0].trim() || "Tests completed.";
        } catch (e) {
          console.error("Failed to parse test results");
        }
      } else {
        setTestResults(null);
        if (result.error) {
          const lineMatch =
            result.error.match(/at [a-zA-Z0-9_]+ \([^:]+:(\d+):(\d+)\)/) || result.error.match(/eval.*:(\d+):(\d+)/);
          if (lineMatch) {
            outputText = `\n[Line Error Detected: roughly line ${lineMatch[1]}]\n${result.error}`;
          }
        }
      }

      setOutput(outputText);
      setActiveTab("console");
    } catch (error) {
      setOutput("Error running code");
    } finally {
      setRunning(false);
    }
  };

  const renderCheckpoint = (cp: any) => {
    const status = checkpointStatus[cp.checkpointId] || "unsolved";
    const selectedIndex = quizAnswers[cp.checkpointId];
    const answeredOrder = orderingAnswers[cp.checkpointId] || [];

    return (
      <div
        key={cp.checkpointId}
        className={`border rounded-2xl p-6 my-8 shadow-sm relative overflow-hidden transition-all duration-500 ${
          status === "correct"
            ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            : status === "incorrect"
            ? "border-rose-500/50 bg-rose-500/5"
            : "border-primary/40 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none text-xs">Checkpoint Quiz</Badge>
          <span className="text-xs text-muted-foreground">+{cp.xpReward} XP</span>
        </div>

        <p className="font-bold text-sm text-foreground mb-4">{cp.question}</p>

        {(cp.type === "multiple_choice" || cp.type === "scenario") && cp.options && (
          <div className="space-y-2">
            {cp.options.map((option: string, idx: number) => {
              const isSelected = selectedIndex === idx;
              let btnClass = "w-full justify-start text-left border px-4 py-3 rounded-lg text-xs leading-relaxed transition-all ";
              if (status === "correct") {
                btnClass +=
                  idx === cp.correctOptionIndex
                    ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300 font-medium"
                    : "opacity-60 border-border bg-transparent text-muted-foreground";
              } else if (status === "incorrect" && isSelected) {
                btnClass += "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300 font-medium";
              } else {
                btnClass += isSelected
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "bg-card hover:bg-secondary/40 border-border text-muted-foreground";
              }
              return (
                <button
                  key={idx}
                  className={btnClass}
                  disabled={status === "correct"}
                  onClick={() => {
                    setQuizAnswers((prev) => ({ ...prev, [cp.checkpointId]: idx }));
                    setCheckpointStatus((prev) => ({
                      ...prev,
                      [cp.checkpointId]: idx === cp.correctOptionIndex ? "correct" : "incorrect",
                    }));
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {cp.type === "ordering" && cp.items && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground italic">Click the items in the correct order to arrange them:</p>
            <div className="flex flex-wrap gap-2">
              {cp.items.map((item: string, idx: number) => {
                const orderIndex = answeredOrder.indexOf(idx);
                const isSelected = orderIndex !== -1;
                return (
                  <button
                    key={idx}
                    disabled={status === "correct" || isSelected}
                    className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? "bg-secondary border-dashed text-muted-foreground opacity-50"
                        : "bg-card border-border hover:border-primary text-foreground"
                    }`}
                    onClick={() => {
                      const current = orderingAnswers[cp.checkpointId] || [];
                      setOrderingAnswers((prev) => ({ ...prev, [cp.checkpointId]: [...current, idx] }));
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {answeredOrder.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-foreground">Your Sequence:</span>
                  {status !== "correct" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                      onClick={() => {
                        setOrderingAnswers((prev) => ({ ...prev, [cp.checkpointId]: [] }));
                        setCheckpointStatus((prev) => ({ ...prev, [cp.checkpointId]: "unsolved" }));
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {answeredOrder.map((idx, orderNum) => (
                    <div key={idx} className="flex items-center gap-2 bg-secondary/40 p-2 rounded border text-xs">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                        {orderNum + 1}
                      </span>
                      <span className="text-muted-foreground">{cp.items[idx]}</span>
                    </div>
                  ))}
                </div>

                {status !== "correct" && answeredOrder.length === cp.items.length && (
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      const userOrder = orderingAnswers[cp.checkpointId] || [];
                      const isCorrect =
                        userOrder.length === cp.correctOrder.length &&
                        userOrder.every((val, index) => val === cp.correctOrder[index]);
                      setCheckpointStatus((prev) => ({ ...prev, [cp.checkpointId]: isCorrect ? "correct" : "incorrect" }));
                    }}
                  >
                    Verify Sequence
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {status === "correct" && (
          <div className="mt-4 p-4 border border-green-500/20 bg-green-500/10 rounded-lg text-xs leading-relaxed space-y-2">
            <p className="font-bold text-green-700 dark:text-green-300 flex items-center gap-1">
              <Check className="h-4 w-4" /> Correct!
            </p>
            <p className="text-muted-foreground">{cp.explanation}</p>
          </div>
        )}

        {status === "incorrect" && (
          <div className="mt-4 p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-xs leading-relaxed space-y-2">
            <p className="font-bold text-red-700 dark:text-red-300">❌ Incorrect. Try again!</p>
            {(cp.type === "multiple_choice" || cp.type === "scenario") && (
              <p className="text-muted-foreground">Select another option to try again.</p>
            )}
            {cp.type === "ordering" && <p className="text-muted-foreground">Click &apos;Clear&apos; and retry the correct order.</p>}
          </div>
        )}
      </div>
    );
  };

  // Shared renderer for MCQ-style question lists (lesson.quiz and practice_assessment MCQs).
  const renderMcqQuestion = (q: any, qIdx: number, labelPrefix?: string) => {
    const status = checkpointStatus[q.id] || "unsolved";
    const selectedIndex = quizAnswers[q.id];
    const correctIndex = q.correct_index !== undefined ? q.correct_index : q.answer;

    return (
      <div key={q.id} className="space-y-4">
        <p className="font-bold text-sm text-foreground flex">
          <span className="text-muted-foreground mr-2 shrink-0">
            {qIdx + 1}.{labelPrefix ? ` [${labelPrefix}]` : ""}
          </span>
          <span>
            <SyntaxMarkdown>{q.question}</SyntaxMarkdown>
          </span>
        </p>

        <div className="space-y-2 pl-6">
          {q.options.map((opt: string, optIdx: number) => {
            const isSelected = selectedIndex === optIdx;
            let btnClass = "w-full justify-start text-left border px-4 py-3 rounded-lg text-xs leading-relaxed transition-all ";
            if (status === "correct") {
              btnClass +=
                optIdx === correctIndex
                  ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300 font-medium"
                  : "opacity-60 border-border bg-transparent text-muted-foreground";
            } else if (status === "incorrect" && isSelected) {
              btnClass += "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300 font-medium";
            } else {
              btnClass += isSelected
                ? "bg-primary/10 border-primary text-primary font-medium"
                : "bg-card hover:bg-secondary/40 border-border text-muted-foreground";
            }
            return (
              <button
                key={optIdx}
                className={btnClass}
                disabled={status === "correct"}
                onClick={() => {
                  setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                  setCheckpointStatus((prev) => ({ ...prev, [q.id]: optIdx === correctIndex ? "correct" : "incorrect" }));
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {status === "correct" && (
          <div className="ml-6 p-4 border border-green-500/20 bg-green-500/10 rounded-lg text-xs leading-relaxed space-y-2">
            <p className="font-bold text-green-700 dark:text-green-300 flex items-center gap-1">
              <Check className="h-4 w-4" /> Correct!
            </p>
            <div className="text-muted-foreground">
              <SyntaxMarkdown>{q.explanation}</SyntaxMarkdown>
            </div>
          </div>
        )}

        {status === "incorrect" && (
          <div className="ml-6 p-3 border border-red-500/20 bg-red-500/10 rounded-lg text-xs leading-relaxed">
            <p className="font-bold text-red-700 dark:text-red-300 flex items-center gap-1">
              <XCircle className="h-4 w-4" /> Incorrect. Try another option.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      <Navbar />

      {/* Top toolbar */}
      <div className="h-14 border-b border-border/60 flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/practice?category=${encodeURIComponent(category || "Web dev")}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="text-xs">
              L{module.level}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block truncate max-w-[200px]">
              {module.title}
            </span>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">/</span>
            <span className="font-semibold text-sm truncate max-w-[200px]">
              {isProjectView ? projectData?.title : lesson.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {prev && (
            <Link href={`/practice/${prev.level}/${prev.moduleId}/${prev.lessonId}?category=${encodeURIComponent(category || "Web dev")}`}>
              <Button variant="outline" size="sm" className="hidden md:flex">Prev</Button>
            </Link>
          )}
          {next && (
            <Link href={`/practice/${next.level}/${next.moduleId}/${next.lessonId}?category=${encodeURIComponent(category || "Web dev")}`}>
              <Button variant="outline" size="sm" className="hidden md:flex">Next</Button>
            </Link>
          )}
          {isProjectView ? (
            <Button
              variant={projectSubmitted ? "outline" : "default"}
              size="sm"
              disabled={projectSubmitted || !projectPassed}
              onClick={async () => {
                await markComplete();
                setProjectSubmitted(true);
              }}
              className={
                projectSubmitted
                  ? "text-green-500 border-green-500"
                  : projectPassed
                  ? "bg-green-600 hover:bg-green-700"
                  : "opacity-60"
              }
            >
              {projectSubmitted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Submitted
                </>
              ) : (
                "Submit Project"
              )}
            </Button>
          ) : (
            <Button
              variant={completed ? "outline" : "default"}
              size="sm"
              onClick={markComplete}
              className={completed ? "text-green-500 border-green-500 hover:bg-green-500/10" : ""}
            >
              {completed ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Completed
                </>
              ) : (
                "Mark Complete"
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Collapsible curriculum sidebar (Always visible regardless of access so user can navigate) */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/60 shadow-lg flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top-left",
            sidebarOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none lg:hidden lg:scale-100 lg:opacity-100 lg:pointer-events-auto"
          )}
        >
          <div className="p-4 border-b border-border/60 flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-foreground">Curriculum</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
            {curriculumTree.map((lvl: any) => (
              <div key={lvl.level} className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">{lvl.title}</h3>
                {lvl.modules.map((mod: any) => (
                  <div key={mod.moduleId} className="mt-2">
                    <div className="text-xs font-semibold px-2 mb-1 truncate text-foreground/80">{mod.title}</div>
                    <div className="space-y-0.5">
                      {mod.lessons.map((l: any) => {
                        const isCurrent = l.lessonId === lessonId;
                        const isCompleted = userProgress[l.lessonId];
                        return (
                          <Link
                            key={l.lessonId}
                            href={`/practice/${lvl.level}/${mod.moduleId}/${l.lessonId}?category=${encodeURIComponent(category || "Web dev")}`}
                            className={`block px-2 py-1.5 text-xs rounded-md transition-colors ${
                              isCurrent
                                ? "bg-primary/20 text-primary font-medium"
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate pr-2">{l.title}</span>
                              {isCompleted && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <ContentShield>
            <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden relative h-[calc(100vh-3.5rem)] w-full ${!hasAccess ? 'pointer-events-none select-none overflow-hidden' : ''}`}>
              
              {!hasAccess && (
                <div className="pointer-events-auto">
                  <Paywall 
                    lessonTitle="Full Practice Unlock"
                    description="You've completed the free preview of the practice section! Purchase the Practice Bundle to unlock all remaining modules and advanced levels."
                    price={499} 
                    userId={user.id}
                    itemId="practice_premium_bundle"
                  />
                </div>
              )}
              
              {/* Left pane: lesson / project content */}
              <div className="w-full lg:w-[45%] h-full flex flex-col border-r border-border/60 bg-card overflow-y-auto custom-scrollbar">
          <div className="p-6 md:p-8 space-y-8">
            {isProjectView ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/20 text-primary border-none text-xs">Final Module Project</Badge>
                    <span className="text-xs text-muted-foreground">
                      {projectData?.estimatedTime} • +{projectData?.xpReward} XP
                    </span>
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-foreground">{projectData?.title}</h1>
                </div>

                <div className="bg-secondary/40 border border-border/60 rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-foreground">Project Goal</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{projectData?.goal}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{projectData?.description}</p>
                </div>

                {projectData?.requirements && (
                  <div className="space-y-3 border-t border-border/60 pt-4">
                    <h3 className="font-semibold text-foreground">Requirements Checklist</h3>
                    <div className="space-y-2">
                      {projectData.requirements.map((req: any, idx: number) => {
                        const hasRun = projectValidationResults.length > 0;
                        const check = projectValidationResults.find((r) => r.id === req.id);
                        const passed = check ? check.passed : false;
                        return (
                          <div key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                            {hasRun ? (
                              passed ? (
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                              )
                            ) : (
                              <div className="h-5 w-5 rounded-full border border-muted-foreground/40 shrink-0 mt-0.5" />
                            )}
                            <span className={hasRun ? (passed ? "text-green-700 dark:text-green-300 font-medium" : "text-red-700 dark:text-red-300") : ""}>
                              {req.requirement}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {projectData?.rubric && (
                  <div className="space-y-3 border-t border-border/60 pt-4">
                    <h3 className="font-semibold text-foreground">Grading Rubric</h3>
                    <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm bg-card divide-y divide-border/60">
                      {projectData.rubric.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 text-xs leading-relaxed">
                          <span className="font-medium text-muted-foreground">{item.criterion}</span>
                          <span className="font-bold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded">{item.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {projectPassed && !projectSubmitted && (
                  <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-xl text-center space-y-3 mt-4">
                    <h4 className="font-bold text-green-700 dark:text-green-300">All Checks Passed!</h4>
                    <p className="text-xs text-muted-foreground">Click &quot;Submit Project&quot; at the top right to complete the module.</p>
                  </div>
                )}
              </div>
            ) : lesson.sections && lesson.sections.length > 0 ? (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">{lesson.title}</h1>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">{lesson.lessonGoal}</p>
                </div>

                {module?.lessons?.length > 0 && module.lessons[0].lessonId === lessonId && (
                  <div className="space-y-6 mt-8 mb-8 pb-8 border-b border-border/40">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Module Overview</h2>

                    {module.why_companies_ask_this && (
                      <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl p-6 mb-6">
                        <h3 className="font-bold text-indigo-500 flex items-center gap-2 mb-3">
                          <Compass className="h-5 w-5" />
                          {module.why_companies_ask_this.title || "Why Companies Ask This"}
                        </h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                          <SyntaxMarkdown>{module.why_companies_ask_this.content}</SyntaxMarkdown>
                        </div>
                        {module.why_companies_ask_this.company_specific && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {module.why_companies_ask_this.company_specific.map((cs: any, idx: number) => (
                              <div key={idx} className="bg-background rounded-lg p-3 border border-border/60 text-sm">
                                <span className="font-bold text-foreground block">{cs.company}</span>
                                <span className="text-muted-foreground">{cs.insight}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {module.complexity_cheat_sheet && (
                      <div className="border border-border/60 rounded-xl p-6 bg-card mb-6 overflow-x-auto">
                        <h3 className="font-bold text-foreground flex items-center gap-2 mb-2">
                          <Layers className="h-5 w-5" />
                          {module.complexity_cheat_sheet.title || "Complexity Cheat Sheet"}
                        </h3>
                        {module.complexity_cheat_sheet.note && (
                          <p className="text-sm text-muted-foreground mb-4">{module.complexity_cheat_sheet.note}</p>
                        )}

                        {module.complexity_cheat_sheet.complexity_classes && (
                          <table className="w-full text-sm text-left mb-6 border-collapse">
                            <thead className="bg-secondary/50">
                              <tr>
                                <th className="p-3 font-semibold border-b border-border/60">Notation</th>
                                <th className="p-3 font-semibold border-b border-border/60">Name</th>
                                <th className="p-3 font-semibold border-b border-border/60 hidden md:table-cell">Example</th>
                                <th className="p-3 font-semibold border-b border-border/60">Scales at N=1M</th>
                              </tr>
                            </thead>
                            <tbody>
                              {module.complexity_cheat_sheet.complexity_classes.map((cc: any, idx: number) => (
                                <tr key={idx} className="border-b border-border/60 last:border-0 hover:bg-secondary/20">
                                  <td className="p-3 font-mono text-primary font-bold">{cc.notation}</td>
                                  <td className="p-3">{cc.name}</td>
                                  <td className="p-3 text-muted-foreground hidden md:table-cell">{cc.example}</td>
                                  <td className="p-3 font-mono text-xs text-muted-foreground">{cc.scales_at_n_million}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {module.complexity_cheat_sheet.rules && (
                            <div>
                              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Rules</h4>
                              <ul className="space-y-2">
                                {module.complexity_cheat_sheet.rules.map((rule: string, idx: number) => (
                                  <li key={idx} className="text-sm flex gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                    <span>
                                      <SyntaxMarkdown>{rule}</SyntaxMarkdown>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {module.complexity_cheat_sheet.common_interview_traps && (
                            <div>
                              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Common Traps</h4>
                              <ul className="space-y-2">
                                {module.complexity_cheat_sheet.common_interview_traps.map((trap: string, idx: number) => (
                                  <li key={idx} className="text-sm flex gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                    <span>
                                      <SyntaxMarkdown>{trap}</SyntaxMarkdown>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {module.pattern_index && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="border border-border/60 rounded-xl p-4 bg-card">
                          <h4 className="font-bold text-sm text-foreground mb-3">Patterns Introduced</h4>
                          <div className="flex flex-wrap gap-2">
                            {module.pattern_index.patterns_introduced?.map((pat: string, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {pat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="border border-border/60 rounded-xl p-4 bg-card">
                          <h4 className="font-bold text-sm text-foreground mb-3">Prerequisite For</h4>
                          <div className="flex flex-wrap gap-2">
                            {module.pattern_index.patterns_prerequisite_for?.map((pat: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="border-primary/20 text-primary">
                                {pat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {lesson.visual_explanation && (
                  <div className="border border-teal-500/20 bg-teal-500/5 p-6 rounded-xl space-y-3 mt-6 mb-6">
                    <span className="text-sm uppercase font-extrabold text-teal-600 dark:text-teal-400 tracking-wider flex items-center gap-2">
                      <Eye className="h-5 w-5" /> Visual Explanation ({lesson.visual_explanation.type.replace(/_/g, " ")})
                    </span>
                    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                      <SyntaxMarkdown>{lesson.visual_explanation.description}</SyntaxMarkdown>
                    </div>
                  </div>
                )}

                {lesson.interview_war_story && (
                  <div className="border-l-4 border-rose-500 bg-rose-500/5 p-6 rounded-r-xl space-y-4 mt-6 mb-6">
                    <span className="text-sm uppercase font-extrabold text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" /> Interview War Story
                    </span>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Context: </strong>
                        {lesson.interview_war_story.context}
                      </p>
                      <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground italic">
                        <SyntaxMarkdown>{lesson.interview_war_story.story}</SyntaxMarkdown>
                      </div>
                      <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mt-2 bg-rose-500/10 p-3 rounded">
                        Lesson: {lesson.interview_war_story.lesson}
                      </p>
                    </div>
                  </div>
                )}

                {lesson.sections.map((section: any) => {
                  const sectionContent = (
                    <div key={section.sectionId} className="space-y-4">
                      <h3 className="text-2xl font-bold border-b border-border/40 pb-3 flex items-center gap-3 mt-10 text-foreground">
                        {section.type === "definition" && <Lightbulb className="h-5 w-5 text-yellow-500" />}
                        {section.type === "mentalModel" && <Compass className="h-5 w-5 text-blue-500" />}
                        {section.type === "structure" && <Layers className="h-5 w-5 text-purple-500" />}
                        {section.type === "internalWorking" && <Cpu className="h-5 w-5 text-pink-500" />}
                        {section.type === "codeLesson" && <Code className="h-5 w-5 text-green-500" />}
                        {section.type === "realUsage" && <Wrench className="h-5 w-5 text-indigo-500" />}
                        {section.type === "failureCases" && <AlertCircle className="h-5 w-5 text-red-500" />}
                        {section.type === "engineeringThinking" && <HelpCircle className="h-5 w-5 text-orange-500" />}
                        {section.type === "debugging" && <Wrench className="h-5 w-5 text-teal-500" />}
                        {section.type === "concept" && <BookOpen className="h-5 w-5 text-indigo-500" />}
                        {section.title}
                      </h3>

                      {section.type === "definition" && (
                        <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-border prose-p:text-base prose-headings:font-bold text-foreground mb-6">
                          <SyntaxMarkdown>{section.content}</SyntaxMarkdown>
                        </div>
                      )}

                      {section.type === "mentalModel" && (
                        <div className="space-y-4">
                          {section.analogy && (
                            <div className="bg-blue-500/5 border-l-4 border-blue-500 p-6 rounded-r-xl">
                              <span className="text-sm uppercase font-extrabold text-blue-500 tracking-wider flex items-center gap-2 mb-3">Analogy</span>
                              <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                                <SyntaxMarkdown>{section.analogy}</SyntaxMarkdown>
                              </div>
                            </div>
                          )}

                          {section.mappings && section.mappings.length > 0 && (
                            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                              <div className="grid grid-cols-3 bg-secondary/50 p-3 text-xs font-bold border-b border-border/60">
                                <div>Real World</div>
                                <div>Web Equivalent</div>
                                <div>Explanation</div>
                              </div>
                              <div className="divide-y divide-border/60">
                                {section.mappings.map((mapping: any, idx: number) => (
                                  <div key={idx} className="grid grid-cols-3 p-3 text-xs text-muted-foreground leading-relaxed">
                                    <div className="font-semibold text-foreground">{mapping.realWorld}</div>
                                    <div className="font-semibold text-primary">{mapping.webEquivalent}</div>
                                    <div>{mapping.explanation}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {section.insight && (
                            <div className="border-l-4 border-amber-500 bg-amber-500/5 p-6 rounded-r-xl space-y-2 mt-6">
                              <span className="text-sm uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-2">
                                Key Insight
                              </span>
                              <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                                <SyntaxMarkdown>{section.insight}</SyntaxMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {section.type === "structure" && (
                        <div className="space-y-4">
                          {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
                          <div className="grid grid-cols-1 gap-4">
                            {section.components?.map((component: any, idx: number) => (
                              <div key={idx} className="border border-border rounded-xl p-5 bg-card hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                  <h4 className="font-bold text-lg text-primary">{component.name}</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {(component.builtWith || component.examples || []).map((tool: string, tIdx: number) => (
                                      <span key={tIdx} className="bg-secondary text-[10px] font-mono px-2 py-0.5 rounded border border-border">
                                        {tool}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs font-semibold text-foreground mb-3">{component.role}</p>
                                <div className="bg-secondary/30 rounded p-3 text-xs text-muted-foreground">
                                  <strong>Analogy:</strong> {component.analogy}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "internalWorking" && (
                        <div className="space-y-4">
                          {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
                          <div className="relative border-l border-primary/20 ml-3 pl-6 space-y-6">
                            {section.steps?.map((stepObj: any, idx: number) => (
                              <div key={idx} className="relative group">
                                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-background shadow-md">
                                  {stepObj.step}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-baseline gap-2">
                                    <h4 className="font-bold text-sm text-foreground">{stepObj.title}</h4>
                                    {stepObj.techTerm && (
                                      <span className="bg-primary/10 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded">
                                        {stepObj.techTerm}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{stepObj.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "codeLesson" && (
                        <div className="space-y-4">
                          {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
                          {section.starterCode && (
                            <div className="bg-[#1e1e1e] rounded-xl border border-border overflow-hidden">
                              <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-[#404040]">
                                <Code className="h-4 w-4 text-gray-300" />
                                <span className="text-xs font-medium text-gray-300">Code Lesson Blueprint</span>
                              </div>
                              <div className="p-4 text-xs font-mono overflow-x-auto leading-relaxed prose prose-invert max-w-none prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0">
                                <SyntaxMarkdown>{"```javascript\n" + section.starterCode + "\n```"}</SyntaxMarkdown>
                              </div>
                            </div>
                          )}
                          {section.expectedOutputDescription && (
                            <div className="bg-secondary/30 border border-border rounded-xl p-4 flex gap-3 text-xs">
                              <span className="font-bold text-foreground">Expected Output:</span>
                              <span className="text-muted-foreground">{section.expectedOutputDescription}</span>
                            </div>
                          )}
                          {section.lineByLineExplanation && section.lineByLineExplanation.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Line by Line Explainer</h4>
                              <div className="border border-border rounded-xl overflow-hidden bg-card divide-y divide-border/60">
                                {section.lineByLineExplanation.map((lineExp: any, idx: number) => (
                                  <div key={idx} className="p-3 text-xs leading-relaxed">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-primary font-mono font-bold bg-primary/10 px-1.5 py-0.5 rounded">{lineExp.line}</code>
                                      {lineExp.importance && (
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{lineExp.importance}</span>
                                      )}
                                    </div>
                                    <p className="text-muted-foreground mt-1">{lineExp.explanation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {section.type === "realUsage" && (
                        <div className="space-y-4">
                          {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {section.categories?.map((cat: any, idx: number) => (
                              <div key={idx} className="border border-border rounded-xl p-4 bg-card">
                                <h4 className="font-bold text-sm text-primary mb-1">{cat.category}</h4>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {cat.examples.map((ex: string, eIdx: number) => (
                                    <span key={eIdx} className="bg-secondary text-[10px] px-2 py-0.5 rounded font-semibold text-muted-foreground">
                                      {ex}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{cat.whatTheyDo}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "failureCases" && (
                        <div className="space-y-4">
                          {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
                          <div className="grid grid-cols-1 gap-4">
                            {section.cases?.map((c: any, idx: number) => (
                              <div key={idx} className="border border-destructive/20 bg-destructive/5 rounded-xl p-4">
                                <h4 className="font-bold text-sm text-destructive flex items-center gap-2">⚠️ {c.issue}</h4>
                                <p className="text-xs text-muted-foreground mt-2">
                                  <strong className="text-foreground">What happens:</strong> {c.whatHappens}
                                </p>
                                {c.realExample && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <strong className="text-foreground">Real-world:</strong> {c.realExample}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  <strong className="text-foreground">Fix:</strong> {c.userFix}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "engineeringThinking" && (
                        <div className="border-l-4 border-amber-500 bg-amber-500/5 rounded-r-xl p-6 space-y-4 my-6">
                          <span className="text-sm uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-2">
                            Engineering Mindset
                          </span>
                          <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                            <SyntaxMarkdown>{section.content}</SyntaxMarkdown>
                          </div>
                          {section.keyInsight && (
                            <div className="border-t border-amber-500/20 pt-3 text-xs italic text-amber-700 dark:text-amber-300">
                              <strong>Key Insight:</strong> {section.keyInsight}
                            </div>
                          )}
                        </div>
                      )}

                      {section.type === "debugging" && (
                        <div className="space-y-4">
                          {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
                          <div className="grid grid-cols-1 gap-3">
                            {section.debuggingSteps?.map((stepObj: any, idx: number) => (
                              <div key={idx} className="border border-border rounded-xl p-4 bg-card flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-primary">
                                  {stepObj.step}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-foreground">{stepObj.check}</h4>
                                  {stepObj.tool && (
                                    <span className="inline-block bg-teal-500/10 text-teal-500 text-[10px] font-mono px-1.5 py-0.5 rounded mt-1">
                                      Tool: {stepObj.tool}
                                    </span>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">{stepObj.how}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "concept" && (
                        <div className="space-y-6">
                          <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-border prose-p:text-base prose-headings:font-bold text-foreground mb-4">
                            <SyntaxMarkdown>{section.content}</SyntaxMarkdown>
                          </div>
                          {section.insight && (
                            <div className="border-l-4 border-amber-500 bg-amber-500/5 p-6 rounded-r-xl space-y-2 my-6">
                              <span className="text-sm uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-2">
                                Key Insight
                              </span>
                              <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                                <SyntaxMarkdown>{section.insight}</SyntaxMarkdown>
                              </div>
                            </div>
                          )}
                          {section.keyInsight && (
                            <div className="border-l-4 border-amber-500 bg-amber-500/5 p-6 rounded-r-xl space-y-2 my-6">
                              <span className="text-sm uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-2">
                                Key Insight
                              </span>
                              <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                                <SyntaxMarkdown>{section.keyInsight}</SyntaxMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );

                  const sectionCheckpoints = (lesson.checkpoints?.filter((cp: any) => cp.afterSectionId === section.sectionId)) || [];

                  return (
                    <div key={section.sectionId} className="space-y-6">
                      {sectionContent}
                      {sectionCheckpoints.map((cp: any) => renderCheckpoint(cp))}
                    </div>
                  );
                })}

                {lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
                  <div className="border border-primary/20 bg-card rounded-xl p-6 my-8 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary/20 text-primary border-none text-xs">Knowledge Check</Badge>
                      <span className="text-xs text-muted-foreground">Passing Score: {lesson.quiz.passing_score_percent}%</span>
                    </div>
                    <div className="space-y-8">
                      {lesson.quiz.questions.map((q: any, qIdx: number) => renderMcqQuestion(q, qIdx))}
                    </div>
                  </div>
                )}

                {lesson.practice_assessment && (
                  <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-6 my-8 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-none text-xs">Practice Assessment</Badge>
                      <span className="text-xs text-muted-foreground">Comprehensive MCQ Checkpoint</span>
                    </div>
                    <div className="space-y-8">
                      {[
                        ...(lesson.practice_assessment.theory_mcq || []).map((q: any) => ({ ...q, _type: "Theory" })),
                        ...(lesson.practice_assessment.logic_mcq || []).map((q: any) => ({ ...q, _type: "Logic" })),
                        ...(lesson.practice_assessment.syntax_mcq || []).map((q: any) => ({ ...q, _type: "Syntax" })),
                      ].map((q: any, qIdx: number) => renderMcqQuestion(q, qIdx, q._type))}
                    </div>
                  </div>
                )}

                {lesson.coding_quest && (
                  <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl p-6 my-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500/20 text-indigo-500 border-none text-xs">Coding Quest</Badge>
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded-md capitalize">
                          {lesson.coding_quest.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">+{lesson.coding_quest.xp_reward} XP</span>
                      </div>
                      {lesson.coding_quest.pattern && (
                        <Badge variant="outline" className="text-xs">
                          {lesson.coding_quest.pattern}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{lesson.coding_quest.title}</h3>
                      <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                        <SyntaxMarkdown>{lesson.coding_quest.problem_statement}</SyntaxMarkdown>
                      </div>
                    </div>
                    {lesson.coding_quest.wrong_approach_shown_first && (
                      <div className="border border-orange-500/20 bg-orange-500/5 rounded-lg p-4 space-y-3">
                        <h4 className="font-bold text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" /> The Naive Approach
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          <SyntaxMarkdown>{lesson.coding_quest.wrong_approach_shown_first.explanation}</SyntaxMarkdown>
                        </div>
                        <div className="relative">
                          <div className="absolute top-2 right-2 bg-background/80 text-[10px] px-2 py-1 rounded font-mono text-muted-foreground z-10 border border-border/60">
                            {lesson.coding_quest.wrong_approach_shown_first.naive_complexity}
                          </div>
                          <div className="prose prose-slate dark:prose-invert max-w-none prose-pre:bg-[#1e1e1e] prose-pre:border border-border">
                            <SyntaxMarkdown>{"```javascript\n" + lesson.coding_quest.wrong_approach_shown_first.naive_code + "\n```"}</SyntaxMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground flex gap-2 p-3 bg-secondary/30 rounded-lg border border-border/60">
                      <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <p>Use the IDE on the right to implement your solution! Your code will be automatically tested against the test cases.</p>
                    </div>
                  </div>
                )}

                {lesson.codingChallenge && (
                  <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 my-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border-none text-xs">Coding Challenge</Badge>
                      <span className="text-xs text-muted-foreground">
                        {lesson.codingChallenge.estimatedTime} • +{lesson.codingChallenge.xpReward} XP
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{lesson.codingChallenge.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{lesson.codingChallenge.description}</p>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground">Instructions:</h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {lesson.codingChallenge.instructions?.map((inst: string, idx: number) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-primary mt-0.5">•</span>
                            {inst}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 border-t border-border/60 pt-4">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground">Challenge Verification Checks:</h4>
                      <div className="space-y-2">
                        {lesson.codingChallenge.validationRules?.map((ruleObj: any, idx: number) => {
                          const hasRun = validationResults.length > 0;
                          const check = validationResults.find((r) => r.rule === ruleObj.rule);
                          const passed = check ? check.passed : false;
                          return (
                            <div key={idx} className="flex items-center gap-3 text-xs text-muted-foreground">
                              {hasRun ? (
                                passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                )
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-muted-foreground/40 shrink-0" />
                              )}
                              <span className={hasRun ? (passed ? "text-green-700 dark:text-green-300 font-medium" : "text-red-700 dark:text-red-300") : ""}>
                                {ruleObj.rule}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {lesson.codingChallenge.hints && lesson.codingChallenge.hints.length > 0 && (
                      <div className="bg-secondary/30 rounded-lg p-4 text-xs space-y-1.5 border border-border/60">
                        <span className="font-semibold text-foreground flex items-center gap-1">💡 Hints:</span>
                        {lesson.codingChallenge.hints.map((hint: string, hIdx: number) => (
                          <p key={hIdx} className="text-muted-foreground leading-relaxed">
                            {hint}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
                  {lesson.definition && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
                      <Lightbulb className="h-6 w-6 text-primary shrink-0" />
                      <div>
                        <h3 className="font-semibold text-primary mb-1">{lesson.definition.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.definition.content}</p>
                      </div>
                    </div>
                  )}
                </div>

                {lesson.theory && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b border-border/60 pb-2 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      {lesson.theory.title}
                    </h2>
                    <div className="space-y-5">
                      {lesson.theory.sections.map((section: any, idx: number) => (
                        <div key={idx}>
                          <h4 className="font-medium text-foreground mb-1">{section.heading}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.tagCategories && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.tagCategories.title}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {lesson.tagCategories.categories.map((cat: any, idx: number) => (
                        <div key={idx} className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                          <h3 className="font-semibold text-primary mb-1">{cat.category}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{cat.purpose}</p>
                          <div className="flex flex-wrap gap-2">
                            {cat.tags.map((tag: string, tIdx: number) => (
                              <span key={tIdx} className="bg-background border border-border text-xs px-2 py-1 rounded font-mono text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.whyThisExists && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">Why This Exists</h2>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-3">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-destructive">Problem:</strong> {lesson.whyThisExists.problem}
                      </p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-green-500">Solution:</strong> {lesson.whyThisExists.solution}
                      </p>
                    </div>
                  </div>
                )}

                {lesson.mentalModel && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.mentalModel.title}</h2>
                    <div className="space-y-1">
                      {lesson.mentalModel.explanation.map((exp: string, idx: number) =>
                        exp.trim() === "" ? (
                          <div key={idx} className="h-3" />
                        ) : (
                          <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
                            {exp}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

                {lesson.realWorldAnalogy && (
                  <div className="bg-secondary/30 rounded-xl p-5 border border-border/60">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">💡 {lesson.realWorldAnalogy.title}</h3>
                    <p className="text-sm text-muted-foreground italic">&quot;{lesson.realWorldAnalogy.content}&quot;</p>
                  </div>
                )}

                {lesson.internalWorking && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.internalWorking.title}</h2>
                    <div className="space-y-1">
                      {lesson.internalWorking.steps.map((step: string, idx: number) =>
                        step.trim() === "" ? (
                          <div key={idx} className="h-3" />
                        ) : (
                          <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
                            {step}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

                {lesson.executionFlow && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.executionFlow.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {lesson.executionFlow.flow.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="bg-secondary px-2 py-1 rounded">{step}</span>
                          {idx < lesson.executionFlow.flow.length - 1 && <span>→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.stepByStepBreakdown && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.stepByStepBreakdown.title}</h2>
                    <div className="space-y-3">
                      {lesson.stepByStepBreakdown.steps.map((step: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-secondary/20 p-3 rounded-lg border border-border/60">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {step.step}
                          </div>
                          <p className="text-sm text-foreground">{step.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(lesson.engineeringThinking || lesson.productionReality || lesson.failureScenarios || lesson.debugThinking) && (
                  <div className="space-y-6">
                    {lesson.failureScenarios && (
                      <div className="space-y-3">
                        <h2 className="text-xl font-semibold border-b border-border/60 pb-2 text-destructive">{lesson.failureScenarios.title}</h2>
                        <div className="space-y-3">
                          {lesson.failureScenarios.cases.map((scenario: any, idx: number) => (
                            <div key={idx} className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                              <p className="text-sm font-semibold text-destructive mb-1">Issue: {scenario.issue}</p>
                              <p className="text-sm text-muted-foreground">Result: {scenario.result}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {lesson.debugThinking && (
                      <div className="space-y-3">
                        <h2 className="text-xl font-semibold border-b border-border/60 pb-2 text-yellow-500">{lesson.debugThinking.title}</h2>
                        <div className="space-y-2 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                          {lesson.debugThinking.questions.map((q: string, idx: number) =>
                            q.trim() === "" ? (
                              <div key={idx} className="h-2" />
                            ) : (
                              <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-yellow-500 font-bold mt-0.5">?</span>
                                <p className="leading-relaxed">{q}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {lesson.engineeringThinking && (
                      <div className="space-y-3">
                        <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.engineeringThinking.title}</h2>
                        <div className="space-y-2">
                          {lesson.engineeringThinking.points.map((pt: string, idx: number) =>
                            pt.trim() === "" ? (
                              <div key={idx} className="h-2" />
                            ) : (
                              <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                {pt.startsWith("-") ? <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> : null}
                                <p className="leading-relaxed">{pt.startsWith("-") ? pt.substring(1).trim() : pt}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {lesson.productionReality && (
                      <div className="space-y-3">
                        <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.productionReality.title}</h2>
                        <ul className="space-y-2">
                          {lesson.productionReality.examples.map((ex: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-yellow-500 mt-0.5">⚡</span> {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {lesson.codeDeepExplanation && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.codeDeepExplanation.title}</h2>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-border">
                      <pre className="text-sm font-mono text-gray-300 mb-4 whitespace-pre-wrap">{lesson.codeDeepExplanation.code}</pre>
                      <div className="space-y-2 border-t border-[#333] pt-4">
                        {lesson.codeDeepExplanation.lineByLine.map((lineExp: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                            <code className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded font-mono shrink-0">{lineExp.line}</code>
                            <span className="text-sm text-gray-400">{lineExp.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {lesson.syntaxExamples && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">{lesson.syntaxExamples.title}</h2>
                    <div className="space-y-4">
                      {lesson.syntaxExamples.examples.map((ex: any, idx: number) => (
                        <div key={idx} className="bg-secondary/10 rounded-xl overflow-hidden border border-border/60">
                          <div className="bg-card border-b border-border/60 px-4 py-2 flex items-center justify-between">
                            <span className="font-mono text-sm font-semibold text-primary">{ex.tag}</span>
                            <span className="text-xs text-muted-foreground truncate ml-4">{ex.purpose}</span>
                          </div>
                          <div className="p-4">
                            <pre className="text-sm font-mono text-foreground overflow-x-auto">
                              <code>{ex.code}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.easyExample && (
                  <div className="bg-secondary/30 rounded-xl p-5 border border-border/60">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">💡 {lesson.easyExample.title}</h3>
                    <p className="text-sm text-muted-foreground italic">&quot;{lesson.easyExample.content}&quot;</p>
                  </div>
                )}

                {lesson.terms && lesson.terms.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">Key Terms</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lesson.terms.map((term: any, idx: number) => (
                        <div key={idx} className="bg-background border border-border/60 rounded-lg p-3">
                          <p className="font-medium text-sm text-primary mb-1">{term.term}</p>
                          <p className="text-xs text-muted-foreground">{term.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.explanation && (
                  <details className="group border border-border/50 rounded-xl overflow-hidden bg-card/30 mb-4" open>
                    <summary className="cursor-pointer bg-primary/5 p-4 font-semibold flex items-center gap-2 list-none select-none">
                      💡 Explanation
                    </summary>
                    <div className="p-5 border-t border-border/50 prose prose-sm dark:prose-invert max-w-none prose-p:my-2">
                      <SyntaxMarkdown>{lesson.explanation}</SyntaxMarkdown>
                    </div>
                  </details>
                )}

                {lesson.analogy && (
                  <details className="group border border-blue-500/30 rounded-xl overflow-hidden bg-blue-500/5 mb-4">
                    <summary className="cursor-pointer bg-blue-500/10 p-4 font-semibold flex items-center gap-2 list-none select-none text-blue-700 dark:text-blue-300">
                      🧠 Mental Model
                    </summary>
                    <div className="p-5 border-t border-blue-500/30 prose prose-sm dark:prose-invert max-w-none border-l-4 border-l-blue-500 prose-p:my-2">
                      <SyntaxMarkdown>{lesson.analogy}</SyntaxMarkdown>
                    </div>
                  </details>
                )}

                {lesson.code_example && (
                  <details className="group border border-green-500/30 rounded-xl overflow-hidden bg-green-500/5 mb-4">
                    <summary className="cursor-pointer bg-green-500/10 p-4 font-semibold flex items-center gap-2 list-none select-none text-green-700 dark:text-green-300">
                      💻 Code Example
                    </summary>
                    <div className="p-5 border-t border-green-500/30">
                      <pre className="p-4 rounded-lg bg-[#1e1e1e] border border-[#404040] text-gray-300 text-sm overflow-x-auto">
                        <code>{lesson.code_example.code}</code>
                      </pre>
                      {lesson.code_example.explanation && (
                        <div className="mt-4 prose prose-sm dark:prose-invert max-w-none text-muted-foreground prose-p:my-2">
                          <SyntaxMarkdown>{lesson.code_example.explanation}</SyntaxMarkdown>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {lesson.common_mistakes && lesson.common_mistakes.length > 0 && (
                  <details className="group border border-orange-500/30 rounded-xl overflow-hidden bg-orange-500/5 mb-4">
                    <summary className="cursor-pointer bg-orange-500/10 p-4 font-semibold flex items-center gap-2 list-none select-none text-orange-700 dark:text-orange-300">
                      ⚠️ Common Mistakes
                    </summary>
                    <div className="p-5 border-t border-orange-500/30">
                      <ul className="space-y-2">
                        {lesson.common_mistakes.map((mistake: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>
                              <SyntaxMarkdown>{mistake}</SyntaxMarkdown>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}

                {lesson.interview_relevance && (
                  <details className="group border border-purple-500/30 rounded-xl overflow-hidden bg-purple-500/5 mb-4">
                    <summary className="cursor-pointer bg-purple-500/10 p-4 font-semibold flex items-center gap-2 list-none select-none text-purple-700 dark:text-purple-300">
                      🎯 Interview Relevance
                    </summary>
                    <div className="p-5 border-t border-purple-500/30 prose prose-sm dark:prose-invert max-w-none prose-p:my-2">
                      <SyntaxMarkdown>{lesson.interview_relevance}</SyntaxMarkdown>
                    </div>
                  </details>
                )}

                {lesson.mini_challenge && (
                  <details className="group border border-yellow-500/30 rounded-xl overflow-hidden bg-yellow-500/5 mb-4" open>
                    <summary className="cursor-pointer bg-yellow-500/10 p-4 font-semibold flex items-center gap-2 list-none select-none text-yellow-700 dark:text-yellow-300">
                      🏆 Mini Challenge
                    </summary>
                    <div className="p-5 border-t border-yellow-500/30 prose prose-sm dark:prose-invert max-w-none prose-p:my-2">
                      <SyntaxMarkdown>{lesson.mini_challenge}</SyntaxMarkdown>
                    </div>
                  </details>
                )}

                {lesson.summary && lesson.summary.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b border-border/60 pb-2">Summary</h2>
                    <ul className="space-y-2">
                      {lesson.summary.map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <div className="pb-10" />

            {/* Prev / Next navigation */}
            {(prev || next) && (
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/50 pb-10">
                {prev ? (
                  <Link
                    href={`/practice/${prev.level}/${prev.moduleId}/${prev.lessonId}?category=${encodeURIComponent(category || "Web dev")}`}
                    className="group flex-1 max-w-[240px]"
                  >
                    <div className="flex items-center gap-4 px-5 py-4 bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="w-8 h-8 rounded-full bg-secondary/50 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                        <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300" />
                      </div>
                      <div className="text-left hidden sm:block overflow-hidden">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Previous</div>
                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{prev.title}</div>
                      </div>
                      <span className="sm:hidden font-medium text-sm group-hover:text-primary transition-colors">Prev</span>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}

                {next ? (
                  <Link
                    href={`/practice/${next.level}/${next.moduleId}/${next.lessonId}?category=${encodeURIComponent(category || "Web dev")}`}
                    className="group flex-1 max-w-[240px] flex justify-end"
                  >
                    <div className="flex items-center gap-4 px-5 py-4 bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md w-full justify-end">
                      <div className="text-right hidden sm:block overflow-hidden">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Next</div>
                        <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{next.title}</div>
                      </div>
                      <span className="sm:hidden font-medium text-sm group-hover:text-primary transition-colors">Next</span>
                      <div className="w-8 h-8 rounded-full bg-secondary/50 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                        <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: editor + preview/console/tests */}
        <div className="w-full lg:w-[55%] h-full flex flex-col bg-[#1e1e1e]">
          <div className="h-12 bg-[#2d2d2d] flex items-center justify-between px-4 shrink-0 border-b border-[#404040]">
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
              <Code className="h-4 w-4" />
              Practice Environment ({editorLanguage})
            </div>
            <div className="flex items-center gap-2">
              {lesson?.hints && lesson.hints.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1 border-[#404040] text-gray-300 hover:bg-[#404040] hover:text-white bg-transparent"
                  onClick={() => {
                    setHintLevel((prev) => {
                      const nextLevel = Math.min(prev + 1, lesson.hints.length);
                      if (params.slug && (params.slug as string[]).length === 3) {
                        localStorage.setItem(`hints_${(params.slug as string[])[2]}`, nextLevel.toString());
                      }
                      return nextLevel;
                    });
                  }}
                >
                  <Lightbulb className="h-3 w-3 text-yellow-500" />
                  Hint{hintLevel > 0 ? ` (${hintLevel}/${lesson.hints.length})` : ""}
                </Button>
              )}

              {lesson?.solution_code && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1 border-[#404040] text-gray-300 hover:bg-[#404040] hover:text-white bg-transparent"
                  onClick={() => {
                    if (confirm("Are you sure you want to view the solution? This will replace your current code.")) {
                      setCode(lesson.solution_code);
                    }
                  }}
                >
                  <Eye className="h-3 w-3 text-blue-400" />
                  View Solution
                </Button>
              )}

              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs gap-1"
                onClick={handleRunCode}
                disabled={running}
              >
                {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                Run Code
              </Button>

              {isProjectView ? (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"
                  onClick={() => {
                    const results = validateHTMLCode(code, projectData.requirements);
                    setProjectValidationResults(results);
                    setProjectPassed(results.every((r) => r.passed));
                  }}
                >
                  <CheckCircle className="h-3 w-3" />
                  Verify Requirements
                </Button>
              ) : lesson.codingChallenge ? (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1"
                  onClick={() => {
                    const results = validateHTMLCode(code, lesson.codingChallenge.validationRules);
                    setValidationResults(results);
                    const allPassed = results.every((r) => r.passed);
                    setChallengePassed(allPassed);
                    if (allPassed) setShowChallengeSuccess(true);
                  }}
                >
                  <CheckCircle className="h-3 w-3" />
                  Verify Solution
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 relative flex flex-col overflow-hidden">
            <MonacoEditor
              language={editorLanguage}
              value={code}
              onChange={(value: string | undefined) => setCode(value || "")}
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

            {hintLevel > 0 && lesson?.hints && (
              <div className="p-4 bg-[#252526] border-t border-[#404040]">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Hints Unlocked</div>
                  {lesson.hints.slice(0, hintLevel).map((hint: string, idx: number) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-300 bg-[#1e1e1e] p-3 rounded-md border-l-2 border-yellow-500 prose prose-sm dark:prose-invert max-w-none prose-p:my-1"
                    >
                      <SyntaxMarkdown>{hint}</SyntaxMarkdown>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-[#252526] border-t border-[#404040] shrink-0">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">Scratchpad Notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    localStorage.setItem(`notes_${lessonId}`, e.target.value);
                  }}
                  placeholder="Jot down your thoughts, edge cases to consider, or dry runs here..."
                  className="w-full bg-[#1e1e1e] border border-[#404040] rounded-md p-3 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-none focus:border-primary resize-y min-h-[80px]"
                />
              </div>
            </div>

            {showChallengeSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center justify-between gap-4 animate-fade-in my-4 mx-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">🏆</div>
                  <div>
                    <h4 className="font-bold text-sm text-green-700 dark:text-green-300">Challenge Completed!</h4>
                    <p className="text-xs text-muted-foreground">You earned +{lesson.codingChallenge?.xpReward} XP</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    await markComplete();
                    setShowChallengeSuccess(false);
                  }}
                >
                  Claim Reward
                </Button>
              </div>
            )}

            {!isProjectView && lesson.basicCode?.explanation && (
              <div className="bg-[#252526] border-t border-[#404040] p-4 shrink-0">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Code Explanation</p>
                <ul className="space-y-1">
                  {lesson.basicCode.explanation.map((exp: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span> {exp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="h-[35%] min-h-[220px] bg-[#1e1e1e] border-t border-[#404040] flex flex-col shrink-0">
              <div className="flex bg-[#2d2d2d] text-xs border-b border-[#404040]">
                <button
                  className={`px-4 py-2 font-medium border-r border-[#404040] uppercase tracking-wider transition-colors ${
                    activeTab === "preview" && editorLanguage === "html" ? "text-primary bg-[#1e1e1e] font-bold" : "text-gray-400 hover:text-gray-200"
                  }`}
                  disabled={editorLanguage !== "html"}
                  onClick={() => setActiveTab("preview")}
                >
                  Live Preview {editorLanguage === "html" ? "⚡" : "(HTML Only)"}
                </button>
                <button
                  className={`px-4 py-2 font-medium border-r border-[#404040] uppercase tracking-wider transition-colors ${
                    activeTab === "console" || editorLanguage !== "html" ? "text-primary bg-[#1e1e1e] font-bold" : "text-gray-400 hover:text-gray-200"
                  }`}
                  onClick={() => setActiveTab("console")}
                >
                  Console Output
                </button>
              </div>

              <div className="flex-1 overflow-hidden relative">
                {activeTab === "preview" && editorLanguage === "html" ? (
                  iframeSrcDoc ? (
                    <iframe srcDoc={iframeSrcDoc} title="Live HTML Render" sandbox="allow-scripts" className="w-full h-full bg-white" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 italic text-sm">
                      Click &apos;Run Code&apos; to render your HTML page live here...
                    </div>
                  )
                ) : (
                  <div className="p-4 h-full overflow-y-auto custom-scrollbar font-mono text-sm">
                    {output || testResults ? (
                      <div className="flex flex-col gap-4">
                        {executionTime !== null && (
                          <div className="text-green-400 text-xs flex items-center gap-2">
                            <span>⏱️ Execution Time: {executionTime}ms</span>
                            {testResults && testResults.every((r: any) => r.pass) && (
                              <span className="text-blue-400 ml-4">⚡ Target Complexity: O(n) - PASSED</span>
                            )}
                          </div>
                        )}
                        {testResults && (
                          <table className="w-full text-left border-collapse mt-2">
                            <thead>
                              <tr className="border-b border-[#404040]">
                                <th className="py-2 px-4 text-gray-400">Input</th>
                                <th className="py-2 px-4 text-gray-400">Expected</th>
                                <th className="py-2 px-4 text-gray-400">Got</th>
                                <th className="py-2 px-4 text-gray-400">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {testResults.map((tr: any, idx: number) => (
                                <tr key={idx} className="border-b border-[#303030]">
                                  <td className="py-2 px-4 text-gray-300 font-mono text-xs">{JSON.stringify(tr.input)}</td>
                                  <td className="py-2 px-4 text-gray-300 font-mono text-xs">{JSON.stringify(tr.expected)}</td>
                                  <td className="py-2 px-4 text-gray-300 font-mono text-xs">{JSON.stringify(tr.actual || tr.error)}</td>
                                  <td className="py-2 px-4">
                                    {tr.pass ? (
                                      <span className="text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">PASS</span>
                                    ) : (
                                      <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">FAIL</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {output && (
                          <pre className={`whitespace-pre-wrap ${output.includes("Error") ? "text-red-400" : "text-gray-300"} mt-4`}>{output}</pre>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 italic space-y-2">
                        <div className="h-8 w-8 text-primary/50 animate-pulse flex items-center justify-center text-xl">⚡</div>
                        <p>Ready to run. Click &apos;Run Code&apos; to execute your solution...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <LessonChat
            lessonTitle={isProjectView ? (projectData?.title || "") : (lesson?.title || "")}
            lessonContent={isProjectView ? (projectData?.description || "") : (lesson?.lessonGoal || "")}
            currentCode={code}
            language={editorLanguage}
          />
        </div>
              </div>
            </ContentShield>
        </div>
      </div>
    </div>
  );
}
