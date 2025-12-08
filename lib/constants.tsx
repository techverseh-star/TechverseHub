import React from "react";
import {
    SiPython, SiJavascript, SiTypescript, SiC, SiCplusplus,
    SiHtml5, SiCss3, SiPhp, SiRuby, SiMysql, SiSwift, SiKotlin,
    SiDart, SiGo, SiRust, SiR, SiJulia, SiScala
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbBrandCSharp } from "react-icons/tb";

export interface Language {
    id: string;
    name: string;
    iconComponent: React.ElementType;
    color: string;
    description?: string;
    lessons?: number;
    progress?: number;
    prefix?: string;
}

export const LANGUAGE_ICONS: Record<string, React.ElementType> = {
    python: SiPython,
    javascript: SiJavascript,
    typescript: SiTypescript,
    java: FaJava,
    c: SiC,
    cpp: SiCplusplus,
    html: SiHtml5,
    css: SiCss3,
    php: SiPhp,
    ruby: SiRuby,
    sql: SiMysql,
    swift: SiSwift,
    kotlin: SiKotlin,
    dart: SiDart,
    csharp: TbBrandCSharp,
    go: SiGo,
    rust: SiRust,
    r: SiR,
    julia: SiJulia,
    scala: SiScala
};

export const LANGUAGES: Language[] = [
    {
        id: "python",
        name: "Python",
        iconComponent: SiPython,
        color: "blue",
        description: "Beginner-friendly, versatile language",
        lessons: 15,
        prefix: "py-"
    },
    {
        id: "javascript",
        name: "JavaScript",
        iconComponent: SiJavascript,
        color: "yellow",
        description: "The language of the web",
        lessons: 15,
        prefix: "js-"
    },
    {
        id: "typescript",
        name: "TypeScript",
        iconComponent: SiTypescript,
        color: "blue",
        description: "JavaScript with static types",
        lessons: 8,
        prefix: "ts-"
    },
    {
        id: "java",
        name: "Java",
        iconComponent: FaJava,
        color: "orange",
        description: "Enterprise & Android development",
        lessons: 8,
        prefix: "java-"
    },
    {
        id: "c",
        name: "C",
        iconComponent: SiC,
        color: "gray",
        description: "Foundation of modern programming",
        lessons: 10,
        prefix: "c-"
    },
    {
        id: "cpp",
        name: "C++",
        iconComponent: SiCplusplus,
        color: "purple",
        description: "High-performance systems & games",
        lessons: 10,
        prefix: "cpp-"
    },
    {
        id: "html",
        name: "HTML",
        iconComponent: SiHtml5,
        color: "orange",
        description: "Structure of web pages",
        lessons: 5,
        prefix: "html-"
    },
    {
        id: "css",
        name: "CSS",
        iconComponent: SiCss3,
        color: "blue",
        description: "Styling of web pages",
        lessons: 5,
        prefix: "css-"
    },
    {
        id: "php",
        name: "PHP",
        iconComponent: SiPhp,
        color: "purple",
        description: "Server-side scripting",
        lessons: 5,
        prefix: "php-"
    },
    {
        id: "ruby",
        name: "Ruby",
        iconComponent: SiRuby,
        color: "red",
        description: "Productive and elegant",
        lessons: 5,
        prefix: "rb-"
    },
    {
        id: "sql",
        name: "SQL",
        iconComponent: SiMysql,
        color: "blue",
        description: "Database management",
        lessons: 5,
        prefix: "sql-"
    },
    {
        id: "swift",
        name: "Swift",
        iconComponent: SiSwift,
        color: "orange",
        description: "iOS and macOS development",
        lessons: 5,
        prefix: "swift-"
    },
    {
        id: "kotlin",
        name: "Kotlin",
        iconComponent: SiKotlin,
        color: "purple",
        description: "Modern Android development",
        lessons: 5,
        prefix: "kt-"
    },
    {
        id: "dart",
        name: "Dart",
        iconComponent: SiDart,
        color: "blue",
        description: "Client-optimized for fast apps",
        lessons: 5,
        prefix: "dart-"
    },
    {
        id: "csharp",
        name: "C#",
        iconComponent: TbBrandCSharp,
        color: "purple",
        description: "Versatile .NET language",
        lessons: 5,
        prefix: "cs-"
    },
    {
        id: "go",
        name: "Go",
        iconComponent: SiGo,
        color: "cyan",
        description: "Simple, reliable, efficient",
        lessons: 5,
        prefix: "go-"
    },
    {
        id: "rust",
        name: "Rust",
        iconComponent: SiRust,
        color: "orange",
        description: "Performance and safety",
        lessons: 5,
        prefix: "rs-"
    },
    {
        id: "r",
        name: "R",
        iconComponent: SiR,
        color: "blue",
        description: "Statistical computing",
        lessons: 5,
        prefix: "r-"
    },
    {
        id: "julia",
        name: "Julia",
        iconComponent: SiJulia,
        color: "purple",
        description: "High-performance numerical analysis",
        lessons: 5,
        prefix: "jl-"
    },
    {
        id: "scala",
        name: "Scala",
        iconComponent: SiScala,
        color: "red",
        description: "Scalable language",
        lessons: 5,
        prefix: "scala-"
    }
];
