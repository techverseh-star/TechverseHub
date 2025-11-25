"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase, Lesson } from "@/lib/supabase";
import { BookOpen, CheckCircle } from "lucide-react";

export default function LearnPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");

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
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .order("id");

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (lessonsData) setLessons(lessonsData);
      if (progressData) {
        setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
      }
    }

    loadLessons();
  }, [user]);

  const filteredLessons = lessons.filter(lesson => 
    filter === "all" ? true : lesson.language === filter
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learn to Code</h1>
          <p className="text-muted-foreground">Interactive lessons with hands-on practice</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Badge 
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            All
          </Badge>
          <Badge 
            variant={filter === "python" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("python")}
          >
            Python
          </Badge>
          <Badge 
            variant={filter === "javascript" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("javascript")}
          >
            JavaScript
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => (
            <Link key={lesson.id} href={`/learn/${lesson.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {completedLessons.has(lesson.id) && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{lesson.language}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lesson.content.substring(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No lessons found. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
