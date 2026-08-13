"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, PracticeProblem, TestCase } from "@/lib/supabase";
import { Play, Send, Lightbulb, ArrowLeft, ArrowRight, Loader2, Target, CheckCircle } from "lucide-react";
import { PageSpinner } from "@/components/ui/page-spinner";
import dynamic from "next/dynamic";
import { getProblemById } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function ProblemPage() {
  const router = useRouter();
  const params = useParams();
  const { user, session, loading: authLoading } = useAuth();
  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState("");
  const [showingSolution, setShowingSolution] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [solved, setSolved] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !params.id) return;

    async function loadProblem() {
      setLoading(true);

      // These four requests are independent of each other, so fire them
      // concurrently instead of awaiting one at a time - that turns ~4
      // sequential round trips into the latency of the slowest single one.
      const [problemData, testResult, allProblemsResult, submissionResult] = await Promise.all([
        getProblemById(params.id as string),
        supabase.from("testcases").select("*").eq("problem_id", params.id),
        supabase.from("practice_problems").select("id, language, difficulty").order("id"),
        supabase.from("submissions").select("problem_id, status").eq("user_id", user.id),
      ]);

      if (!problemData) {
        setLoading(false);
        // Handle not found
        return;
      }

      setProblem(problemData);
      // Set starter code or default
      setCode(problemData.language === "python" ? "def solution():\n    pass" : "function solution() {\n    \n}");

      const testData = testResult.data;
      const allProblemsData = allProblemsResult.data;
      const submissionData = submissionResult.data;

      if (allProblemsData) {
        const sameLangProblems = allProblemsData.filter(p => p.language === problemData.language);
        setAllProblems(sameLangProblems);
        setTotalProblems(sameLangProblems.length);

        if (submissionData) {
          const passedIds = new Set(submissionData.filter(s => s.status === "passed").map(s => s.problem_id));
          setSolved(passedIds.has(params.id as string));
          const solvedInLang = sameLangProblems.filter(p => passedIds.has(p.id)).length;
          setSolvedCount(solvedInLang);

          const userSubmissions = submissionData.filter(s => s.problem_id === params.id);
          setAttempts(userSubmissions.length);
        }
      }

      if (testData && testData.length > 0) {
        setTestCases(testData);
      } else {
        // Fallback for no test cases? Or just empty.
        setTestCases([]);
      }

      setLoading(false);
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
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          code,
          language: problem?.language || "javascript",
          testInput: sampleTestCases[0]?.input || "",
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

    // If no test cases, we can't really verify, but we can simulate a run
    if (testCases.length === 0) {
      setOutput("No test cases available for this problem yet.");
      setRunning(false);
      return;
    }

    let total = testCases.length;

    try {
      for (const testCase of testCases) {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            code,
            language: problem.language,
            testInput: testCase.input,
          }),
        });

        const result = await response.json();
        // Naive equality check
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

      if (passed === total) {
        setOutput(`All ${total} test cases passed! Great job!`);
        if (!solved) {
          setSolved(true);
          setSolvedCount(prev => prev + 1);
        }
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
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
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
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
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

  const getCurrentIndex = () => {
    return allProblems.findIndex(p => p.id === params.id);
  };

  const getPrevProblem = () => {
    const idx = getCurrentIndex();
    return idx > 0 ? allProblems[idx - 1] : null;
  };

  const getNextProblem = () => {
    const idx = getCurrentIndex();
    return idx < allProblems.length - 1 ? allProblems[idx + 1] : null;
  };

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "Medium": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "Hard": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default: return "";
    }
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
        <PageSpinner label="Loading problem..." />
      </div>
    );
  }

  if (!user || !problem) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="glass-card rounded-2xl p-10 text-center max-w-md">
            <h1 className="text-2xl font-bold mb-3">Problem Not Found</h1>
            <p className="text-muted-foreground mb-8">The problem you are looking for does not exist.</p>
            <Link href="/practice">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Practice
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const prevProblem = getPrevProblem();
  const nextProblem = getNextProblem();
  const currentIdx = getCurrentIndex();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10 opacity-50" />

        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <Link href="/practice" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Practice
              </Link>
              <div className="flex items-center gap-2 text-sm bg-secondary/40 border border-border/50 rounded-full px-3 py-1.5">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  <span className="text-foreground font-semibold">{solvedCount}</span>/{totalProblems} solved
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Problem {currentIdx + 1} of {totalProblems}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 mb-4">{problem.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`font-medium tracking-wide ${getDifficultyStyles(problem.difficulty)}`}>
                    {problem.difficulty}
                  </Badge>
                  <Badge variant="outline" className={`font-medium ${getLanguageColor(problem.language)}`}>
                    {problem.language}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground border-border/60">
                    Attempts: {attempts}
                  </Badge>
                </div>
              </div>
              {solved && (
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl shrink-0">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Solved</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <Card className="glass-card rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Problem Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{problem.description}</p>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="code-block border border-border/50">
                    <pre className="text-sm whitespace-pre-wrap">{problem.examples}</pre>
                  </div>
                </CardContent>
              </Card>

              {(hint || hintLoading) && (
                <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-500 text-lg">
                      <Lightbulb className="h-5 w-5" />
                      {showingSolution ? "Solution" : "Hint"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hintLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Getting help...
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{hint}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6 lg:sticky lg:top-24">
              <Card className="glass-card rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Your Solution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm">
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
                    <Button onClick={handleRunCode} disabled={running} variant="outline" className="flex-1 gap-2">
                      {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Run
                    </Button>
                    <Button onClick={handleSubmit} disabled={running} className="flex-1 gap-2">
                      {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Submit
                    </Button>
                  </div>
                  <div className={`rounded-xl p-4 border transition-colors ${
                    output?.includes("passed!")
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : output && output.toLowerCase().includes("error")
                        ? "bg-rose-500/10 border-rose-500/20"
                        : "bg-secondary/40 border-border/50"
                  }`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Output</p>
                    <pre className="text-sm whitespace-pre-wrap font-mono min-h-[60px]">
                      {output || "Click 'Run' to test your code or 'Submit' to check all test cases..."}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Sample Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testCases.filter(tc => !tc.hidden).map((tc, idx) => (
                      <div key={idx} className="code-block border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Input:</p>
                        <pre className="text-sm mb-2">{tc.input}</pre>
                        <p className="text-xs text-muted-foreground mb-1">Expected:</p>
                        <pre className="text-sm">{tc.output}</pre>
                      </div>
                    ))}
                    {testCases.length === 0 && <p className="text-sm text-muted-foreground">No test cases available.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-border/50 pt-6">
            {prevProblem ? (
              <Link href={`/practice/${prevProblem.id}`}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Previous Problem
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextProblem ? (
              <Link href={`/practice/${nextProblem.id}`}>
                <Button className="gap-2">
                  Next Problem
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/practice">
                <Button className="gap-2">
                  Back to Practice
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
