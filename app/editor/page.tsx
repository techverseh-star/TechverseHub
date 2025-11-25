"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Bug, Sparkles, Play, Loader2, Copy, Check } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [code, setCode] = useState("// Welcome to TechVerse Hub Editor!\n// Start coding here...\n\nfunction hello() {\n  console.log('Hello, World!');\n}\n\nhello();");
  const [language, setLanguage] = useState("javascript");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
    setLoading(false);
  }, [router]);

  const handleAiAction = async (task: "code_explain" | "code_debug" | "code_refactor") => {
    setAiLoading(true);
    setAiResponse("");
    setActiveAction(task);

    try {
      const response = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          code,
          language,
        }),
      });

      const result = await response.json();
      setAiResponse(result.response || "No response received.");

      if (task === "code_refactor" && result.code) {
        const shouldReplace = confirm("Would you like to replace your code with the refactored version?");
        if (shouldReplace) {
          setCode(result.code);
        }
      }
    } catch (error) {
      setAiResponse("Error getting AI response. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleRunCode = async () => {
    setRunning(true);
    setOutput("");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionLabel = (action: string | null) => {
    switch (action) {
      case "code_explain": return "Explanation";
      case "code_debug": return "Debug Analysis";
      case "code_refactor": return "Refactored Code";
      default: return "AI Assistant";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Code Editor</h1>
          <p className="text-muted-foreground">Write code with AI-powered assistance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Editor</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex gap-1">
                      {["javascript", "python"].map((lang) => (
                        <Badge
                          key={lang}
                          variant={language === lang ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => setLanguage(lang)}
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="450px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      padding: { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleAiAction("code_explain")}
                    disabled={aiLoading}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Explain
                  </Button>
                  <Button
                    onClick={() => handleAiAction("code_debug")}
                    disabled={aiLoading}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Bug className="h-4 w-4" />
                    Debug
                  </Button>
                  <Button
                    onClick={() => handleAiAction("code_refactor")}
                    disabled={aiLoading}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Refactor
                  </Button>
                  <div className="flex-1" />
                  <Button onClick={handleRunCode} disabled={running} size="sm" className="gap-2">
                    {running ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Run Code
                  </Button>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Output:</p>
                  <pre className="text-sm whitespace-pre-wrap font-mono min-h-[60px]">
                    {output || "Click 'Run Code' to execute your code..."}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {getActionLabel(activeAction)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm">AI is analyzing your code...</p>
                  </div>
                )}
                {!aiLoading && !aiResponse && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Click an AI action button to get help with your code</p>
                  </div>
                )}
                {!aiLoading && aiResponse && (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{aiResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
