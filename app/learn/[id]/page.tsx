"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, Lesson, isSupabaseConfigured } from "@/lib/supabase";
import { CheckCircle, Play, ArrowLeft, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEMO_LESSON: Lesson = {
  id: "1",
  title: "Python Basics: Variables and Data Types",
  language: "python",
  content: "In Python, variables are containers for storing data values. Unlike other programming languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.\n\nCommon data types:\n- int: Integer numbers (5, 10, -3)\n- float: Decimal numbers (3.14, -0.5)\n- str: Text strings ('hello', \"world\")\n- bool: Boolean values (True, False)",
  codeExample: "# Variables\nname = \"Alice\"\nage = 25\nheight = 5.6\nis_student = True\n\nprint(f\"Name: {name}\")\nprint(f\"Age: {age}\")\nprint(f\"Height: {height}\")\nprint(f\"Is student: {is_student}\")",
  tryStarter: "# Try creating your own variables\nname = \"Your Name\"\nage = 0\n\nprint(name)\nprint(age)"
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  useEffect(() => {
    if (!user || !params.id) return;

    async function loadLesson() {
      if (!isSupabaseConfigured()) {
        setLesson(DEMO_LESSON);
        setCode(DEMO_LESSON.tryStarter || "");
        return;
      }

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", params.id)
        .single();

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
      } else {
        setLesson(DEMO_LESSON);
        setCode(DEMO_LESSON.tryStarter || "");
      }

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", params.id)
        .eq("completed", true)
        .single();

      setCompleted(!!progressData);
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
  };

  if (!user || !lesson) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/learn" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to lessons
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-3">{lesson.title}</h1>
              <Badge 
                className={`${
                  lesson.language === "python" 
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                    : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                }`}
              >
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
                {output && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Output:</p>
                    <pre className="text-sm whitespace-pre-wrap font-mono">{output}</pre>
                  </div>
                )}
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
      </div>
    </div>
  );
}
