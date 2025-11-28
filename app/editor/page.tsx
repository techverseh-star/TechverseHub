"use client";
import { getLoggedUser } from "@/lib/auth";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Play, Bug, X, FilePlus } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

/**
 * TechVerse Editor - final single-file
 * - VS Code style tabs at top
 * - Activity bar left
 * - Resizable Explorer, Editor, AI panel, and Console
 * - Smooth resizing using rAF + brief transition on release
 * - Delete modal instead of alert()
 * - Icons loaded from /icons/lang/<file>.svg
 */

/* ---------------- Theme ---------------- */
const THEME = {
  bg: "#1E1E1E",
  panel: "#0F1113", // main panels (slightly lighter than bg)
  sidebar: "#252526",
  border: "#2B2B2B",
  fg: "#D4D4D4",
  accent: "#007ACC",
  panelAlt: "#0B0B0C",
  tabActiveBg: "#252526",
  tabInactiveBg: "transparent",
  tabHoverBg: "#2a2a2a",
};

/* ---------------- types ---------------- */
type FileObj = { id: string; name: string; language: string; content: string };

/* ---------------- component ---------------- */
export default function EditorPage() {
  // files
  const [files, setFiles] = useState<FileObj[]>(() => [
    createFileObj("example.js", "javascript", `console.log("Hello TechVerse");`),
    createFileObj("index.html", "html", `<html><body><h1>Hello</h1></body></html>`),
    createFileObj("style.css", "css", `body { font-family: system-ui; }`),
    createFileObj("main.c", "c", `#include <stdio.h>\nint main(){ printf("Hello C\\n"); return 0; }`),
    createFileObj("main.cpp", "cpp", `#include <iostream>\nint main(){ std::cout<<"Hello C++\\n"; return 0; }`),
    createFileObj("app.py", "python", `print("Hello Python")`),
  ]);

  const [activeFileId, setActiveFileId] = useState<string>(files[0].id);
  const [openFileIds, setOpenFileIds] = useState<string[]>([files[0].id]);

  // layout/resizers
  const [leftWidth, setLeftWidth] = useState<number>(320);
  const [rightWidth, setRightWidth] = useState<number>(360);
  const [consoleHeight, setConsoleHeight] = useState<number>(220);

  const desiredLeftRef = useRef<number>(leftWidth);
  const desiredRightRef = useRef<number>(rightWidth);
  const desiredConsoleRef = useRef<number>(consoleHeight);
  const rafRef = useRef<number | null>(null);

  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [isDraggingConsole, setIsDraggingConsole] = useState(false);

  const [leftTransition, setLeftTransition] = useState(false);
  const [rightTransition, setRightTransition] = useState(false);
  const [consoleTransition, setConsoleTransition] = useState(false);

  // runner, console, modal, AI
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState<null | { mode: "new" | "rename" | "import" | "delete"; payload?: any }>(null);
  const [modalValue, setModalValue] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFindings, setAiFindings] = useState<any[]>([]);
  const [aiResultText, setAiResultText] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const saveToSupabase = useRef(
    debounce(async (user_id: string, file: any) => {
      await fetch("/api/files/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, file }),
      });
    }, 700)
  ).current;

  function debounce<T extends (...args: any[]) => any>(fn: T, ms = 700) {
    let t: any;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }
  function ensureAtLeastOneFile(
    setFiles: React.Dispatch<React.SetStateAction<FileObj[]>>,
    setActiveFileId: React.Dispatch<React.SetStateAction<string>>,
    setOpenFileIds: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    const defaultFile = createFileObj(
      "example.js",
      "javascript",
      `console.log("Hello TechVerse")`
    );

    setFiles([defaultFile]);
    setActiveFileId(defaultFile.id);
    setOpenFileIds([defaultFile.id]);

    return defaultFile;
  }

  // LOAD USER FILES ON PAGE OPEN
  useEffect(() => {
    async function load() {
      const user = await getLoggedUser();
      if (!user) return;

      const res = await fetch("/api/files/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await res.json();

      if (!data.files || data.files.length === 0) {
        const defaultFile = createFileObj(
          "example.js",
          "javascript",
          `console.log("Hello TechVerse")`
        );

        setFiles([defaultFile]);
        setActiveFileId(defaultFile.id);
        setOpenFileIds([defaultFile.id]);

        saveToSupabase(user.id, defaultFile);


      }

      setFiles(data.files);
      setActiveFileId(data.files[0].id);
      setOpenFileIds([data.files[0].id]);
    }

    load();
  }, []);




  // ensure full height
  useEffect(() => {
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = "";
    };
  }, []);

  // smooth rAF loop to update state from desired refs
  useEffect(() => {
    function loop() {
      if (desiredLeftRef.current !== leftWidth) setLeftWidth(desiredLeftRef.current);
      if (desiredRightRef.current !== rightWidth) setRightWidth(desiredRightRef.current);
      if (desiredConsoleRef.current !== consoleHeight) setConsoleHeight(desiredConsoleRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pointer handlers
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (isDraggingLeft) {
        const next = e.clientX;
        const min = 140;
        const max = Math.max(300, window.innerWidth - 600);
        desiredLeftRef.current = Math.max(min, Math.min(max, next));
      }
      if (isDraggingRight) {
        const next = window.innerWidth - e.clientX;
        const min = 200;
        const max = Math.max(300, window.innerWidth - 420);
        desiredRightRef.current = Math.max(min, Math.min(max, next));
      }
      if (isDraggingConsole) {
        const bottom = window.innerHeight - e.clientY;
        const min = 100;
        const max = window.innerHeight * 0.75;
        desiredConsoleRef.current = Math.max(min, Math.min(max, bottom));
      }
    }
    function onUp() {
      if (isDraggingLeft) {
        setIsDraggingLeft(false);
        setLeftTransition(true);
        setTimeout(() => setLeftTransition(false), 220);
      }
      if (isDraggingRight) {
        setIsDraggingRight(false);
        setRightTransition(true);
        setTimeout(() => setRightTransition(false), 220);
      }
      if (isDraggingConsole) {
        setIsDraggingConsole(false);
        setConsoleTransition(true);
        setTimeout(() => setConsoleTransition(false), 220);
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDraggingLeft, isDraggingRight, isDraggingConsole, leftWidth, rightWidth, consoleHeight]);

  // iframe console posts
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      if (!ev?.data) return;
      const { type, payload } = ev.data;
      if (type === "console") {
        const text = (payload as any[]).map((p) => stringify(p)).join(" ");
        setConsoleLines((c) => [...c, text]);
      } else if (type === "error") {
        setConsoleLines((c) => [...c, `Error: ${payload}`]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ---------------- helpers ---------------- */
  function stringify(v: any) {
    try {
      if (typeof v === "string") return v;
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }

  function openFile(id: string) {
    setOpenFileIds((p) => (p.includes(id) ? p : [...p, id]));
    setActiveFileId(id);
  }
  function closeTab(id: string) {
    setOpenFileIds((p) => p.filter((x) => x !== id));
    if (activeFileId === id) {
      const remaining = openFileIds.filter((x) => x !== id);
      if (remaining.length) setActiveFileId(remaining[remaining.length - 1]);
      else if (files.length) setActiveFileId(files[0].id);
    }
  }
  function updateFileContent(id: string, content: string) {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, content } : f))
    );

    (async () => {
      const user = await getLoggedUser();
      if (user) {
        const file = files.find(f => f.id === id);
        if (file) {
          saveToSupabase(user.id, { ...file, content });
        }
      }
    })();
  }





  function createNewFile(language?: string, suggestedName?: string) {
    const lang = language ?? "javascript";
    const ext = langToExt(lang);
    const base = suggestedName ? suggestedName.replace(/\.\w+$/, "") : `untitled`;
    let name = `${base}.${ext}`;
    let i = 1;
    while (files.some((f) => f.name === name)) {
      name = `${base}-${i}.${ext}`;
      i++;
    }
    const file = createFileObj(name, lang, defaultContentFor(lang));
    setFiles((p) => [file, ...p]);
    openFile(file.id);
    setModalOpen(null);
  }

  function renameFileStart(id: string) {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    setModalValue(f.name);
    setModalOpen({ mode: "rename", payload: { id } });
  }

  function deleteFilePrompt(id: string) {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    setModalOpen({ mode: "delete", payload: { id: f.id, name: f.name } });
  }
  function performDelete(id: string) {
    const updated = files.filter((x) => x.id !== id);

    if (updated.length === 0) {
      const newFile = ensureAtLeastOneFile(setFiles, setActiveFileId, setOpenFileIds);

      // (optional) save new blank file to Supabase
      (async () => {
        const user = await getLoggedUser();
        if (user) saveToSupabase(user.id, newFile);
      })();

      return;
    }

    // Normal delete flow
    setFiles(updated);
    setOpenFileIds((p) => p.filter((x) => x !== id));

    if (activeFileId === id) {
      setActiveFileId(updated[0].id);
    }

    setModalOpen(null);
  }


  /* ---------------- AI actions ---------------- */
  async function runAiDebug() {
    const active = files.find((f) => f.id === activeFileId);
    if (!active) return;
    setAiLoading(true);
    setAiFindings([]);
    setAiResultText(null);
    try {
      const res = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "code_debug", code: active.content, language: active.language }),
      });
      const data = await res.json();
      setAiResultText(data.response ?? null);
      const findings = data.findings ?? data.fixes ?? data.issues ?? [];
      setAiFindings(findings);
    } catch (e) {
      setAiResultText("AI debug failed: " + String(e));
    } finally {
      setAiLoading(false);
    }
  }
  async function callAiRefactor() {
    const active = files.find((f) => f.id === activeFileId);
    if (!active) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "code_refactor", code: active.content, language: active.language }),
      });
      const data = await res.json();
      if (data.code) {
        if (confirm("Apply refactored code?")) updateFileContent(active.id, data.code);
        else setAiResultText("Refactor available.");
      } else {
        setAiResultText(data.response ?? "No refactor result.");
      }
    } catch (e) {
      setAiResultText("AI refactor failed: " + String(e));
    } finally {
      setAiLoading(false);
    }
  }
  async function callAiExplain() {
    const active = files.find((f) => f.id === activeFileId);
    if (!active) return;
    setAiLoading(true);
    setAiResultText(null);
    try {
      const res = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "code_explain", code: active.content, language: active.language }),
      });
      const data = await res.json();
      setAiResultText(data.response ?? "No explanation.");
    } catch (e) {
      setAiResultText("AI explain failed: " + String(e));
    } finally {
      setAiLoading(false);
    }
  }

  /* ---------------- run file ---------------- */
  async function runActiveFile() {
    const active = files.find((f) => f.id === activeFileId);
    if (!active) return;
    setConsoleLines([]);
    setRunning(true);
    try {
      if (["javascript"].includes(active.language)) {
        const html = `<!doctype html><html><body><script>
(function(){function send(t,p){ parent.postMessage({type:t,payload:p}, '*'); } var orig=console.log; console.log=function(){ send('console', Array.from(arguments)); orig.apply(console,arguments); }; window.onerror=function(a,b,c,d){ send('error', a+' at '+b+':'+c+':'+d); };
})(); try { ${active.content} } catch(e) { parent.postMessage({type:'error', payload: e && e.stack ? e.stack : String(e)}, '*'); }
</script></body></html>`;
        if (iframeRef.current) iframeRef.current.srcdoc = html;
        setRunning(false);
        return;
      }
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: active.content, language: active.language }),
      });
      const data = await res.json();
      const out = data.output ?? data.error ?? "No output";
      setConsoleLines((c) => [...c, out]);
    } catch (e) {
      setConsoleLines((c) => [...c, `Run error: ${String(e)}`]);
    } finally {
      setRunning(false);
    }
  }

  /* ---------------- modal submit ---------------- */
  function handleModalSubmit() {
    if (!modalOpen) return;
    if (modalOpen.mode === "new") {
      if (modalValue.includes(".")) {
        const lang = extToLang(modalValue);
        const file = createFileObj(modalValue, lang, defaultContentFor(lang));
        setFiles((p) => [file, ...p]);
        openFile(file.id);
        setModalOpen(null);
        setModalValue("");
      } else {
        createNewFile(modalValue || "javascript");
        setModalValue("");
      }
    } else if (modalOpen.mode === "rename") {
      const id = modalOpen.payload?.id;
      if (id) applyRename(id, modalValue);
      setModalValue("");
    } else {
      setModalOpen(null);
      setModalValue("");
    }
  }
  function applyRename(id: string, newName: string) {
    if (!newName) return;
    if (files.some((x) => x.name === newName && x.id !== id)) {
      alert("File with that name already exists");
      return;
    }
    setFiles((p) => p.map((x) => (x.id === id ? { ...x, name: newName } : x)));
    setModalOpen(null);
  }
  function applyAiFix(fix: any) {
    if (!fix) return;

    const active = files.find(f => f.id === activeFileId);
    if (!active) return;

    let cleaned = "";

    if (typeof fix === "string") {
      cleaned = fix
        .replace(/```[a-zA-Z]*/g, "")
        .replace(/```/g, "")
        .trim();
    } else if (fix.code) {
      cleaned = fix.code;
    } else if (fix.snippet) {
      cleaned = fix.snippet;
    }

    updateFileContent(active.id, cleaned);
    setConsoleLines(["AI Fix applied successfully"]);
  }



  const activeFile = files.find((f) => f.id === activeFileId) ?? null;

  /* ---------------- render ---------------- */
  return (
    <div style={{ height: "100vh", background: THEME.bg, color: THEME.fg, overflow: "hidden", fontSize: 13 }}>
      {/* TOP TAB BAR (VS Code style) */}
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
                onClick={() => setActiveFileId(id)}
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
                    closeTab(id);
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
            onClick={() => runActiveFile()}
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
            onClick={() => runAiDebug()}
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


      {/* main area: activity bar, explorer, editor, ai */}
      <div style={{
        display: "flex",
        height: `calc(100vh - 56px)`,
        minHeight: 0,          // ← CRITICAL FIX
        overflow: "hidden",    // prevents bottom gap
      }}>
        {/* Activity bar */}
        <div style={{ width: 48, background: THEME.sidebar, borderRight: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 10 }}>
          <ActivityIcon title="JS" onClick={() => createNewFile("javascript")} icon="/icons/lang/js.svg" />
          <ActivityIcon title="Python" onClick={() => createNewFile("python")} icon="/icons/lang/python.svg" />
          <ActivityIcon title="C" onClick={() => createNewFile("c")} icon="/icons/lang/c.svg" />
          <ActivityIcon title="C++" onClick={() => createNewFile("cpp")} icon="/icons/lang/c++.svg" />
          <ActivityIcon title="Java" onClick={() => createNewFile("java")} icon="/icons/lang/java.svg" />
          <ActivityIcon title="HTML" onClick={() => createNewFile("html")} icon="/icons/lang/html.svg" />
          <ActivityIcon title="CSS" onClick={() => createNewFile("css")} icon="/icons/lang/css.svg" />
          <ActivityIcon title="JSON" onClick={() => createNewFile("json")} icon="/icons/lang/json.svg" />
        </div>

        {/* LEFT SIDE (Explorer + Resizer) */}
        <div style={{ display: "flex", height: "100%", minHeight: 0 }}>

          {/* EXPLORER PANEL */}
          <div
            style={{
              width: leftWidth,
              minWidth: 140,
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
                  onClick={() => setModalOpen({ mode: "new" })}
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
                  onClick={() => setModalOpen({ mode: "import" })}
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
              {files.map((f) => (
                <div
                  key={f.id}
                  onClick={() => openFile(f.id)}
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
                    <img
                      src={`/icons/lang/${getFileIcon(f.name)}`}
                      className="w-5 h-5"
                    />
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
                        renameFileStart(f.id);
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
                        deleteFilePrompt(f.id);
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
              ))}
            </div>
          </div>

          {/* LEFT RESIZER BAR — FULL HEIGHT */}
          <div
            onMouseDown={() => {
              desiredLeftRef.current = leftWidth;
              setIsDraggingLeft(true);
              setLeftTransition(false);
            }}
            style={{
              width: 6,
              cursor: "col-resize",
              background: "transparent",
              height: "100%",
            }}
            title="Resize Explorer Panel"
          />
        </div>


        {/* Editor center */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0, // IMPORTANT FIX
          background: THEME.bg,
        }}
        >
          <div style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            minHeight: 0,  // ← PATCH FIX HERE
          }}>
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <MonacoEditor
                height="100%"
                language={activeFile?.language ?? "javascript"}
                value={activeFile?.content ?? ""}
                theme="vs-dark"
                onChange={(v) => activeFile && updateFileContent(activeFile.id, v ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  automaticLayout: true,
                }}
              />

            </div>

            {/* vertical resizer between editor and AI panel */}
            <div
              onMouseDown={() => { desiredRightRef.current = rightWidth; setIsDraggingRight(true); setRightTransition(false); }}
              style={{ width: 6, cursor: "col-resize", background: "transparent" }}
              title="Drag to resize AI panel"
            />

            {/* AI panel */}
            <div style={{ width: rightWidth, minWidth: 200, background: THEME.panel, borderLeft: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", transition: rightTransition ? "width 160ms ease" : "none" }}>
              <div style={{ padding: 12, borderBottom: `1px solid ${THEME.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>AI Assistant</div>
                <div style={{ color: "#9c9c9c", fontSize: 12 }}>Suggestions</div>
              </div>

              <div style={{ padding: 12, overflow: "auto", flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button onClick={() => runAiDebug()} style={{ padding: "6px 10px", borderRadius: 6, background: "#181818", color: THEME.fg, border: `1px solid ${THEME.border}`, cursor: "pointer" }}>Debug</button>
                  <button onClick={() => callAiRefactor()} style={{ padding: "6px 10px", borderRadius: 6, background: "#181818", color: THEME.fg, border: `1px solid ${THEME.border}`, cursor: "pointer" }}>Refactor</button>
                  <button onClick={() => callAiExplain()} style={{ padding: "6px 10px", borderRadius: 6, background: "#181818", color: THEME.fg, border: `1px solid ${THEME.border}`, cursor: "pointer" }}>Explain</button>
                </div>

                <div style={{ background: THEME.panelAlt, padding: 10, borderRadius: 8, minHeight: 160 }}>
                  {aiLoading && <div style={{ color: "#9c9c9c" }}>AI working…</div>}
                  {!aiLoading && aiFindings.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {aiFindings.map((fix, i) => (
                        <div key={i} style={{ padding: 10, background: "#0f1314", borderRadius: 6 }}>
                          <div style={{ color: THEME.fg, fontWeight: 700 }}>{fix.desc ?? `Issue ${i + 1}`}</div>
                          <div style={{ color: "#9c9c9c", marginTop: 6, whiteSpace: "pre-wrap", fontSize: 12 }}>{fix.snippet ?? fix.details ?? ""}</div>
                          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                            <button onClick={() => applyAiFix(fix)} style={{ background: "#0f7a3f", color: "#fff", padding: "6px 8px", borderRadius: 4 }}>Apply</button>
                            <button onClick={() => setConsoleLines((c) => [...c, `Ignored fix: ${fix.desc ?? "fix"}`])} style={{ background: "#2a2a2a", color: THEME.fg, padding: "6px 8px", borderRadius: 4 }}>Ignore</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!aiLoading && aiResultText && <pre style={{ color: THEME.fg, whiteSpace: "pre-wrap" }}>{aiResultText}</pre>}
                  {!aiLoading && !aiResultText && aiFindings.length === 0 && <div style={{ color: "#9c9c9c" }}>No AI output yet.</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Console */}
          {/* Console */}
          <div
            style={{
              height: isConsoleOpen ? consoleHeight : 0,
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
              onMouseDown={() => {
                desiredConsoleRef.current = consoleHeight;
                setIsDraggingConsole(true);
                setConsoleTransition(false);
              }}
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
                  onClick={() => setConsoleLines([])}
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
                  onClick={() => setIsConsoleOpen(false)}
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

            {/* Console Output — FULL HEIGHT FIXED HERE */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 12,
                background: "#0b0b0b",
                fontFamily: "monospace",
                fontSize: 13,
                color: THEME.fg,
                minHeight: 0,
              }}
            >
              {consoleLines.length === 0 ? (
                <div style={{ color: "#9c9c9c" }}>
                  No logs yet. Run the file to see output.
                </div>
              ) : (
                consoleLines.map((ln, i) => (
                  <div key={i} style={{ whiteSpace: "pre-wrap", marginBottom: 6 }}>
                    {ln}
                  </div>
                ))
              )}
            </div>
          </div>


          {!isConsoleOpen && (
            <div style={{ position: "fixed", right: 20, bottom: 20 }}>
              <button onClick={() => setIsConsoleOpen(true)} style={{ padding: "8px 12px", background: "#0b0b0b", color: THEME.fg, borderRadius: 6 }}>Show Console ▲</button>
            </div>
          )}
        </div>
      </div>

      {/* runner iframe */}
      <iframe ref={iframeRef} title="runner" sandbox="allow-scripts" style={{ display: "none" }} />

      {/* modal (new/rename/import/delete) */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 120 }}>
          <div onClick={() => setModalOpen(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <div style={{ width: 560, background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 8, zIndex: 70 }}>
            <div style={{ padding: 14, borderBottom: `1px solid ${THEME.border}` }}>
              <div style={{ fontWeight: 800, color: THEME.fg }}>
                {modalOpen.mode === "new" ? "Create new file" : modalOpen.mode === "rename" ? "Rename file" : modalOpen.mode === "import" ? "Import files" : "Delete file"}
              </div>
            </div>
            <div style={{ padding: 14 }}>
              {modalOpen.mode === "import" ? (
                <ImportPanel onImported={(newFiles) => {
                  const objs = newFiles.map((n) => createFileObj(n.name, extToLang(n.name), n.content));
                  setFiles((p) => [...objs, ...p]);
                  if (objs[0]) openFile(objs[0].id);
                  setModalOpen(null);
                }} onCancel={() => setModalOpen(null)} />
              ) : modalOpen.mode === "delete" ? (
                <>
                  <div style={{ color: THEME.fg, marginBottom: 8 }}>
                    Delete “<strong>{modalOpen.payload?.name}</strong>”?
                  </div>
                  <div style={{ color: "#9c9c9c", marginBottom: 12 }}>This action cannot be undone.</div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={() => setModalOpen(null)} style={{ padding: "8px 12px", background: "transparent", borderRadius: 6, border: "none", color: THEME.fg }}>Cancel</button>
                    <button onClick={() => performDelete(modalOpen.payload?.id)} style={{ padding: "8px 12px", background: "#b42318", color: "#fff", borderRadius: 6, border: "none" }}>Delete</button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    autoFocus
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleModalSubmit(); if (e.key === "Escape") setModalOpen(null); }}
                    placeholder={modalOpen.mode === "new" ? "Enter filename (example.js) or language (javascript)" : "Enter new filename (with extension)"}
                    style={{ width: "100%", padding: 10, background: "#121212", border: `1px solid ${THEME.border}`, color: THEME.fg, borderRadius: 6 }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                    <button onClick={() => setModalOpen(null)} style={{ padding: "8px 12px", background: "transparent", borderRadius: 6, border: "none", color: THEME.fg }}>Cancel</button>
                    <button onClick={() => handleModalSubmit()} style={{ padding: "8px 12px", background: THEME.accent, color: "#fff", borderRadius: 6, border: "none" }}>Create</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- helpers & small components ---------------- */

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js": return "js.svg";
    case "ts": return "ts.svg";
    case "py": return "python.svg";
    case "c": return "c.svg";
    case "cpp":
    case "cc":
    case "cxx":
    case "c++": return "c++.svg";
    case "java": return "java.svg";
    case "html": return "html.svg";
    case "css": return "css.svg";
    case "json": return "json.svg";
    default: return "js.svg";
  }
}

function createFileObj(name: string, language: string, content = ""): FileObj {
  return { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, name, language, content };
}
function langToExt(lang: string) {
  switch (lang) {
    case "javascript": return "js";
    case "typescript": return "ts";
    case "python": return "py";
    case "cpp": return "cpp";
    case "c": return "c";
    case "java": return "java";
    case "html": return "html";
    case "css": return "css";
    case "json": return "json";
    default: return "txt";
  }
}
function extToLang(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js": return "javascript";
    case "ts": return "typescript";
    case "py": return "python";
    case "cpp":
    case "cc":
    case "cxx": return "cpp";
    case "c": return "c";
    case "java": return "java";
    case "html":
    case "htm": return "html";
    case "css": return "css";
    case "json": return "json";
    default: return "plaintext";
  }
}
function defaultContentFor(lang: string) {
  switch (lang) {
    case "javascript": return `console.log("Hello from JS");`;
    case "python": return `print("Hello from Python")`;
    case "c": return `#include <stdio.h>\nint main(){ printf("Hello C\\n"); return 0; }`;
    case "cpp": return `#include <iostream>\nint main(){ std::cout<<"Hello C++\\n"; return 0; }`;
    case "java": return `public class Main { public static void main(String[] args){ System.out.println("Hello Java"); } }`;
    case "html": return `<html><body><h1>Hello HTML</h1></body></html>`;
    case "css": return `body { font-family: system-ui; }`;
    default: return "";
  }
}

/* ActivityIcon */
function ActivityIcon({ title, onClick, icon }: { title: string; onClick: () => void; icon: string }) {
  return (
    <div title={title} onClick={onClick} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, cursor: "pointer" }}>
      <img src={icon} alt={title} style={{ width: 20, height: 20 }} />
    </div>
  );
}

/* ImportPanel */
function ImportPanel({ onImported, onCancel }: { onImported: (files: { name: string; content: string }[]) => void; onCancel: () => void; }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list);
    const readers = arr.map((f) => new Promise<{ name: string; content: string }>((res) => {
      const r = new FileReader();
      r.onload = () => res({ name: f.name, content: String(r.result) });
      r.readAsText(f);
    }));
    Promise.all(readers).then((results) => onImported(results));
  }
  return (
    <div>
      <input ref={inputRef} type="file" multiple onChange={handleFiles} />
      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onCancel} style={{ padding: "8px 12px", background: "transparent", borderRadius: 6, border: "none", color: "#d4d4d4" }}>Cancel</button>
      </div>
    </div>
  );
}
