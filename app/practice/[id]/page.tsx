"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, PracticeProblem, TestCase, isSupabaseConfigured } from "@/lib/supabase";
import { Play, Send, Lightbulb, ArrowLeft, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEMO_PROBLEM: PracticeProblem = {
  id: "1",
  title: "Two Sum",
  difficulty: "Easy",
  language: "javascript",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
  examples: "Example 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\n\nExample 2:\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]",
  solution: "function solution(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }",
  hints: "Try using a hash map to store numbers you've seen before."
};

const DEMO_TESTCASES: TestCase[] = [
  { id: "1", problem_id: "1", input: "[2,7,11,15], 9", output: "[0,1]", hidden: false },
  { id: "2", problem_id: "1", input: "[3,2,4], 6", output: "[1,2]", hidden: true },
];

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
  const [hintLoading, setHintLoading] = useState(false);

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
      if (!isSupabaseConfigured()) {
        setProblem(DEMO_PROBLEM);
        setTestCases(DEMO_TESTCASES);
        setCode(DEMO_PROBLEM.language === "python" ? "def solution(nums, target):\n    pass" : "function solution(nums, target) {\n    \n}");
        return;
      }

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
      } else {
        setProblem(DEMO_PROBLEM);
        setCode("function solution(nums, target) {\n    \n}");
      }
      
      if (testData && testData.length > 0) {
        setTestCases(testData);
      } else {
        setTestCases(DEMO_TESTCASES);
      }
      
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

      if (isSupabaseConfigured()) {
        await supabase.from("submissions").insert({
          user_id: user.id,
          problem_id: problem.id,
          code,
          status,
          attempts: newAttempts,
        });
      }

      setAttempts(newAttempts);
      
      if (passed === total) {
        setOutput(`All ${total} test cases passed! Great job!`);
      } else {
        setOutput(`Passed ${passed}/${total} test cases`);
        
        if (newAttempts === 2) {
          requestHint("small");
        } else if (newAttempts === 4) {
          requestHint("big");
        } else if (newAttempts >= 6) {
          requestSolution();
        }
      }
    } catch (error) {
      setOutput("Error submitting code");
    } finally {
      setRunning(false);
    }
  };

  const requestHint = async (size: "small" | "big") => {
    setHintLoading(true);
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
      setHint(result.response || "Think about the approach carefully.");
    } catch (error) {
      setHint("Unable to get hint. Try again later.");
    } finally {
      setHintLoading(false);
    }
  };

  const requestSolution = async () => {
    setHintLoading(true);
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
      setHint(result.response || problem?.solution || "");
      setShowingSolution(true);
    } catch (error) {
      setHint(problem?.solution || "Unable to get solution.");
      setShowingSolution(true);
    } finally {
      setHintLoading(false);
    }
  };

  if (!user || !problem) return null;

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/practice" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to problems
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-3">{problem.title}</h1>
              <div className="flex items-center gap-3">
                <Badge className={getDifficultyStyles(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {problem.language}
                </Badge>
                <Badge variant="secondary">
                  Attempts: {attempts}
                </Badge>
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
                <p className="whitespace-pre-wrap text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="code-block">
                  <pre className="text-sm whitespace-pre-wrap">{problem.examples}</pre>
                </div>
              </CardContent>
            </Card>

            {(hint || hintLoading) && (
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-500">
                    <Lightbulb className="h-5 w-5" />
                    {showingSolution ? "Solution" : "Hint"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hintLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Getting help...
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{hint}</p>
                  )}
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
                <div className="border rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="400px"
                    language={problem.language === "python" ? "python" : "javascript"}
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
                <div className="flex gap-2">
                  <Button onClick={handleRunCode} disabled={running} variant="outline" className="flex-1">
                    {running ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run
                  </Button>
                  <Button onClick={handleSubmit} disabled={running} className="flex-1">
                    {running ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Submit
                  </Button>
                </div>
                {output && (
                  <div className={`rounded-lg p-4 ${output.includes("passed") ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/50"}`}>
                    <p className="text-sm font-medium mb-2">Output:</p>
                    <pre className="text-sm whitespace-pre-wrap font-mono">{output}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sample Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testCases.filter(tc => !tc.hidden).map((tc, idx) => (
                    <div key={idx} className="code-block">
                      <p className="text-xs text-muted-foreground mb-1">Input:</p>
                      <pre className="text-sm mb-2">{tc.input}</pre>
                      <p className="text-xs text-muted-foreground mb-1">Expected:</p>
                      <pre className="text-sm">{tc.output}</pre>
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
