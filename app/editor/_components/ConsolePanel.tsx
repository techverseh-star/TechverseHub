import React from "react";
import { THEME } from "../types";

interface ConsolePanelProps {
    consoleLines: string[];
    consoleHeight: number;
    isConsoleOpen: boolean;
    consoleTransition: boolean;
    stdin: string;
    onSetStdin: (val: string) => void;
    onClearConsole: () => void;
    onCloseConsole: () => void;
    onOpenConsole: () => void;
    onDragStart: () => void;
    onRun: (clearInput?: boolean) => void;
}

export default function ConsolePanel({
    consoleLines,
    consoleHeight,
    isConsoleOpen,
    consoleTransition,
    stdin,
    onSetStdin,
    onClearConsole,
    onCloseConsole,
    onOpenConsole,
    onDragStart,
    onRun,
}: ConsolePanelProps) {
    if (!isConsoleOpen) {
        return (
            <div style={{ position: "fixed", right: 20, bottom: 20 }}>
                <button
                    onClick={onOpenConsole}
                    style={{
                        padding: "8px 12px",
                        background: "#0b0b0b",
                        color: THEME.fg,
                        borderRadius: 6,
                    }}
                >
                    Show Console ▲
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                height: consoleHeight,
                transition: consoleTransition ? "height 160ms ease" : "none",
                overflow: "hidden",
                borderTop: `1px solid ${THEME.border}`,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
            }}
        >
            {/* Drag Bar */}
            <div
                onMouseDown={onDragStart}
                style={{
                    height: 8,
                    cursor: "row-resize",
                    borderBottom: `1px solid ${THEME.border}`,
                    background: "transparent",
                    flexShrink: 0,
                }}
            />

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "#111111",
                    borderBottom: `1px solid ${THEME.border}`,
                    flexShrink: 0,
                }}
            >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ color: THEME.fg, fontWeight: 700 }}>Console</div>
                    <div style={{ color: "#9c9c9c", fontSize: 12 }}>
                        {consoleLines.length} lines
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={onClearConsole}
                        style={{
                            background: "transparent",
                            color: THEME.fg,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Clear
                    </button>
                    <button
                        onClick={onCloseConsole}
                        style={{
                            background: "transparent",
                            color: THEME.fg,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Hide
                    </button>
                </div>
            </div>

            {/* Console Body + Input Bar */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    background: "#0b0b0b",
                }}
            >
                {/* Output Area */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: 12,
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: THEME.fg,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {consoleLines.length === 0 ? (
                        <div style={{ color: "#9c9c9c" }}>
                            No logs yet. Run the file to see output.
                        </div>
                    ) : (
                        consoleLines.map((ln, i) => (
                            <div key={i} style={{ marginBottom: 6 }}>
                                {ln}
                            </div>
                        ))
                    )}
                </div>

                {/* Persistent Input Bar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        borderTop: `1px solid ${THEME.border}`,
                        padding: "8px 12px",
                        background: "#111111",
                    }}
                >
                    <span style={{ color: "#4ade80", marginRight: 8, fontFamily: "monospace" }}>{">"}</span>
                    <textarea
                        ref={(el) => {
                            // Auto-scroll to bottom when value changes
                            if (el && el.value === stdin) {
                                el.scrollTop = el.scrollHeight;
                            }
                        }}
                        value={stdin}
                        onChange={(e) => onSetStdin(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                onRun();
                                const newValue = stdin + "\n";
                                onSetStdin(newValue);
                                // Force cursor to end after state update
                                setTimeout(() => {
                                    const el = e.target as HTMLTextAreaElement;
                                    el.selectionStart = el.selectionEnd = newValue.length;
                                    el.scrollTop = el.scrollHeight;
                                }, 0);
                            }
                        }}
                        placeholder="Type input here (stdin). Shift+Enter for new line."
                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            color: THEME.fg,
                            fontFamily: "monospace",
                            fontSize: 13,
                            outline: "none",
                            resize: "vertical",
                            minHeight: 24,
                            maxHeight: 200,
                        }}
                        rows={1}
                    />
                </div>
            </div>
        </div>
    );
}
