"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket, Code, Clock, Star, ChevronRight, Layers,
  Terminal, Globe, Database, Cpu, Lock, Zap, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍", color: "blue" },
  { id: "javascript", name: "JavaScript", icon: "⚡", color: "yellow" },
  { id: "typescript", name: "TypeScript", icon: "📘", color: "blue" },
  { id: "java", name: "Java", icon: "☕", color: "orange" },
  { id: "c", name: "C", icon: "🔧", color: "gray" },
  { id: "cpp", name: "C++", icon: "⚙️", color: "purple" },
];

interface Project {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  skills: string[];
  features: string[];
  icon: React.ReactNode;
}

const PROJECTS: Project[] = [
  {
    id: "py-1",
    title: "Todo CLI Application",
    description: "Build a command-line todo manager using pure Python with file persistence",
    language: "python",
    difficulty: "Beginner",
    duration: "2-3 hours",
    skills: ["File I/O", "Lists", "Dictionaries", "Functions"],
    features: ["Add/remove tasks", "Mark complete", "Save to JSON file"],
    icon: <Terminal className="h-6 w-6" />
  },
  {
    id: "py-2",
    title: "Password Generator & Manager",
    description: "Create a secure password generator and storage system using Python",
    language: "python",
    difficulty: "Intermediate",
    duration: "4-5 hours",
    skills: ["Random", "File Handling", "Encryption basics", "OOP"],
    features: ["Generate passwords", "Store encrypted", "Search passwords"],
    icon: <Lock className="h-6 w-6" />
  },
  {
    id: "py-3",
    title: "Data Analysis Tool",
    description: "Build a CSV data analyzer with statistics and filtering capabilities",
    language: "python",
    difficulty: "Advanced",
    duration: "6-8 hours",
    skills: ["File parsing", "Statistics", "Data structures", "Algorithms"],
    features: ["CSV parsing", "Calculate stats", "Filter & sort data"],
    icon: <Database className="h-6 w-6" />
  },

  {
    id: "js-1",
    title: "Interactive Calculator",
    description: "Build a fully functional calculator with keyboard support using vanilla JS",
    language: "javascript",
    difficulty: "Beginner",
    duration: "2-3 hours",
    skills: ["DOM Manipulation", "Events", "Functions", "CSS"],
    features: ["Basic operations", "Keyboard input", "History"],
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: "js-2",
    title: "Memory Card Game",
    description: "Create a memory matching card game with animations using pure JavaScript",
    language: "javascript",
    difficulty: "Intermediate",
    duration: "4-5 hours",
    skills: ["DOM", "Arrays", "Events", "CSS Animations"],
    features: ["Card matching", "Score tracking", "Timer"],
    icon: <Layers className="h-6 w-6" />
  },
  {
    id: "js-3",
    title: "Kanban Task Board",
    description: "Build a drag-and-drop task board with local storage persistence",
    language: "javascript",
    difficulty: "Advanced",
    duration: "6-8 hours",
    skills: ["Drag & Drop API", "Local Storage", "DOM", "Events"],
    features: ["Drag tasks", "Multiple columns", "Persistent data"],
    icon: <Globe className="h-6 w-6" />
  },

  {
    id: "ts-1",
    title: "Type-Safe Todo App",
    description: "Build a todo application with strict TypeScript types and interfaces",
    language: "typescript",
    difficulty: "Beginner",
    duration: "3-4 hours",
    skills: ["Interfaces", "Types", "Generics", "Enums"],
    features: ["CRUD operations", "Type validation", "Filtering"],
    icon: <Terminal className="h-6 w-6" />
  },
  {
    id: "ts-2",
    title: "CLI Expense Tracker",
    description: "Create a command-line expense tracker with TypeScript",
    language: "typescript",
    difficulty: "Intermediate",
    duration: "5-6 hours",
    skills: ["Type Guards", "Union Types", "Classes", "File I/O"],
    features: ["Track expenses", "Categories", "Reports"],
    icon: <Database className="h-6 w-6" />
  },
  {
    id: "ts-3",
    title: "Generic Data Structures",
    description: "Implement type-safe data structures (Stack, Queue, LinkedList)",
    language: "typescript",
    difficulty: "Advanced",
    duration: "6-8 hours",
    skills: ["Generics", "Classes", "Interfaces", "Iterators"],
    features: ["Stack", "Queue", "LinkedList", "Unit tests"],
    icon: <Cpu className="h-6 w-6" />
  },

  {
    id: "java-1",
    title: "Banking System Console App",
    description: "Build a banking system with accounts, transactions, and reports",
    language: "java",
    difficulty: "Beginner",
    duration: "4-5 hours",
    skills: ["OOP", "Collections", "File I/O", "Scanner"],
    features: ["Create accounts", "Deposit/withdraw", "View balance"],
    icon: <Lock className="h-6 w-6" />
  },
  {
    id: "java-2",
    title: "Library Management System",
    description: "Create a library system with book catalog and borrowing",
    language: "java",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    skills: ["OOP", "ArrayList", "HashMap", "File persistence"],
    features: ["Add books", "Search catalog", "Borrow/return"],
    icon: <Database className="h-6 w-6" />
  },
  {
    id: "java-3",
    title: "Multi-threaded File Processor",
    description: "Build a concurrent file processor using Java threads",
    language: "java",
    difficulty: "Advanced",
    duration: "8-10 hours",
    skills: ["Threads", "Synchronization", "Executors", "Concurrency"],
    features: ["Parallel processing", "Thread pool", "Progress tracking"],
    icon: <Cpu className="h-6 w-6" />
  },

  {
    id: "c-1",
    title: "Student Record System",
    description: "Build a file-based student database using structs and file I/O",
    language: "c",
    difficulty: "Beginner",
    duration: "3-4 hours",
    skills: ["Structs", "File I/O", "Arrays", "Pointers"],
    features: ["Add students", "Search records", "Save to file"],
    icon: <Database className="h-6 w-6" />
  },
  {
    id: "c-2",
    title: "Dynamic Array Library",
    description: "Implement a resizable array with memory management",
    language: "c",
    difficulty: "Intermediate",
    duration: "5-6 hours",
    skills: ["Pointers", "malloc/free", "Memory", "Data Structures"],
    features: ["Dynamic resize", "Insert/delete", "Memory efficient"],
    icon: <Cpu className="h-6 w-6" />
  },
  {
    id: "c-3",
    title: "Mini Shell",
    description: "Build a Unix-like command shell with pipes and redirection",
    language: "c",
    difficulty: "Advanced",
    duration: "10-15 hours",
    skills: ["fork/exec", "Pipes", "System calls", "Signal handling"],
    features: ["Run commands", "Pipes", "I/O redirection"],
    icon: <Terminal className="h-6 w-6" />
  },

  {
    id: "cpp-1",
    title: "Console Text Editor",
    description: "Build a text editor with file operations using C++ STL",
    language: "cpp",
    difficulty: "Beginner",
    duration: "3-4 hours",
    skills: ["STL strings", "fstream", "Vectors", "OOP"],
    features: ["Open/save files", "Edit text", "Line numbers"],
    icon: <Terminal className="h-6 w-6" />
  },
  {
    id: "cpp-2",
    title: "Template-based Container Library",
    description: "Create generic containers using C++ templates",
    language: "cpp",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    skills: ["Templates", "STL", "Iterators", "Operator overloading"],
    features: ["Generic stack", "Generic queue", "Custom iterators"],
    icon: <Layers className="h-6 w-6" />
  },
  {
    id: "cpp-3",
    title: "Memory Pool Allocator",
    description: "Implement a custom memory pool for efficient allocation",
    language: "cpp",
    difficulty: "Advanced",
    duration: "10-12 hours",
    skills: ["Memory management", "Placement new", "Templates", "RAII"],
    features: ["Fast allocation", "Memory reuse", "Leak detection"],
    icon: <Cpu className="h-6 w-6" />
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const filteredProjects = PROJECTS.filter(project => {
    const matchesLanguage = !selectedLanguage || project.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === "all" || project.difficulty === selectedDifficulty;
    return matchesLanguage && matchesDifficulty;
  });

  const getLanguageInfo = (langId: string) => LANGUAGES.find(l => l.id === langId);

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Intermediate": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Advanced": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Build Real <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Apply your skills by building complete applications from scratch. Each project includes step-by-step guidance and real-world features.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant={selectedLanguage === null ? "default" : "outline"}
            onClick={() => setSelectedLanguage(null)}
            className="gap-2"
          >
            All Languages
          </Button>
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.id}
              variant={selectedLanguage === lang.id ? "default" : "outline"}
              onClick={() => setSelectedLanguage(lang.id)}
              className="gap-2"
            >
              <span>{lang.icon}</span>
              {lang.name}
            </Button>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {["all", "Beginner", "Intermediate", "Advanced"].map((diff) => (
            <Badge
              key={diff}
              variant={selectedDifficulty === diff ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 ${selectedDifficulty === diff && diff !== "all"
                ? getDifficultyStyles(diff)
                : ""
                }`}
              onClick={() => setSelectedDifficulty(diff)}
            >
              {diff === "all" ? "All Levels" : diff}
            </Badge>
          ))}
        </div>

        {selectedLanguage && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-3">
              <span className="text-4xl">{getLanguageInfo(selectedLanguage)?.icon}</span>
              {getLanguageInfo(selectedLanguage)?.name} Projects
            </h2>
            <p className="text-muted-foreground mt-2">
              {filteredProjects.length} projects available
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const lang = getLanguageInfo(project.language);

            return (
              <Card
                key={project.id}
                className="group hover:border-primary/50 transition-all hover:shadow-lg flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {project.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl">{lang?.icon}</span>
                          <span className="text-sm text-muted-foreground">{lang?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm mb-4">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <h4 className="font-medium text-muted-foreground">What you'll build:</h4>
                    <ul className="space-y-1">
                      {project.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                          <Code className="h-3 w-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {project.duration}
                      </div>
                      <Badge className={getDifficultyStyles(project.difficulty)}>
                        {project.difficulty}
                      </Badge>
                    </div>
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                        Start <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <Card className="inline-block max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold">Have a project idea?</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Use our AI-powered editor to get help building any project you can imagine.
                Get real-time code suggestions, debugging help, and best practices.
              </p>
              <Link href="/editor">
                <Button size="lg" className="gap-2">
                  <Rocket className="h-5 w-5" />
                  Open Code Editor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
