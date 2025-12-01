import React from "react";

export interface Language {
    id: string;
    name: string;
    icon: string; // Path to SVG
    color: string;
    description?: string;
    lessons?: number;
    progress?: number;
    prefix?: string;
}

export const LANGUAGES: Language[] = [
    {
        id: "python",
        name: "Python",
        icon: "/icons/lang/python.svg",
        color: "blue",
        description: "Beginner-friendly, versatile language",
        lessons: 15,
        prefix: "py-"
    },
    {
        id: "javascript",
        name: "JavaScript",
        icon: "/icons/lang/js.svg",
        color: "yellow",
        description: "The language of the web",
        lessons: 15,
        prefix: "js-"
    },
    {
        id: "typescript",
        name: "TypeScript",
        icon: "/icons/lang/typescript.svg",
        color: "blue",
        description: "JavaScript with static types",
        lessons: 8,
        prefix: "ts-"
    },
    {
        id: "java",
        name: "Java",
        icon: "/icons/lang/java.svg",
        color: "orange",
        description: "Enterprise & Android development",
        lessons: 8,
        prefix: "java-"
    },
    {
        id: "c",
        name: "C",
        icon: "/icons/lang/c.svg",
        color: "gray",
        description: "Foundation of modern programming",
        lessons: 10,
        prefix: "c-"
    },
    {
        id: "cpp",
        name: "C++",
        icon: "/icons/lang/c++.svg",
        color: "purple",
        description: "High-performance systems & games",
        lessons: 10,
        prefix: "cpp-"
    },
];
