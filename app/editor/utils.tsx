import { FileObj } from "./types";
import { LANGUAGES } from "@/lib/constants";
import { SiJavascript } from "react-icons/si"; // Fallback icon

export function getFileIcon(filename: string) {
    // Deprecated: This was for SVG paths. 
    // We keep it for backward compatibility if needed, but we should prefer getFileIconComponent
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

export function getFileIconComponent(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase();
    const langId = extToLang(filename);
    const lang = LANGUAGES.find(l => l.id === langId);
    return lang?.iconComponent || SiJavascript;
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
        case "php": return "php";
        case "ruby": return "rb";
        case "sql": return "sql";
        case "swift": return "swift";
        case "kotlin": return "kt";
        case "dart": return "dart";
        case "csharp": return "cs";
        case "go": return "go";
        case "rust": return "rs";
        case "r": return "r";
        case "julia": return "jl";
        case "scala": return "scala";
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
        case "php": return "php";
        case "rb": return "ruby";
        case "sql": return "sql";
        case "swift": return "swift";
        case "kt": return "kotlin";
        case "dart": return "dart";
        case "cs": return "csharp";
        case "go": return "go";
        case "rs": return "rust";
        case "r": return "r";
        case "jl": return "julia";
        case "scala": return "scala";
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
        case "html": return `<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello HTML</h1>\n</body>\n</html>`;
        case "css": return `body { font-family: sans-serif; background: #f0f0f0; }`;
        case "php": return `<?php\n  echo "Hello from PHP";\n?>`;
        case "ruby": return `puts "Hello from Ruby"`;
        case "sql": return `SELECT 'Hello from SQL' as greeting;`;
        case "swift": return `print("Hello from Swift")`;
        case "kotlin": return `fun main() {\n    println("Hello from Kotlin")\n}`;
        case "dart": return `void main() {\n  print('Hello from Dart');\n}`;
        case "csharp": return `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C#");\n    }\n}`;
        case "go": return `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go")\n}`;
        case "rust": return `fn main() {\n    println!("Hello from Rust");\n}`;
        case "r": return `print("Hello from R")`;
        case "julia": return `println("Hello from Julia")`;
        case "scala": return `object Main extends App {\n  println("Hello from Scala")\n}`;
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
