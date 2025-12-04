import React from "react";
import { THEME, FileObj } from "../types";
import { getFileIconComponent } from "../utils";

interface FileExplorerProps {
    files: FileObj[];
    activeFileId: string;
    leftWidth: number;
    leftTransition: boolean;
    onOpenFile: (id: string) => void;
    onRenameFile: (id: string) => void;
    onDeleteFile: (id: string) => void;
    onNewFile: () => void;
    onImportFile: () => void;
}

export default function FileExplorer({
    files,
    activeFileId,
    leftWidth,
    leftTransition,
    onOpenFile,
    onRenameFile,
    onDeleteFile,
    onNewFile,
    onImportFile,
}: FileExplorerProps) {
    return (
        <div
            style={{
                width: leftWidth,
                minWidth: 200,
                flexShrink: 0,
                background: THEME.panel,
                borderRight: `1px solid ${THEME.border}`,
                display: "flex",
                flexDirection: "column",
                transition: leftTransition ? "width 160ms ease" : "none",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "10px 12px",
                    borderBottom: `1px solid ${THEME.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ color: THEME.fg, fontWeight: 700 }}>Explorer</div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={onNewFile}
                        style={{
                            background: "transparent",
                            color: THEME.fg,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        New
                    </button>
                    <button
                        onClick={onImportFile}
                        style={{
                            background: "transparent",
                            color: THEME.fg,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Import
                    </button>
                </div>
            </div>

            {/* FILE LIST */}
            <div style={{ padding: 8, overflowY: "auto", flex: 1 }}>
                {files.map((f) => {
                    const Icon = getFileIconComponent(f.name);
                    return (
                        <div
                            key={f.id}
                            onClick={() => onOpenFile(f.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px",
                                marginBottom: 4,
                                borderRadius: 4,
                                background: activeFileId === f.id ? THEME.tabActiveBg : "transparent",
                                cursor: "pointer",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    overflow: "hidden",
                                }}
                            >
                                <Icon className="w-5 h-5" style={{ color: THEME.fg }} />
                                <span
                                    style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: leftWidth - 120,
                                    }}
                                >
                                    {f.name}
                                </span>
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRenameFile(f.id);
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#9c9c9c",
                                        cursor: "pointer",
                                        fontSize: 12,
                                    }}
                                >
                                    rename
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteFile(f.id);
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#d9534f",
                                        cursor: "pointer",
                                        fontSize: 12,
                                    }}
                                >
                                    del
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
