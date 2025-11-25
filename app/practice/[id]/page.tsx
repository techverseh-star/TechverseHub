"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, PracticeProblem, TestCase } from "@/lib/supabase";
import { Play, Send, Lightbulb, CheckCircle, XCircle } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function ProblemPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState("");
  const [showingSolution, setShowingSolution] = useState(false);

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

    async function loadProblem() {
      const { data: problemData } = await supabase
        .from("practice_problems")
        .select("*")
        .eq("id", params.id)
        .single();

      const { data: testData } = await supabase
        .from("testcases")
        .select("*")
        .eq("problem_id", params.id);

      const { data: submissionData } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user.id)
        .eq("problem_id", params.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (problemData) {
        setProblem(problemData);
        setCode(problemData.language === "python" ? "def solution():\n    pass" : "function solution() {\n    \n}");
      }
      if (testData) setTestCases(testData);
      if (submissionData && submissionData[0]) {
        setAttempts(submissionData[0].attempts || 0);
      }
    }

    loadProblem();
  }, [user, params.id]);

  const handleRunCode = async () => {
    setRunning(true);
    setOutput("");

    try {
      const sampleTestCases = testCases.filter(tc => !tc.hidden);
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: problem?.language || "javascript",
          testInput: sampleTestCases[0]?.input,
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

  const handleSubmit = async () => {
    if (!user || !problem) return;

    setRunning(true);
    let passed = 0;
    let total = testCases.length;

    try {
      for (const testCase of testCases) {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language: problem.language,
            testInput: testCase.input,
          }),
        });

        const result = await response.json();
        if (result.output?.trim() === testCase.output.trim()) {
          passed++;
        }
      }

      const newAttempts = attempts + 1;
      const status = passed === total ? "passed" : "failed";

      await supabase.from("submissions").insert({
        user_id: user.id,
        problem_id: problem.id,
        code,
        status,
        attempts: newAttempts,
      });

      setAttempts(newAttempts);
      setOutput(`Passed ${passed}/${total} test cases`);

      if (status === "failed" && newAttempts === 2) {
        requestHint("small");
      } else if (status === "failed" && newAttempts === 4) {
        requestHint("big");
      } else if (status === "failed" && newAttempts >= 6) {
        requestSolution();
      }
    } catch (error) {
      setOutput("Error submitting code");
    } finally {
      setRunning(false);
    }
  };

  const requestHint = async (size: "small" | "big") => {
    try {
      const response = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "practice_hint",
          problem: problem?.description,
          hints: problem?.hints,
          size,
        }),
      });

      const result = await response.json();
      setHint(result.response);
    } catch (error) {
      console.error("Error getting hint:", error);
    }
  };

  const requestSolution = async () => {
    try {
      const response = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "practice_solution",
          problem: problem?.description,
          solution: problem?.solution,
        }),
      });

      const result = await response.json();
      setHint(result.response);
      setShowingSolution(true);
    } catch (error) {
      console.error("Error getting solution:", error);
    }
  };

  if (!user || !problem) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{problem.title}</h1>
              <div className="flex gap-2">
                <Badge className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
                <Badge variant="secondary">{problem.language}</Badge>
                <Badge variant="outline">Attempts: {attempts}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{problem.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{problem.examples}</pre>
                </div>
              </CardContent>
            </Card>

            {hint && (
              <Card className="border-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    {showingSolution ? "Solution" : "Hint"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{hint}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <MonacoEditor
                    height="400px"
                    language={problem.language === "python" ? "python" : "javascript"}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRunCode} disabled={running} variant="outline" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Run
                  </Button>
                  <Button onClick={handleSubmit} disabled={running} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </Button>
                </div>
                {output && (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm font-semibold mb-2">Output:</p>
                    <pre className="text-sm whitespace-pre-wrap">{output}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Cases (Sample)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testCases.filter(tc => !tc.hidden).map((tc, idx) => (
                    <div key={idx} className="bg-muted p-3 rounded-md text-sm">
                      <p><strong>Input:</strong> {tc.input}</p>
                      <p><strong>Expected:</strong> {tc.output}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
