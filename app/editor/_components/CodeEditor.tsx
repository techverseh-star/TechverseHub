import React from "react";
import dynamic from "next/dynamic";
import { FileObj } from "../types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
    activeFile: FileObj | null;
    onUpdateContent: (id: string, content: string) => void;
}

export default function CodeEditor({ activeFile, onUpdateContent }: CodeEditorProps) {
    return (
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <MonacoEditor
                height="100%"
                language={activeFile?.language ?? "javascript"}
                value={activeFile?.content ?? ""}
                theme="vs-dark"
                onChange={(v) => activeFile && onUpdateContent(activeFile.id, v ?? "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
