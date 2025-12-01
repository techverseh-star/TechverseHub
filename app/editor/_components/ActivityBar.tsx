import React from "react";
import { THEME } from "../types";


interface ActivityBarProps {
    onCreateFile: (lang: string) => void;
}

export default function ActivityBar({ onCreateFile }: ActivityBarProps) {
    return (
        <div style={{ width: 48, background: THEME.sidebar, borderRight: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 10 }}>
            <ActivityIcon title="JS" onClick={() => onCreateFile("javascript")} icon="/icons/lang/js.svg" />
            <ActivityIcon title="Python" onClick={() => onCreateFile("python")} icon="/icons/lang/python.svg" />
            <ActivityIcon title="C" onClick={() => onCreateFile("c")} icon="/icons/lang/c.svg" />
            <ActivityIcon title="C++" onClick={() => onCreateFile("cpp")} icon="/icons/lang/c++.svg" />
            <ActivityIcon title="Java" onClick={() => onCreateFile("java")} icon="/icons/lang/java.svg" />
            <ActivityIcon title="HTML" onClick={() => onCreateFile("html")} icon="/icons/lang/html.svg" />
            <ActivityIcon title="CSS" onClick={() => onCreateFile("css")} icon="/icons/lang/css.svg" />
            <ActivityIcon title="JSON" onClick={() => onCreateFile("json")} icon="/icons/lang/json.svg" />
        </div>
    );
}

function ActivityIcon({ title, onClick, icon }: { title: string; onClick: () => void; icon: string }) {
    return (
        <div title={title} onClick={onClick} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, cursor: "pointer" }}>
            <img src={icon} alt={title} style={{ width: 20, height: 20 }} />
        </div>
    );
}
