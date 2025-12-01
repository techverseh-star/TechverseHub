export type FileObj = {
    id: string;
    name: string;
    language: string;
    content: string;
    updated_at?: string;
};

export type Theme = {
    bg: string;
    panel: string;
    sidebar: string;
    border: string;
    fg: string;
    accent: string;
    panelAlt: string;
    tabActiveBg: string;
    tabInactiveBg: string;
    tabHoverBg: string;
};

export const THEME: Theme = {
    bg: "#1E1E1E",
    panel: "#0F1113",
    sidebar: "#252526",
    border: "#2B2B2B",
    fg: "#D4D4D4",
    accent: "#007ACC",
    panelAlt: "#0B0B0C",
    tabActiveBg: "#252526",
    tabInactiveBg: "transparent",
    tabHoverBg: "#2a2a2a",
};
