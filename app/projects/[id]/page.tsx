"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Play, Bug, Lightbulb, RotateCcw, Copy, Check,
  Clock, ChevronRight, ChevronDown, Loader2, Sparkles, Code2
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { PROJECT_DATA } from "@/data/projects";

const DEFAULT_PROJECT = {
  title: "Project Not Found",
  language: "python",
  difficulty: "Beginner",
  duration: "N/A",
  description: "This project is not available.",
  overview: "Please go back and select a valid project.",
  concepts: [],
  steps: [],
  starterCode: "# Project not found",
  solution: "# No solution available"
};

const getLanguageForMonaco = (lang: string) => {
  const map: Record<string, string> = {
    python: "python",
    javascript: "javascript",
    typescript: "typescript",
    java: "java",
    c: "c",
    cpp: "cpp"
  };
  return map[lang] || "plaintext";
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "hints">("description");
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  const project = PROJECT_DATA[projectId] || DEFAULT_PROJECT;

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    setCode(project.starterCode || "");
    setLoading(false);
  }, [router, projectId, project.starterCode]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: project.language
        })
      });
      
      const result = await response.json();
      setOutput(result.output || result.error || "No output");
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const debugWithAI = async () => {
    setIsAiLoading(true);
    setAiResponse("");
    
    try {
      const response = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "code_debug",
          code,
          language: project.language,
          context: `Project: ${project.title}. Error/Output: ${output}`
        })
      });
      
      const result = await response.json();
      setAiResponse(result.response || "Unable to analyze code.");
    } catch (error: any) {
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getHint = async () => {
    setIsAiLoading(true);
    setAiResponse("");
    setActiveTab("hints");
    
    try {
      const response = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "practice_hint",
          code,
          language: project.language,
          context: `Project: ${project.title}. Description: ${project.description}. Help the user progress without giving the full solution.`
        })
      });
      
      const result = await response.json();
      setAiResponse(result.response || "Unable to generate hint.");
    } catch (error: any) {
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetCode = () => {
    setCode(project.starterCode || "");
    setOutput("");
    setAiResponse("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSolution = () => {
    if (showSolution) {
      setCode(project.starterCode);
    } else {
      setCode(project.solution);
    }
    setShowSolution(!showSolution);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="border-b border-border bg-card/50 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">{project.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{project.language}</Badge>
                <Badge variant="outline" className={
                  project.difficulty === "Beginner" ? "text-green-500" :
                  project.difficulty === "Intermediate" ? "text-yellow-500" : "text-red-500"
                }>{project.difficulty}</Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {project.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-1/2 border-r border-border overflow-y-auto">
          <div className="p-6">
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === "description" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("description")}
              >
                Description
              </Button>
              <Button
                variant={activeTab === "hints" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("hints")}
              >
                AI Hints
              </Button>
            </div>

            {activeTab === "description" ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-3">Overview</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{project.overview}</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-3">What You'll Learn</h2>
                  <ul className="space-y-2">
                    {project.concepts?.map((concept: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Code2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-3">Step-by-Step Guide</h2>
                  <div className="space-y-2">
                    {project.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="border border-border rounded-lg overflow-hidden">
                        <button
                          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                          onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                        >
                          <span className="font-medium">{step.title}</span>
                          {expandedStep === idx ? (
                            <ChevronDown className="h-5 w-5 shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 shrink-0" />
                          )}
                        </button>
                        {expandedStep === idx && (
                          <div className="px-4 pb-4 text-muted-foreground">
                            {step.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={getHint} disabled={isAiLoading} className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Get Hint
                  </Button>
                  <Button onClick={debugWithAI} disabled={isAiLoading} variant="outline" className="gap-2">
                    <Bug className="h-4 w-4" />
                    Debug My Code
                  </Button>
                </div>
                
                {isAiLoading ? (
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                ) : aiResponse ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{aiResponse}</div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg text-muted-foreground text-center">
                    Click "Get Hint" for guidance or "Debug My Code" to analyze errors
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="border-b border-border p-2 flex items-center justify-between bg-card/50">
            <div className="flex items-center gap-2">
              <Button onClick={runCode} disabled={isRunning} size="sm" className="gap-2">
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run
              </Button>
              <Button onClick={debugWithAI} disabled={isAiLoading} variant="outline" size="sm" className="gap-2">
                <Bug className="h-4 w-4" />
                Debug
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={copyCode} variant="ghost" size="sm" className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button onClick={resetCode} variant="ghost" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button 
                onClick={toggleSolution} 
                variant={showSolution ? "default" : "outline"} 
                size="sm"
              >
                {showSolution ? "Hide Solution" : "Show Solution"}
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={getLanguageForMonaco(project.language)}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on"
              }}
            />
          </div>

          <div className="h-48 border-t border-border bg-black/90 overflow-auto">
            <div className="p-2 border-b border-border/50 text-xs text-muted-foreground">
              Output
            </div>
            <pre className="p-4 text-sm font-mono text-green-400 whitespace-pre-wrap">
              {output || "Click 'Run' to execute your code..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
