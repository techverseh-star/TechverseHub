"use client";

import { useState, useRef, useEffect } from "react";
import { GraduationCap, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonChatProps {
    lessonTitle: string;
    lessonContent: string;
    currentCode: string;
    language: string;
}

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export default function LessonChat({ lessonTitle, lessonContent, currentCode, language }: LessonChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    async function handleSendMessage() {
        if (!input.trim() || loading) return;

        const userMsg = { role: "user" as const, content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const systemContext = `You are an AI Tutor helping a student with a coding lesson.
Lesson Title: ${lessonTitle}
Lesson Content: ${lessonContent}
Current Language: ${language}
Student's Code:
\`\`\`${language}
${currentCode}
\`\`\`
Be helpful, encouraging, and concise. Guide them to the solution rather than just giving it.`;

            const res = await fetch("/api/ai/groq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "chat",
                    code: currentCode,
                    language: language,
                    messages: [
                        { role: "system", content: systemContext },
                        ...messages,
                        userMsg
                    ]
                }),
            });

            const data = await res.json();
            setLoading(false);

            const fullResponse = data.response || "I'm having trouble connecting. Please try again.";

            // Add empty assistant message
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            // Simulate typing
            let currentText = "";
            const step = 1;
            const delay = 15;

            for (let i = 0; i < fullResponse.length; i += step) {
                await new Promise(r => setTimeout(r, delay));
                const chunk = fullResponse.slice(i, i + step);
                currentText += chunk;
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1] = { role: "assistant", content: currentText };
                    return newArr;
                });
            }

        } catch (error) {
            console.error("Chat error:", error);
            setLoading(false);
            setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
        }
    }

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50 flex items-center justify-center"
                >
                    <GraduationCap className="h-7 w-7 text-primary-foreground" />
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-sm">AI Tutor</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm mt-8">
                                <p>Hi! I'm your AI Tutor.</p>
                                <p>Ask me anything about this lesson!</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex w-full",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border bg-background">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 bg-muted rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
