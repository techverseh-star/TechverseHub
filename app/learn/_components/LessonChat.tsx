"use client";

import { useState, useRef, useEffect } from "react";
import { GraduationCap, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import ReactMarkdown from "react-markdown";

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
    const { session } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 350, height: 500 });
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            // Only auto-scroll if the user is near the bottom
            const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
            if (isNearBottom) {
                el.scrollTop = el.scrollHeight;
            }
        }
    }, [messages]);

    async function handleSendMessage() {
        if (!input.trim() || loading) return;

        const userMsg = { role: "user" as const, content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 10);

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
                headers: {
                    "Content-Type": "application/json",
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
                },
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
            <Button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-40 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isOpen ? "scale-50 opacity-0 pointer-events-none" : "scale-100 opacity-100 pointer-events-auto"
                )}
                aria-hidden={isOpen}
                tabIndex={isOpen ? -1 : 0}
            >
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </Button>

            {/* Chat Window */}
            <div 
                className={cn(
                    "fixed bottom-6 right-6 bg-background border border-border shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isOpen ? "scale-100 opacity-100 rounded-xl pointer-events-auto" : "scale-0 opacity-0 rounded-[40%] pointer-events-none"
                )}
                style={{ 
                    width: dimensions.width, 
                    height: dimensions.height,
                    transformOrigin: 'calc(100% - 28px) calc(100% - 28px)'
                }}
                aria-hidden={!isOpen}
            >
                {/* Resize Handle */}
                    <div
                        className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 flex items-start justify-start p-1"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startWidth = dimensions.width;
                            const startHeight = dimensions.height;

                            const onPointerMove = (moveEvent: PointerEvent) => {
                                const deltaX = startX - moveEvent.clientX;
                                const deltaY = startY - moveEvent.clientY;
                                
                                setDimensions({
                                    width: Math.max(300, Math.min(800, startWidth + deltaX)),
                                    height: Math.max(400, Math.min(800, startHeight + deltaY)),
                                });
                            };

                            const onPointerUp = () => {
                                document.removeEventListener('pointermove', onPointerMove);
                                document.removeEventListener('pointerup', onPointerUp);
                            };

                            document.addEventListener('pointermove', onPointerMove);
                            document.addEventListener('pointerup', onPointerUp);
                        }}
                    >
                        <div className="w-2 h-2 border-t-2 border-l-2 border-muted-foreground/50 rounded-tl-[2px]" />
                    </div>

                    {/* Header */}
                    <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-border rounded-t-xl shrink-0">
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
                                        "max-w-[90%] rounded-lg px-3 py-2 text-sm overflow-x-auto",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground prose prose-sm dark:prose-invert prose-p:my-1 prose-pre:my-1 prose-pre:p-2 prose-pre:bg-[#1e1e1e] prose-pre:text-gray-300 prose-pre:border prose-pre:border-border prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5"
                                    )}
                                >
                                    {msg.role === "assistant" ? (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
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
        </>
    );
}
