"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Bug, Sparkles, Play } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function EditorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [code, setCode] = useState("// Start coding here...\n");
  const [language, setLanguage] = useState("javascript");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  const handleAiAction = async (task: "code_explain" | "code_debug" | "code_refactor") => {
    setAiLoading(true);
    setAiResponse("");

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
      setAiResponse(result.response);

      if (task === "code_refactor" && result.code) {
        const shouldReplace = confirm("Would you like to replace your code with the refactored version?");
        if (shouldReplace) {
          setCode(result.code);
        }
      }
    } catch (error) {
      setAiResponse("Error getting AI response");
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Code Editor Workspace</h1>
          <p className="text-muted-foreground">Write code with AI-powered assistance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Code Editor</CardTitle>
                  <div className="flex gap-2">
                    <Badge
                      variant={language === "javascript" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setLanguage("javascript")}
                    >
                      JavaScript
                    </Badge>
                    <Badge
                      variant={language === "python" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setLanguage("python")}
                    >
                      Python
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <MonacoEditor
                    height="500px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => handleAiAction("code_explain")}
                    disabled={aiLoading}
                    variant="outline"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Explain Code
                  </Button>
                  <Button
                    onClick={() => handleAiAction("code_debug")}
                    disabled={aiLoading}
                    variant="outline"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Debug Code
                  </Button>
                  <Button
                    onClick={() => handleAiAction("code_refactor")}
                    disabled={aiLoading}
                    variant="outline"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Refactor Code
                  </Button>
                  <Button onClick={handleRunCode} disabled={running}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
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
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                {aiLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>AI is thinking...</p>
                  </div>
                )}
                {!aiLoading && !aiResponse && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Click an AI action button to get assistance with your code</p>
                  </div>
                )}
                {!aiLoading && aiResponse && (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm">{aiResponse}</p>
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
