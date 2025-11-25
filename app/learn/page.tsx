"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase, Lesson, isSupabaseConfigured } from "@/lib/supabase";
import { BookOpen, CheckCircle, Search, Code2 } from "lucide-react";

const DEMO_LESSONS: Lesson[] = [
  { id: "1", title: "Python Basics: Variables and Data Types", language: "python", content: "Learn about Python variables...", codeExample: "", tryStarter: "" },
  { id: "2", title: "Python: Lists and Loops", language: "python", content: "Lists are used to store multiple items...", codeExample: "", tryStarter: "" },
  { id: "3", title: "Python: Functions", language: "python", content: "Functions are blocks of code...", codeExample: "", tryStarter: "" },
  { id: "11", title: "JavaScript Basics: Variables and Data Types", language: "javascript", content: "In JavaScript, you can declare variables...", codeExample: "", tryStarter: "" },
  { id: "12", title: "JavaScript: Arrays and Loops", language: "javascript", content: "Arrays are used to store multiple values...", codeExample: "", tryStarter: "" },
  { id: "13", title: "JavaScript: Functions", language: "javascript", content: "Functions are blocks of code...", codeExample: "", tryStarter: "" },
];

export default function LearnPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");
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
    const matchesFilter = filter === "all" || lesson.language === filter;
    const matchesSearch = lesson.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learn to Code</h1>
          <p className="text-muted-foreground">Interactive lessons with hands-on practice</p>
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
            {["all", "python", "javascript"].map((f) => (
              <Badge 
                key={f}
                variant={filter === f ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 capitalize"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => (
            <Link key={lesson.id} href={`/learn/${lesson.id}`}>
              <Card className="h-full group hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      lesson.language === "python" 
                        ? "bg-blue-500/10" 
                        : "bg-yellow-500/10"
                    }`}>
                      {lesson.language === "python" ? (
                        <Code2 className="h-5 w-5 text-blue-500" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    {completedLessons.has(lesson.id) && (
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                    {lesson.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      lesson.language === "python" 
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }`}
                  >
                    {lesson.language}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No lessons found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
