import React from "react";
import { THEME } from "../types";

interface AIPanelProps {
    rightWidth: number;
    rightTransition: boolean;
    aiLoading: boolean;
    aiFindings: any[];
    aiResultText: string | null;
    onRunDebug: () => void;
    onCallRefactor: () => void;
    onCallExplain: () => void;
    onApplyFix: (fix: any) => void;
    onIgnoreFix: (desc: string) => void;
    onDragStart: () => void;
}

export default function AIPanel({
    rightWidth,
    rightTransition,
    aiLoading,
    aiFindings,
    aiResultText,
    onRunDebug,
    onCallRefactor,
    onCallExplain,
    onApplyFix,
    onIgnoreFix,
    onDragStart,
}: AIPanelProps) {
    return (
        <>
            {/* vertical resizer between editor and AI panel */}
            <div
                onMouseDown={onDragStart}
                style={{ width: 6, cursor: "col-resize", background: "transparent" }}
                title="Drag to resize AI panel"
            />

            {/* AI panel */}
            <div
                style={{
                    width: rightWidth,
                    minWidth: 200,
                    background: THEME.panel,
                    borderLeft: `1px solid ${THEME.border}`,
                    display: "flex",
                    flexDirection: "column",
                    transition: rightTransition ? "width 160ms ease" : "none",
                }}
            >
                <div
                    style={{
                        padding: 12,
                        borderBottom: `1px solid ${THEME.border}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontWeight: 700 }}>AI Assistant</div>
                    <div style={{ color: "#9c9c9c", fontSize: 12 }}>Suggestions</div>
                </div>

                <div style={{ padding: 12, overflow: "auto", flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <button
                            onClick={onRunDebug}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 6,
                                background: "#181818",
                                color: THEME.fg,
                                border: `1px solid ${THEME.border}`,
                                cursor: "pointer",
                            }}
                        >
                            Debug
                        </button>
                        <button
                            onClick={onCallRefactor}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 6,
                                background: "#181818",
                                color: THEME.fg,
                                border: `1px solid ${THEME.border}`,
                                cursor: "pointer",
                            }}
                        >
                            Refactor
                        </button>
                        <button
                            onClick={onCallExplain}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 6,
                                background: "#181818",
                                color: THEME.fg,
                                border: `1px solid ${THEME.border}`,
                                cursor: "pointer",
                            }}
                        >
                            Explain
                        </button>
                    </div>

                    <div
                        style={{
                            background: THEME.panelAlt,
                            padding: 10,
                            borderRadius: 8,
                            minHeight: 160,
                        }}
                    >
                        {aiLoading && <div style={{ color: "#9c9c9c" }}>AI working…</div>}
                        {!aiLoading && aiFindings.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {aiFindings.map((fix, i) => (
                                    <div
                                        key={i}
                                        style={{ padding: 10, background: "#0f1314", borderRadius: 6 }}
                                    >
                                        <div style={{ color: THEME.fg, fontWeight: 700 }}>
                                            {fix.desc ?? `Issue ${i + 1}`}
                                        </div>
                                        <div
                                            style={{
                                                color: "#9c9c9c",
                                                marginTop: 6,
                                                whiteSpace: "pre-wrap",
                                                fontSize: 12,
                                            }}
                                        >
                                            {fix.snippet ?? fix.details ?? ""}
                                        </div>
                                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                                            <button
                                                onClick={() => onApplyFix(fix)}
                                                style={{
                                                    background: "#0f7a3f",
                                                    color: "#fff",
                                                    padding: "6px 8px",
                                                    borderRadius: 4,
                                                }}
                                            >
                                                Apply
                                            </button>
                                            <button
                                                onClick={() => onIgnoreFix(fix.desc ?? "fix")}
                                                style={{
                                                    background: "#2a2a2a",
                                                    color: THEME.fg,
                                                    padding: "6px 8px",
                                                    borderRadius: 4,
                                                }}
                                            >
                                                Ignore
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!aiLoading && aiResultText && (
                            <pre style={{ color: THEME.fg, whiteSpace: "pre-wrap" }}>
                                {aiResultText}
                            </pre>
                        )}
                        {!aiLoading && !aiResultText && aiFindings.length === 0 && (
                            <div style={{ color: "#9c9c9c" }}>No AI output yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
