import React from "react";
import { THEME, FileObj } from "../types";
import { getFileIcon } from "../utils";

interface EditorTabsProps {
    files: FileObj[];
    openFileIds: string[];
    activeFileId: string;
    onOpenFile: (id: string) => void;
    onCloseTab: (id: string) => void;
    onRun: () => void;
    onDebug: () => void;
}

export default function EditorTabs({
    files,
    openFileIds,
    activeFileId,
    onOpenFile,
    onCloseTab,
    onRun,
    onDebug,
}: EditorTabsProps) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "6px 10px",
                borderBottom: `1px solid ${THEME.border}`,
                background: THEME.panel,
            }}
        >
            {/* DASHBOARD RETURN BUTTON */}
            <button
                onClick={() => (window.location.href = "/dashboard")}
                title="Back to Dashboard"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "#181818",
                    border: `1px solid ${THEME.border}`,
                    cursor: "pointer",
                    color: THEME.fg,
                    fontSize: 14,
                }}
            >
                ←
            </button>

            {/* TABS CONTAINER */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    overflowX: "auto",
                    flex: 1,
                    paddingRight: 8,
                    gap: 4,
                }}
            >
                {openFileIds.map((id) => {
                    const f = files.find((x) => x.id === id);
                    if (!f) return null;

                    const isActive = id === activeFileId;

                    return (
                        <div
                            key={id}
                            onClick={() => onOpenFile(id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 12px",
                                borderRadius: "6px 6px 0 0",
                                background: isActive ? THEME.tabActiveBg : "transparent",
                                border: isActive ? `1px solid ${THEME.border}` : "1px solid transparent",
                                borderBottom: isActive ? `1px solid ${THEME.tabActiveBg}` : "1px solid transparent",
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                            }}
                            className="tab-item"
                        >
                            <img
                                src={`/icons/lang/${getFileIcon(f.name)}`}
                                style={{ width: 16, height: 16, flexShrink: 0 }}
                            />

                            <span
                                style={{
                                    maxWidth: 180,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "block",
                                }}
                            >
                                {f.name}
                            </span>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseTab(id);
                                }}
                                style={{
                                    width: 18,
                                    height: 18,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 4,
                                    background: "transparent",
                                    cursor: "pointer",
                                    opacity: 0.4,
                                }}
                                className="tab-close-btn"
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* RIGHT SIDE BUTTONS */}
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={onRun}
                    style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        padding: "6px 10px",
                        background: THEME.accent,
                        color: "#fff",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    ▶ Run
                </button>

                <button
                    onClick={onDebug}
                    title="Debug"
                    style={{
                        width: 40,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#181818",
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 6,
                        color: THEME.fg,
                        cursor: "pointer",
                    }}
                >
                    🐞
                </button>
            </div>
        </div>
    );
}
