"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, Send, Loader2, Sparkles, BookOpen, Target, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function DashboardAI() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm your AI Tutor. I can help you plan your learning path, suggest projects, or answer career questions. What would you like to focus on today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const simulateTyping = async (text: string) => {
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        for (let i = 0; i < text.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 10)); // Adjust speed here
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                lastMessage.content = text.substring(0, i + 1);
                return newMessages;
            });
        }
    };

    const handleSendMessage = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const newMessages = [...messages, { role: "user" as const, content: text }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai/groq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "study_planning",
                    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
                }),
            });

            const data = await response.json();

            if (data.response) {
                setIsLoading(false); // Stop loading spinner before typing starts
                await simulateTyping(data.response);
            }
        } catch (error) {
            console.error("Failed to get AI response:", error);
            setIsLoading(false);
        }
    };

    const quickActions = [
        { label: "Create a study plan", icon: BookOpen, prompt: "Create a study plan for me. I know basics of Python and want to learn Web Development." },
        { label: "Project ideas", icon: Lightbulb, prompt: "Give me 3 beginner project ideas to practice JavaScript." },
        { label: "Career advice", icon: Target, prompt: "What skills do I need to become a Full Stack Developer?" },
    ];

    return (
        <Card className={`flex flex-col border-primary/20 shadow-lg transition-all duration-300 ${isCollapsed ? 'h-[60px]' : 'h-[800px]'}`}>
            <CardHeader className="border-b pb-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsCollapsed(!isCollapsed)}>
                <div className="flex items-center justify-between w-full">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        AI Learning Assistant
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>

            {!isCollapsed && (
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary/50 border border-border"
                                        }`}
                                >
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                code({ node, inline, className, children, ...props }: any) {
                                                    return (
                                                        <code className={`${className} bg-black/20 rounded px-1`} {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-secondary/50 rounded-2xl px-4 py-3 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {messages.length === 1 && (
                        <div className="px-4 pb-4">
                            <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickActions.map((action, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 hover:border-primary/50 hover:bg-primary/5"
                                        onClick={() => handleSendMessage(action.prompt)}
                                    >
                                        <action.icon className="h-3 w-3 text-primary" />
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-t bg-background">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                placeholder="Ask for a study plan, project ideas..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
