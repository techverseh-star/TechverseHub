"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, PracticeProblem, TestCase, isSupabaseConfigured } from "@/lib/supabase";
import { Play, Send, Lightbulb, ArrowLeft, ArrowRight, Loader2, Target, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

import { DEMO_PROBLEMS } from "@/lib/challenges";

const DEMO_TESTCASES: TestCase[] = [
  { id: "1", problem_id: "js-e-01", input: "[2,7,11,15], 9", output: "[0,1]", hidden: false },
  { id: "2", problem_id: "js-e-01", input: "[3,2,4], 6", output: "[1,2]", hidden: true },
];

const FALLBACK_PROBLEM: PracticeProblem = {
  id: "demo",
  title: "Demo Problem",
  difficulty: "Easy",
  language: "javascript",
  description: "This is a demo problem. Configure Supabase to see real content.",
  examples: "Input: 'hello'\nOutput: 'world'",
  solution: "// Demo solution",
  hints: "Configure Supabase for hints"
};

export default function ProblemPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
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

    async function loadProblem() {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        const problemId = params.id as string;
        const demoProblem = DEMO_PROBLEMS.find(p => p.id === problemId) || FALLBACK_PROBLEM;
        setProblem(demoProblem);

        // Use default test cases if none exist for this problem
        setTestCases(DEMO_TESTCASES);

        setCode(demoProblem.language === "python" ? "def solution(nums, target):\n    pass" : "function solution(nums, target) {\n    \n}");
        const sameLangProblems = DEMO_PROBLEMS.filter(p => p.language === demoProblem.language);
        setAllProblems(sameLangProblems);
        setTotalProblems(sameLangProblems.length);
        setLoading(false);
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

      const { data: allProblemsData } = await supabase
        .from("practice_problems")
        .select("id, language, difficulty")
        .order("id");

      const { data: submissionData } = await supabase
        .from("submissions")
        .select("problem_id, status")
        .eq("user_id", user.id);

      if (problemData) {
        setProblem(problemData);
        setCode(problemData.language === "python" ? "def solution():\n    pass" : "function solution() {\n    \n}");

        if (allProblemsData) {
          const sameLangProblems = allProblemsData.filter(p => p.language === problemData.language);
          setAllProblems(sameLangProblems);
          setTotalProblems(sameLangProblems.length);
        }
      } else {
        setProblem(FALLBACK_PROBLEM);
        setCode("function solution(nums, target) {\n    \n}");
      }

      if (testData && testData.length > 0) {
        setTestCases(testData);
      } else {
        setTestCases(DEMO_TESTCASES);
      }

      if (submissionData) {
        const passedIds = new Set(submissionData.filter(s => s.status === "passed").map(s => s.problem_id));
        setSolved(passedIds.has(params.id as string));

        if (allProblemsData && problemData) {
          const sameLangProblems = allProblemsData.filter(p => p.language === problemData.language);
          const solvedInLang = sameLangProblems.filter(p => passedIds.has(p.id)).length;
          setSolvedCount(solvedInLang);
        }

        const userSubmissions = submissionData.filter(s => s.problem_id === params.id);
        setAttempts(userSubmissions.length);
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
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500/20";
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !problem) return null;

  const prevProblem = getPrevProblem();
  const nextProblem = getNextProblem();
  const currentIdx = getCurrentIndex();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/practice?lang=${problem.language}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to {problem.language} problems
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{solvedCount}</span>/{totalProblems} solved
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Problem {currentIdx + 1} of {totalProblems}</span>
              </div>
              <h1 className="text-3xl font-bold mb-3">{problem.title}</h1>
              <div className="flex items-center gap-3">
                <Badge className={getDifficultyStyles(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
                <Badge className={getLanguageColor(problem.language)}>
                  {problem.language}
                </Badge>
                <Badge variant="secondary">
                  Attempts: {attempts}
                </Badge>
              </div>
            </div>
            {solved && (
              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Solved</span>
              </div>
            )}
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
                <div className={`rounded-lg p-4 ${output?.includes("passed!") ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/50"}`}>
                  <p className="text-sm font-medium mb-2">Output:</p>
                  <pre className="text-sm whitespace-pre-wrap font-mono min-h-[60px]">
                    {output || "Click 'Run' to test your code or 'Submit' to check all test cases..."}
                  </pre>
                </div>
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

        <div className="mt-8 flex items-center justify-between border-t pt-6">
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
            <Link href={`/practice?lang=${problem.language}`}>
              <Button className="gap-2">
                Back to All Problems
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
