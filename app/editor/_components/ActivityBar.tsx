import React from "react";
import { THEME } from "../types";
import { LANGUAGES } from "@/lib/constants";

interface ActivityBarProps {
    onCreateFile: (lang: string) => void;
}

export default function ActivityBar({ onCreateFile }: ActivityBarProps) {
    return (
        <div
            style={{
                width: 52,
                background: THEME.sidebar,
                borderRight: `1px solid ${THEME.border}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                paddingTop: 10,
                paddingBottom: 10,
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
            }}
            className="no-scrollbar"
        >
            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {LANGUAGES.map((lang) => {
                const Icon = lang.iconComponent;
                return (
                    <ActivityIcon
                        key={lang.id}
                        title={lang.name}
                        onClick={() => onCreateFile(lang.id)}
                        iconComponent={Icon}
                    />
                );
            })}
            <ActivityIcon
                title="JSON"
                onClick={() => onCreateFile("json")}
                iconComponent={null}
                fallbackIcon="/icons/lang/json.svg"
            />
        </div>
    );
}

function ActivityIcon({ title, onClick, iconComponent: Icon, fallbackIcon }: { title: string; onClick: () => void; iconComponent: React.ElementType | null; fallbackIcon?: string }) {
    return (
        <div
            title={title}
            onClick={onClick}
            style={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                cursor: "pointer",
                flexShrink: 0,
                color: "#888",
                transition: "color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = "#888";
                e.currentTarget.style.background = "transparent";
            }}
        >
            {Icon ? (
                <Icon style={{ width: 22, height: 22 }} />
            ) : (
                <img src={fallbackIcon} alt={title} style={{ width: 22, height: 22 }} />
            )}
        </div>
    );
}
