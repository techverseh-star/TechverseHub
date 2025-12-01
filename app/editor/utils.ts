import { FileObj } from "./types";

export function getFileIcon(filename: string) {
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

export function createFileObj(name: string, language: string, content = ""): FileObj {
    return { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, name, language, content };
}

export function langToExt(lang: string) {
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

export function extToLang(name: string) {
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

export function defaultContentFor(lang: string) {
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

export function stringify(v: any) {
    try {
        if (typeof v === "string") return v;
        return JSON.stringify(v);
    } catch {
        return String(v);
    }
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms = 700) {
    let t: any;
    return (...args: Parameters<T>) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}
