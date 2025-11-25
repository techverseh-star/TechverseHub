"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdPanel } from "@/components/AdPanel";
import { BookOpen, Code, Trophy, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.email}!</h1>
              <p className="text-muted-foreground">Continue your coding journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.lessonsCompleted}</div>
                  <p className="text-xs text-muted-foreground">Keep learning!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.problemsSolved}</div>
                  <p className="text-xs text-muted-foreground">Great progress!</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAttempts}</div>
                  <p className="text-xs text-muted-foreground">Practice makes perfect</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Continue Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Explore interactive lessons in Python and JavaScript
                  </p>
                  <Link href="/learn">
                    <Button className="w-full">Browse Lessons</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Continue Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Solve coding challenges and improve your skills
                  </p>
                  <Link href="/practice">
                    <Button className="w-full">Start Practice</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-1">
            <AdPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
