"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdPanel } from "@/components/AdPanel";
import { BookOpen, Code, Trophy, TrendingUp, ArrowRight, Zap } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    problemsSolved: 0,
    totalAttempts: 0,
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);

    async function loadStats() {
      if (!isSupabaseConfigured()) return;
      
      const { data: lessons } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userData.id)
        .eq("completed", true);

      const { data: submissions } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userData.id)
        .eq("status", "passed");

      const uniqueProblems = new Set(submissions?.map(s => s.problem_id) || []);

      setStats({
        lessonsCompleted: lessons?.length || 0,
        problemsSolved: uniqueProblems.size,
        totalAttempts: submissions?.length || 0,
      });
    }

    loadStats();
  }, [router]);

  if (!user) return null;

  const userName = user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="gradient-text">{userName}</span>
              </h1>
              <p className="text-muted-foreground">Continue your coding journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lessons Completed</CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.lessonsCompleted}</div>
                  <p className="text-xs text-muted-foreground mt-1">of 20 lessons</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Problems Solved</CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.problemsSolved}</div>
                  <p className="text-xs text-muted-foreground mt-1">of 30 problems</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Attempts</CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalAttempts}</div>
                  <p className="text-xs text-muted-foreground mt-1">keep practicing!</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Continue Learning</CardTitle>
                      <p className="text-sm text-muted-foreground">Python & JavaScript lessons</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    20 interactive lessons with hands-on coding exercises and real examples.
                  </p>
                  <Link href="/learn">
                    <Button className="w-full group-hover:bg-primary/90">
                      Browse Lessons
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Code className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Practice Arena</CardTitle>
                      <p className="text-sm text-muted-foreground">Coding challenges</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    30 problems from Easy to Hard with AI-powered hints and instant feedback.
                  </p>
                  <Link href="/practice">
                    <Button className="w-full group-hover:bg-primary/90">
                      Start Practice
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Code Editor Workspace</h3>
                    <p className="text-sm text-muted-foreground">
                      Write code with AI-powered assistance
                    </p>
                  </div>
                </div>
                <Link href="/editor">
                  <Button variant="secondary">
                    Open Editor
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <AdPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
