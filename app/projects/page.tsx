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
  Terminal, Globe, Database, Cpu, Lock, Zap
} from "lucide-react";

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
    title: "Todo CLI App",
    description: "Build a command-line todo list manager with file persistence",
    language: "python",
    difficulty: "Beginner",
    duration: "1-2 hours",
    skills: ["File I/O", "Data Structures", "CLI"],
    features: ["Add/remove tasks", "Mark complete", "Save to file"],
    icon: <Terminal className="h-6 w-6" />
  },
  {
    id: "py-2",
    title: "Weather Dashboard",
    description: "Create a weather app that fetches data from an API",
    language: "python",
    difficulty: "Beginner",
    duration: "2-3 hours",
    skills: ["APIs", "JSON", "HTTP Requests"],
    features: ["Current weather", "5-day forecast", "City search"],
    icon: <Globe className="h-6 w-6" />
  },
  {
    id: "py-3",
    title: "Password Manager",
    description: "Build a secure password manager with encryption",
    language: "python",
    difficulty: "Intermediate",
    duration: "4-6 hours",
    skills: ["Cryptography", "Security", "Database"],
    features: ["Encrypt passwords", "Master password", "Generate passwords"],
    icon: <Lock className="h-6 w-6" />
  },
  {
    id: "py-4",
    title: "REST API with Flask",
    description: "Create a RESTful API for a blog platform",
    language: "python",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    skills: ["Flask", "REST API", "SQL"],
    features: ["CRUD operations", "Authentication", "Database"],
    icon: <Database className="h-6 w-6" />
  },
  {
    id: "py-5",
    title: "Machine Learning Classifier",
    description: "Build an image classifier using scikit-learn",
    language: "python",
    difficulty: "Advanced",
    duration: "8-10 hours",
    skills: ["ML", "scikit-learn", "Data Analysis"],
    features: ["Train model", "Evaluate accuracy", "Make predictions"],
    icon: <Cpu className="h-6 w-6" />
  },

  {
    id: "js-1",
    title: "Interactive Quiz App",
    description: "Build a quiz application with scoring and timers",
    language: "javascript",
    difficulty: "Beginner",
    duration: "2-3 hours",
    skills: ["DOM Manipulation", "Events", "Local Storage"],
    features: ["Multiple choice", "Timer", "Score tracking"],
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: "js-2",
    title: "Expense Tracker",
    description: "Create a personal finance tracker with charts",
    language: "javascript",
    difficulty: "Beginner",
    duration: "3-4 hours",
    skills: ["DOM", "Charts", "Local Storage"],
    features: ["Add expenses", "Categories", "Visualizations"],
    icon: <Layers className="h-6 w-6" />
  },
  {
    id: "js-3",
    title: "Real-time Chat App",
    description: "Build a chat application with WebSockets",
    language: "javascript",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    skills: ["WebSockets", "Node.js", "Express"],
    features: ["Real-time messaging", "User rooms", "Typing indicators"],
    icon: <Globe className="h-6 w-6" />
  },
  {
    id: "js-4",
    title: "E-commerce Backend",
    description: "Create a Node.js backend for an online store",
    language: "javascript",
    difficulty: "Advanced",
    duration: "10-15 hours",
    skills: ["Node.js", "Express", "MongoDB"],
    features: ["Product catalog", "Cart", "Payments"],
    icon: <Database className="h-6 w-6" />
  },
  {
    id: "js-5",
    title: "Social Media Dashboard",
    description: "Build a social media analytics dashboard",
    language: "javascript",
    difficulty: "Advanced",
    duration: "12-16 hours",
    skills: ["React", "APIs", "Data Visualization"],
    features: ["Multi-platform", "Analytics", "Scheduling"],
    icon: <Cpu className="h-6 w-6" />
  },

  {
    id: "ts-1",
    title: "Task Management App",
    description: "Build a type-safe task manager with React",
    language: "typescript",
    difficulty: "Beginner",
    duration: "3-4 hours",
    skills: ["TypeScript", "React", "State Management"],
    features: ["Task CRUD", "Filters", "Drag & drop"],
    icon: <Terminal className="h-6 w-6" />
  },
  {
    id: "ts-2",
    title: "Blog Platform",
    description: "Create a full-stack blog with Next.js",
    language: "typescript",
    difficulty: "Intermediate",
    duration: "8-10 hours",
    skills: ["Next.js", "TypeScript", "Prisma"],
    features: ["Markdown", "Comments", "Auth"],
    icon: <Globe className="h-6 w-6" />
  },
  {
    id: "ts-3",
    title: "GraphQL API",
    description: "Build a type-safe GraphQL API with Apollo",
    language: "typescript",
    difficulty: "Advanced",
    duration: "10-12 hours",
    skills: ["GraphQL", "Apollo", "TypeScript"],
    features: ["Schema design", "Resolvers", "Subscriptions"],
    icon: <Database className="h-6 w-6" />
  },

  {
    id: "java-1",
    title: "Banking System",
    description: "Build a console-based banking application",
    language: "java",
    difficulty: "Beginner",
    duration: "3-4 hours",
    skills: ["OOP", "Collections", "File I/O"],
    features: ["Accounts", "Transactions", "Reports"],
    icon: <Lock className="h-6 w-6" />
  },
  {
    id: "java-2",
    title: "Library Management",
    description: "Create a library system with JDBC",
    language: "java",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    skills: ["JDBC", "SQL", "OOP"],
    features: ["Book catalog", "Borrowing", "User management"],
    icon: <Database className="h-6 w-6" />
  },
  {
    id: "java-3",
    title: "Spring Boot REST API",
    description: "Build a production-ready REST API",
    language: "java",
    difficulty: "Advanced",
    duration: "10-15 hours",
    skills: ["Spring Boot", "JPA", "Security"],
    features: ["Authentication", "CRUD", "Swagger"],
    icon: <Globe className="h-6 w-6" />
  },

  {
    id: "c-1",
    title: "Student Record System",
    description: "Build a file-based student database",
    language: "c",
    difficulty: "Beginner",
    duration: "3-4 hours",
    skills: ["Structs", "File I/O", "Arrays"],
    features: ["Add records", "Search", "Save to file"],
    icon: <Database className="h-6 w-6" />
  },
  {
    id: "c-2",
    title: "Memory Allocator",
    description: "Create a custom malloc implementation",
    language: "c",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    skills: ["Pointers", "Memory Management", "System Calls"],
    features: ["Allocate", "Free", "Defragment"],
    icon: <Cpu className="h-6 w-6" />
  },
  {
    id: "c-3",
    title: "Shell Implementation",
    description: "Build a Unix-like command shell",
    language: "c",
    difficulty: "Advanced",
    duration: "15-20 hours",
    skills: ["Process Control", "System Calls", "Parsing"],
    features: ["Commands", "Pipes", "Redirection"],
    icon: <Terminal className="h-6 w-6" />
  },

  {
    id: "cpp-1",
    title: "Text Editor",
    description: "Build a console-based text editor",
    language: "cpp",
    difficulty: "Beginner",
    duration: "3-4 hours",
    skills: ["STL", "File I/O", "OOP"],
    features: ["Edit text", "Save/Load", "Line numbers"],
    icon: <Terminal className="h-6 w-6" />
  },
  {
    id: "cpp-2",
    title: "Game Engine Core",
    description: "Create a 2D game engine foundation",
    language: "cpp",
    difficulty: "Intermediate",
    duration: "10-15 hours",
    skills: ["OOP", "Templates", "SDL/SFML"],
    features: ["Rendering", "Physics", "Input handling"],
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: "cpp-3",
    title: "Database Query Engine",
    description: "Build a SQL-like query processor",
    language: "cpp",
    difficulty: "Advanced",
    duration: "20-30 hours",
    skills: ["Parsing", "Data Structures", "Optimization"],
    features: ["SELECT/INSERT", "Indexing", "Query optimizer"],
    icon: <Database className="h-6 w-6" />
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
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
              className={`cursor-pointer px-4 py-2 ${
                selectedDifficulty === diff && diff !== "all" 
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
                    <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                      Start <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
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
