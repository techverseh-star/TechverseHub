import React, { useState, useRef, useEffect } from "react";
import { THEME } from "../types";
import { Send, Play, RefreshCw, HelpCircle } from "lucide-react";

interface AIPanelProps {
    rightWidth: number;
    rightTransition: boolean;
    messages: { role: "user" | "assistant" | "system"; content: string }[];
    loading: boolean;
    onSendMessage: (text: string) => void;
    onApplyCode: (code: string) => void;
    onDragStart: () => void;
}

export default function AIPanel({
    rightWidth,
    rightTransition,
    messages,
    loading,
    onSendMessage,
    onApplyCode,
    onDragStart,
}: AIPanelProps) {
    const [input, setInput] = useState("");
    const [autoApply, setAutoApply] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastAppliedLength = useRef(messages.length);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Auto-apply logic
    useEffect(() => {
        if (!autoApply) {
            lastAppliedLength.current = messages.length;
            return;
        }

        if (messages.length > lastAppliedLength.current) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === "assistant" && !loading) {
                // Extract code
                const codeMatch = lastMsg.content.match(/```(\w+)?\n([\s\S]*?)```/);
                if (codeMatch) {
                    const code = codeMatch[2];
                    onApplyCode(code);
                }
            }
            lastAppliedLength.current = messages.length;
        }
    }, [messages, loading, autoApply, onApplyCode]);

    function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!input.trim() || loading) return;
        onSendMessage(input);
        setInput("");
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <>
            {/* vertical resizer */}
            <div
                onMouseDown={onDragStart}
                style={{ width: 6, cursor: "col-resize", background: "transparent" }}
            />
            <div
                style={{
                    width: rightWidth,
                    minWidth: 250,
                    background: THEME.panel,
                    borderLeft: `1px solid ${THEME.border}`,
                    display: "flex",
                    flexDirection: "column",
                    transition: rightTransition ? "width 160ms ease" : "none",
                }}
            >
                {/* Header with Quick Actions */}
                <div
                    style={{
                        padding: "10px 12px",
                        borderBottom: `1px solid ${THEME.border}`,
                        display: "flex",
                        gap: 8,
                        background: THEME.panelAlt,
                    }}
                >
                    <ActionButton icon={<Play size={14} />} label="Debug" onClick={() => onSendMessage("Debug this code and fix any errors.")} />
                    <ActionButton icon={<RefreshCw size={14} />} label="Refactor" onClick={() => onSendMessage("Refactor this code to be more efficient.")} />
                    <ActionButton icon={<HelpCircle size={14} />} label="Explain" onClick={() => onSendMessage("Explain this code in detail.")} />
                </div>

                {/* Chat Title & Auto-Apply Toggle */}
                <div style={{
                    padding: "8px 12px",
                    borderBottom: `1px solid ${THEME.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: THEME.fg
                }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>TechVerseHub AI</div>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, cursor: "pointer", color: "#9c9c9c" }}>
                        <input
                            type="checkbox"
                            checked={autoApply}
                            onChange={(e) => setAutoApply(e.target.checked)}
                            style={{ cursor: "pointer" }}
                        />
                        Auto-apply code
                    </label>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}
                >
                    {messages.length === 0 && (
                        <div style={{ color: "#888", textAlign: "center", marginTop: 40, fontSize: 13 }}>
                            Ask me anything about your code!
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                            <div
                                style={{
                                    maxWidth: "90%",
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    background: msg.role === "user" ? THEME.accent : "#2a2a2a",
                                    color: msg.role === "user" ? "#fff" : THEME.fg,
                                    fontSize: 13,
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.5,
                                }}
                            >
                                <MessageContent content={msg.content} onApplyCode={onApplyCode} />
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ alignSelf: "flex-start", color: "#888", fontSize: 12, paddingLeft: 4 }}>
                            TechVerseHub AI is thinking...
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div style={{ padding: 12, borderTop: `1px solid ${THEME.border}`, background: THEME.panel }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "#181818", borderRadius: 8, padding: 8, border: `1px solid ${THEME.border}` }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask TechVerseHub AI..."
                            style={{
                                flex: 1,
                                background: "transparent",
                                border: "none",
                                color: THEME.fg,
                                resize: "none",
                                outline: "none",
                                fontSize: 13,
                                maxHeight: 100,
                                minHeight: 20,
                                fontFamily: "inherit",
                            }}
                            rows={1}
                        />
                        <button
                            onClick={() => handleSubmit()}
                            disabled={loading || !input.trim()}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: input.trim() ? THEME.accent : "#555",
                                cursor: input.trim() ? "pointer" : "default",
                                padding: 4,
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "6px",
                borderRadius: 6,
                background: "#2a2a2a",
                border: "none",
                color: "#ccc",
                fontSize: 12,
                cursor: "pointer",
                transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3a3a3a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2a2a2a")}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function MessageContent({ content, onApplyCode }: { content: string; onApplyCode: (code: string) => void }) {
    // Simple markdown parsing for code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith("```")) {
                    const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
                    const code = match ? match[2] : part.slice(3, -3);
                    return (
                        <div key={i} style={{ marginTop: 8, marginBottom: 8, borderRadius: 6, overflow: "hidden", border: "1px solid #444" }}>
                            <div style={{ background: "#1e1e1e", padding: "4px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: "#888" }}>Code</span>
                                <button
                                    onClick={() => onApplyCode(code)}
                                    style={{
                                        background: "#0f7a3f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 4,
                                        padding: "2px 8px",
                                        fontSize: 11,
                                        cursor: "pointer",
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                            <pre style={{ margin: 0, padding: 8, background: "#111", overflowX: "auto", fontSize: 12, color: "#d4d4d4" }}>
                                <code>{code}</code>
                            </pre>
                        </div>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}
