"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, Lesson, isSupabaseConfigured } from "@/lib/supabase";
import { BookOpen, CheckCircle, Search, Code2, ChevronRight, GraduationCap, Layers } from "lucide-react";

const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍", color: "blue", description: "Beginner-friendly, versatile language" },
  { id: "javascript", name: "JavaScript", icon: "⚡", color: "yellow", description: "The language of the web" },
  { id: "typescript", name: "TypeScript", icon: "📘", color: "blue", description: "JavaScript with static types" },
  { id: "java", name: "Java", icon: "☕", color: "orange", description: "Enterprise & Android development" },
  { id: "c", name: "C", icon: "🔧", color: "gray", description: "Foundation of modern programming" },
  { id: "cpp", name: "C++", icon: "⚙️", color: "purple", description: "High-performance systems & games" },
];

const LEVELS = [
  { id: "beginner", name: "Beginner", icon: "🌱", color: "green" },
  { id: "intermediate", name: "Intermediate", icon: "🌿", color: "yellow" },
  { id: "advanced", name: "Advanced", icon: "🌳", color: "red" },
];

const DEMO_LESSONS: Lesson[] = [
  { id: "py-01", title: "Introduction to Python", language: "python", level: "beginner", content: "Learn the basics of Python programming", codeExample: "", tryStarter: "" },
  { id: "py-02", title: "Variables and Data Types", language: "python", level: "beginner", content: "Understanding Python's dynamic typing", codeExample: "", tryStarter: "" },
  { id: "py-03", title: "Operators", language: "python", level: "beginner", content: "Arithmetic, comparison, and logical operators", codeExample: "", tryStarter: "" },
  { id: "py-04", title: "Strings", language: "python", level: "beginner", content: "String manipulation and formatting", codeExample: "", tryStarter: "" },
  { id: "py-05", title: "Lists", language: "python", level: "beginner", content: "Working with Python lists", codeExample: "", tryStarter: "" },
  { id: "py-06", title: "Conditionals", language: "python", level: "beginner", content: "If, elif, and else statements", codeExample: "", tryStarter: "" },
  { id: "py-07", title: "Loops", language: "python", level: "beginner", content: "For and while loops", codeExample: "", tryStarter: "" },
  { id: "py-08", title: "Functions", language: "python", level: "intermediate", content: "Defining and using functions", codeExample: "", tryStarter: "" },
  { id: "py-09", title: "Dictionaries", language: "python", level: "intermediate", content: "Key-value data structures", codeExample: "", tryStarter: "" },
  { id: "py-10", title: "List Comprehensions", language: "python", level: "intermediate", content: "Concise list creation", codeExample: "", tryStarter: "" },
  { id: "py-11", title: "Error Handling", language: "python", level: "intermediate", content: "Try-except blocks", codeExample: "", tryStarter: "" },
  { id: "py-12", title: "Classes and OOP", language: "python", level: "intermediate", content: "Object-oriented programming", codeExample: "", tryStarter: "" },
  { id: "py-13", title: "File Handling", language: "python", level: "advanced", content: "Reading and writing files", codeExample: "", tryStarter: "" },
  { id: "py-14", title: "Modules and Packages", language: "python", level: "advanced", content: "Organizing code", codeExample: "", tryStarter: "" },
  { id: "py-15", title: "Decorators and Generators", language: "python", level: "advanced", content: "Advanced Python features", codeExample: "", tryStarter: "" },

  { id: "js-01", title: "Introduction to JavaScript", language: "javascript", level: "beginner", content: "The language of the web", codeExample: "", tryStarter: "" },
  { id: "js-02", title: "Variables and Data Types", language: "javascript", level: "beginner", content: "let, const, and var", codeExample: "", tryStarter: "" },
  { id: "js-03", title: "Operators", language: "javascript", level: "beginner", content: "Arithmetic and comparison operators", codeExample: "", tryStarter: "" },
  { id: "js-04", title: "Strings", language: "javascript", level: "beginner", content: "String methods and templates", codeExample: "", tryStarter: "" },
  { id: "js-05", title: "Arrays", language: "javascript", level: "beginner", content: "Working with arrays", codeExample: "", tryStarter: "" },
  { id: "js-06", title: "Conditionals", language: "javascript", level: "beginner", content: "If-else and switch", codeExample: "", tryStarter: "" },
  { id: "js-07", title: "Loops", language: "javascript", level: "beginner", content: "For, while, and forEach", codeExample: "", tryStarter: "" },
  { id: "js-08", title: "Functions", language: "javascript", level: "intermediate", content: "Functions and arrow functions", codeExample: "", tryStarter: "" },
  { id: "js-09", title: "Objects", language: "javascript", level: "intermediate", content: "Object literals and methods", codeExample: "", tryStarter: "" },
  { id: "js-10", title: "Array Methods", language: "javascript", level: "intermediate", content: "map, filter, reduce", codeExample: "", tryStarter: "" },
  { id: "js-11", title: "Promises and Async/Await", language: "javascript", level: "intermediate", content: "Asynchronous programming", codeExample: "", tryStarter: "" },
  { id: "js-12", title: "Destructuring and Spread", language: "javascript", level: "intermediate", content: "Modern JS syntax", codeExample: "", tryStarter: "" },
  { id: "js-13", title: "Classes and OOP", language: "javascript", level: "advanced", content: "ES6 classes", codeExample: "", tryStarter: "" },
  { id: "js-14", title: "Modules (ES6)", language: "javascript", level: "advanced", content: "Import and export", codeExample: "", tryStarter: "" },
  { id: "js-15", title: "Error Handling", language: "javascript", level: "advanced", content: "Try-catch and debugging", codeExample: "", tryStarter: "" },

  { id: "ts-01", title: "Introduction to TypeScript", language: "typescript", level: "beginner", content: "JavaScript with types", codeExample: "", tryStarter: "" },
  { id: "ts-02", title: "Basic Types", language: "typescript", level: "beginner", content: "string, number, boolean", codeExample: "", tryStarter: "" },
  { id: "ts-03", title: "Interfaces", language: "typescript", level: "beginner", content: "Defining object shapes", codeExample: "", tryStarter: "" },
  { id: "ts-04", title: "Type Aliases and Unions", language: "typescript", level: "intermediate", content: "Custom types", codeExample: "", tryStarter: "" },
  { id: "ts-05", title: "Generics", language: "typescript", level: "intermediate", content: "Reusable type patterns", codeExample: "", tryStarter: "" },
  { id: "ts-06", title: "Classes in TypeScript", language: "typescript", level: "intermediate", content: "OOP with types", codeExample: "", tryStarter: "" },
  { id: "ts-07", title: "Advanced Types", language: "typescript", level: "advanced", content: "Utility types", codeExample: "", tryStarter: "" },
  { id: "ts-08", title: "Decorators", language: "typescript", level: "advanced", content: "Metaprogramming", codeExample: "", tryStarter: "" },

  { id: "java-01", title: "Introduction to Java", language: "java", level: "beginner", content: "Enterprise programming", codeExample: "", tryStarter: "" },
  { id: "java-02", title: "Variables and Data Types", language: "java", level: "beginner", content: "Static typing in Java", codeExample: "", tryStarter: "" },
  { id: "java-03", title: "Control Flow", language: "java", level: "beginner", content: "If, switch, loops", codeExample: "", tryStarter: "" },
  { id: "java-04", title: "Methods", language: "java", level: "beginner", content: "Defining methods", codeExample: "", tryStarter: "" },
  { id: "java-05", title: "Classes and Objects", language: "java", level: "intermediate", content: "OOP fundamentals", codeExample: "", tryStarter: "" },
  { id: "java-06", title: "Inheritance", language: "java", level: "intermediate", content: "Extends and super", codeExample: "", tryStarter: "" },
  { id: "java-07", title: "Interfaces", language: "java", level: "intermediate", content: "Abstract contracts", codeExample: "", tryStarter: "" },
  { id: "java-08", title: "Collections", language: "java", level: "advanced", content: "List, Set, Map", codeExample: "", tryStarter: "" },

  { id: "c-01", title: "Introduction to C", language: "c", level: "beginner", content: "The foundation of modern programming", codeExample: "", tryStarter: "" },
  { id: "c-02", title: "Variables and Data Types", language: "c", level: "beginner", content: "int, float, char, double", codeExample: "", tryStarter: "" },
  { id: "c-03", title: "Operators", language: "c", level: "beginner", content: "Arithmetic, logical, bitwise", codeExample: "", tryStarter: "" },
  { id: "c-04", title: "Control Flow", language: "c", level: "beginner", content: "If, switch, loops", codeExample: "", tryStarter: "" },
  { id: "c-05", title: "Functions", language: "c", level: "intermediate", content: "Function declarations and definitions", codeExample: "", tryStarter: "" },
  { id: "c-06", title: "Arrays and Strings", language: "c", level: "intermediate", content: "Working with arrays", codeExample: "", tryStarter: "" },
  { id: "c-07", title: "Pointers", language: "c", level: "intermediate", content: "Memory addresses and dereferencing", codeExample: "", tryStarter: "" },
  { id: "c-08", title: "Structs", language: "c", level: "advanced", content: "Custom data structures", codeExample: "", tryStarter: "" },
  { id: "c-09", title: "Memory Management", language: "c", level: "advanced", content: "malloc, free, dynamic allocation", codeExample: "", tryStarter: "" },
  { id: "c-10", title: "File I/O", language: "c", level: "advanced", content: "Reading and writing files", codeExample: "", tryStarter: "" },

  { id: "cpp-01", title: "Introduction to C++", language: "cpp", level: "beginner", content: "C with classes and more", codeExample: "", tryStarter: "" },
  { id: "cpp-02", title: "Variables and Types", language: "cpp", level: "beginner", content: "Type system and auto", codeExample: "", tryStarter: "" },
  { id: "cpp-03", title: "Control Flow", language: "cpp", level: "beginner", content: "If, switch, range-based for", codeExample: "", tryStarter: "" },
  { id: "cpp-04", title: "Functions", language: "cpp", level: "beginner", content: "Overloading and references", codeExample: "", tryStarter: "" },
  { id: "cpp-05", title: "Classes and Objects", language: "cpp", level: "intermediate", content: "OOP fundamentals", codeExample: "", tryStarter: "" },
  { id: "cpp-06", title: "Inheritance", language: "cpp", level: "intermediate", content: "Derived classes and polymorphism", codeExample: "", tryStarter: "" },
  { id: "cpp-07", title: "Templates", language: "cpp", level: "intermediate", content: "Generic programming", codeExample: "", tryStarter: "" },
  { id: "cpp-08", title: "STL Containers", language: "cpp", level: "advanced", content: "vector, map, set, deque", codeExample: "", tryStarter: "" },
  { id: "cpp-09", title: "Smart Pointers", language: "cpp", level: "advanced", content: "unique_ptr, shared_ptr", codeExample: "", tryStarter: "" },
  { id: "cpp-10", title: "Modern C++ Features", language: "cpp", level: "advanced", content: "C++11/14/17/20 features", codeExample: "", tryStarter: "" },
];

