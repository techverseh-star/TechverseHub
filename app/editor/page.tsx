"use client";
import { getLoggedUser } from "@/lib/auth";
import React, { useEffect, useRef, useState } from "react";
import { THEME, FileObj } from "./types";
import { createFileObj, extToLang, langToExt, defaultContentFor, debounce, stringify } from "./utils";

import ActivityBar from "./_components/ActivityBar";
import FileExplorer from "./_components/FileExplorer";
import EditorTabs from "./_components/EditorTabs";
import CodeEditor from "./_components/CodeEditor";
import ConsolePanel from "./_components/ConsolePanel";
import AIPanel from "./_components/AIPanel";

// Import Panel for Modal
function ImportPanel({ onImported, onCancel, existingFiles }: { onImported: (files: { name: string; content: string }[]) => void; onCancel: () => void; existingFiles: FileObj[] }) {
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
    Promise.all(readers).then((results) => {
      const unique = results.filter(r => !existingFiles.some(ef => ef.name === r.name));
      if (unique.length < results.length) {
        alert(`Skipped ${results.length - unique.length} duplicate file(s).`);
      }
      if (unique.length > 0) onImported(unique);
      else onCancel();
    });
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

export default function EditorPage() {
  // files
  const [files, setFiles] = useState<FileObj[]>([]);

  const [activeFileId, setActiveFileId] = useState<string>("");
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);

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
  const [stdin, setStdin] = useState("");
  const [modalOpen, setModalOpen] = useState<null | { mode: "new" | "rename" | "import" | "delete"; payload?: any }>(null);
  const [modalValue, setModalValue] = useState("");
  // Chat State
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant" | "system"; content: string }[]>([]);
  const [running, setRunning] = useState(false);

  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  function triggerSave(user_id: string, file: FileObj) {
    if (saveTimeouts.current[file.id]) {
      clearTimeout(saveTimeouts.current[file.id]);
    }
    saveTimeouts.current[file.id] = setTimeout(async () => {
      await fetch("/api/files/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, file }),
      });
      delete saveTimeouts.current[file.id];
    }, 700);
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

        triggerSave(user.id, defaultFile);
      } else {
        // Deduplicate files by name, keeping the most recent one
        const uniqueFilesMap = new Map<string, FileObj>();

        // Sort by updated_at desc (if available) so we process newest first
        const sorted = (data.files as any[]).sort((a, b) => {
          const da = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const db = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return db - da;
        });

        for (const f of sorted) {
          // Map keys are filenames. Since we sorted by newest first, 
          // the first time we see a filename, it's the newest version.
          if (!uniqueFilesMap.has(f.name)) {
            // Map the DB fields to our FileObj type
            uniqueFilesMap.set(f.name, {
              id: f.file_id || f.id, // Handle DB field name difference if any
              name: f.name,
              language: f.language,
              content: f.content,
              updated_at: f.updated_at
            });
          }
        }

        const uniqueFiles = Array.from(uniqueFilesMap.values());

        setFiles(uniqueFiles);
        if (uniqueFiles.length > 0) {
          setActiveFileId(uniqueFiles[0].id);
          setOpenFileIds([uniqueFiles[0].id]);
        }
      }
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
          triggerSave(user.id, { ...file, content });
        }
      }
    })();
  }

  function createNewFileHandler(language?: string, suggestedName?: string) {
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

    // Save immediately to Supabase
    (async () => {
      const user = await getLoggedUser();
      if (user) triggerSave(user.id, file);
    })();
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
    // Cancel any pending save for this file
    if (saveTimeouts.current[id]) {
      clearTimeout(saveTimeouts.current[id]);
      delete saveTimeouts.current[id];
    }

    const updated = files.filter((x) => x.id !== id);

    // Call API to delete from DB
    (async () => {
      const user = await getLoggedUser();
      if (user) {
        await fetch("/api/files/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, file_id: id }),
        });
      }
    })();

    if (updated.length === 0) {
      const newFile = ensureAtLeastOneFile(setFiles, setActiveFileId, setOpenFileIds);
      (async () => {
        const user = await getLoggedUser();
        if (user) triggerSave(user.id, newFile);
      })();
      return;
    }

    setFiles(updated);
    setOpenFileIds((p) => p.filter((x) => x !== id));

    if (activeFileId === id) {
      setActiveFileId(updated[0].id);
    }

    setModalOpen(null);
  }

  /* ---------------- AI Chat ---------------- */
  async function handleSendMessage(text: string) {
    const active = files.find((f) => f.id === activeFileId);
    if (!active) return;

    const newMessage = { role: "user" as const, content: text };
    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "chat",
          code: active.content,
          language: active.language,
          messages: updatedMessages
        }),
      });
      const data = await res.json();
      setAiLoading(false); // Stop loading spinner, start typing

      const fullResponse = data.response || "Sorry, I couldn't generate a response.";

      // Add empty assistant message
      setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

      // Simulate typing
      let currentText = "";
      const step = 1; // chars per tick
      const delay = 15; // ms per tick

      for (let i = 0; i < fullResponse.length; i += step) {
        await new Promise(r => setTimeout(r, delay));
        const chunk = fullResponse.slice(i, i + step);
        currentText += chunk;
        setChatMessages(prev => {
          const newArr = [...prev];
          newArr[newArr.length - 1] = { role: "assistant", content: currentText };
          return newArr;
        });
      }

    } catch (e) {
      setAiLoading(false);
      setChatMessages(prev => [...prev, { role: "assistant", content: "Error: " + String(e) }]);
    }
  }

  function handleApplyCode(code: string) {
    const active = files.find(f => f.id === activeFileId);
    if (!active) return;
    updateFileContent(active.id, code);
    setConsoleLines(prev => [...prev, "Applied code from TechVerseHub AI."]);
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
      if (stdin) {
        setConsoleLines((c) => [...c, `> ${stdin}`]);
      }
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: active.content, language: active.language, testInput: stdin }),
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
        createNewFileHandler(modalValue || "javascript");
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

  const activeFile = files.find((f) => f.id === activeFileId) ?? null;

  return (
    <div style={{ height: "100vh", background: THEME.bg, color: THEME.fg, overflow: "hidden", fontSize: 13 }}>
      <EditorTabs
        files={files}
        openFileIds={openFileIds}
        activeFileId={activeFileId}
        onOpenFile={openFile}
        onCloseTab={closeTab}
        onRun={runActiveFile}
        onDebug={() => handleSendMessage("Debug this code")}
      />

      <div style={{ display: "flex", height: `calc(100vh - 56px)`, minHeight: 0, overflow: "hidden" }}>
        <ActivityBar onCreateFile={createNewFileHandler} />

        <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            leftWidth={leftWidth}
            leftTransition={leftTransition}
            onOpenFile={openFile}
            onRenameFile={renameFileStart}
            onDeleteFile={deleteFilePrompt}
            onNewFile={() => setModalOpen({ mode: "new" })}
            onImportFile={() => setModalOpen({ mode: "import" })}
          />

          <div
            onMouseDown={() => {
              desiredLeftRef.current = leftWidth;
              setIsDraggingLeft(true);
              setLeftTransition(false);
            }}
            style={{ width: 6, cursor: "col-resize", background: "transparent", height: "100%" }}
            title="Resize Explorer Panel"
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: THEME.bg }}>
          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
            <CodeEditor activeFile={activeFile} onUpdateContent={updateFileContent} />

            <AIPanel
              rightWidth={rightWidth}
              rightTransition={rightTransition}
              messages={chatMessages}
              loading={aiLoading}
              onSendMessage={handleSendMessage}
              onApplyCode={handleApplyCode}
              onDragStart={() => {
                desiredRightRef.current = rightWidth;
                setIsDraggingRight(true);
                setRightTransition(false);
              }}
            />
          </div>

          <ConsolePanel
            consoleLines={consoleLines}
            consoleHeight={consoleHeight}
            isConsoleOpen={isConsoleOpen}
            consoleTransition={consoleTransition}
            stdin={stdin}
            onSetStdin={setStdin}
            onClearConsole={() => setConsoleLines([])}
            onCloseConsole={() => setIsConsoleOpen(false)}
            onOpenConsole={() => setIsConsoleOpen(true)}
            onDragStart={() => {
              desiredConsoleRef.current = consoleHeight;
              setIsDraggingConsole(true);
              setConsoleTransition(false);
            }}
            onRun={runActiveFile}
          />
        </div>
      </div>

      <iframe ref={iframeRef} title="runner" sandbox="allow-scripts" style={{ display: "none" }} />

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
                <ImportPanel existingFiles={files} onImported={(newFiles) => {
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
