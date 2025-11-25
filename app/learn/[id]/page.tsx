"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, Lesson } from "@/lib/supabase";
import { CheckCircle, Play } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

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
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", params.id)
        .single();

      if (lessonData) {
        setLesson(lessonData);
        setCode(lessonData.tryStarter || "");
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

    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      completed: true,
    });

    setCompleted(true);
  };

  if (!user || !lesson) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <Badge>{lesson.language}</Badge>
            </div>
            {completed && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span>Completed</span>
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
                  <p className="whitespace-pre-wrap">{lesson.content}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm">
                  <pre>{lesson.codeExample}</pre>
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
                <div className="border rounded-md overflow-hidden">
                  <MonacoEditor
                    height="300px"
                    language={lesson.language === "python" ? "python" : "javascript"}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>
                <Button onClick={handleRunCode} disabled={running} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  {running ? "Running..." : "Run Code"}
                </Button>
                {output && (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm font-semibold mb-2">Output:</p>
                    <pre className="text-sm whitespace-pre-wrap">{output}</pre>
                  </div>
                )}
                {!completed && (
                  <Button onClick={handleMarkComplete} variant="outline" className="w-full">
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