export default function LearnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(searchParams.get("lang"));
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function loadLessons() {
      if (!isSupabaseConfigured()) {
        setLessons(DEMO_LESSONS);
        return;
      }

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .order("id");

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (lessonsData && lessonsData.length > 0) {
        setLessons(lessonsData);
      } else {
        setLessons(DEMO_LESSONS);
      }
      
      if (progressData) {
        setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
      }
    }

    loadLessons();
  }, [user]);

  const filteredLessons = lessons.filter(lesson => {
    const matchesLanguage = !selectedLanguage || lesson.language === selectedLanguage;
    const matchesLevel = selectedLevel === "all" || (lesson as any).level === selectedLevel;
    const matchesSearch = lesson.title.toLowerCase().includes(search.toLowerCase());
    return matchesLanguage && matchesLevel && matchesSearch;
  });

  const getLessonsByLevel = (level: string) => {
    return filteredLessons.filter((l: any) => l.level === level);
  };

  const getLanguageColor = (lang: string) => {
    const language = LANGUAGES.find(l => l.id === lang);
    return language?.color || "gray";
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      green: "bg-green-500/10 text-green-500 border-green-500/20",
      red: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[color] || "bg-gray-500/10 text-gray-500";
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {!selectedLanguage ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Learn to <span className="gradient-text">Code</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Master programming from basics to advanced with interactive lessons, real examples, and hands-on practice
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LANGUAGES.map((lang) => {
                const langLessons = lessons.filter(l => l.language === lang.id);
                const completedCount = langLessons.filter(l => completedLessons.has(l.id)).length;
                const progress = langLessons.length > 0 ? (completedCount / langLessons.length) * 100 : 0;
                
                return (
                  <Card 
                    key={lang.id}
                    className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
                    onClick={() => setSelectedLanguage(lang.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${getColorClasses(lang.color)}`}>
                          {lang.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {lang.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{lang.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{langLessons.length} lessons</span>
                        <span className="text-muted-foreground">{completedCount} completed</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            lang.color === "blue" ? "bg-blue-500" :
                            lang.color === "yellow" ? "bg-yellow-500" :
                            lang.color === "orange" ? "bg-orange-500" :
                            lang.color === "cyan" ? "bg-cyan-500" : "bg-primary"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" />
                Learning Path
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {LEVELS.map((level, idx) => (
                  <Card key={level.id} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      level.color === "green" ? "bg-green-500" :
                      level.color === "yellow" ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{level.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{level.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {level.id === "beginner" && "Start your coding journey"}
                            {level.id === "intermediate" && "Build on your foundation"}
                            {level.id === "advanced" && "Master advanced concepts"}
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {level.id === "beginner" && (
                          <>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Variables & Data Types</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Control Flow</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Basic Syntax</li>
                          </>
                        )}
                        {level.id === "intermediate" && (
                          <>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Functions & Methods</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Object-Oriented Programming</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Data Structures</li>
                          </>
                        )}
                        {level.id === "advanced" && (
                          <>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Design Patterns</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Performance Optimization</li>
                            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Advanced Features</li>
                          </>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setSelectedLanguage(null)}>
                ← Back to Languages
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{LANGUAGES.find(l => l.id === selectedLanguage)?.icon}</span>
                  <div>
                    <h1 className="text-3xl font-bold">{LANGUAGES.find(l => l.id === selectedLanguage)?.name}</h1>
                    <p className="text-muted-foreground">{LANGUAGES.find(l => l.id === selectedLanguage)?.description}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Badge 
                  variant={selectedLevel === "all" ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSelectedLevel("all")}
                >
                  All Levels
                </Badge>
                {LEVELS.map((level) => (
                  <Badge 
                    key={level.id}
                    variant={selectedLevel === level.id ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 ${selectedLevel === level.id ? getColorClasses(level.color) : ""}`}
                    onClick={() => setSelectedLevel(level.id)}
                  >
                    {level.icon} {level.name}
                  </Badge>
                ))}
              </div>
            </div>

            {["beginner", "intermediate", "advanced"].map((level) => {
              const levelLessons = getLessonsByLevel(level);
              if (levelLessons.length === 0) return null;
              const levelInfo = LEVELS.find(l => l.id === level);
              
              return (
                <div key={level} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{levelInfo?.icon}</span>
                    <h2 className="text-xl font-bold capitalize">{level}</h2>
                    <Badge variant="secondary" className={getColorClasses(levelInfo?.color || "gray")}>
                      {levelLessons.length} lessons
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelLessons.map((lesson, idx) => (
                      <Link key={lesson.id} href={`/learn/${lesson.id}`}>
                        <Card className="h-full group hover:border-primary/50 transition-all hover:shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getColorClasses(getLanguageColor(lesson.language))}`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium group-hover:text-primary transition-colors mb-1">
                                  {lesson.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {lesson.content}
                                </p>
                              </div>
                              {completedLessons.has(lesson.id) && (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredLessons.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No lessons found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
