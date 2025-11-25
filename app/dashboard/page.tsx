"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Code, Trophy, TrendingUp, ArrowRight, Zap, 
  Flame, Target, Clock, Star, Play, Rocket, Calendar,
  CheckCircle2, ChevronRight, Loader2
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const LANGUAGES = [
  { id: "python", name: "Python", color: "blue", icon: "🐍", lessons: 15, progress: 0, prefix: "py-" },
  { id: "javascript", name: "JavaScript", color: "yellow", icon: "⚡", lessons: 15, progress: 0, prefix: "js-" },
  { id: "typescript", name: "TypeScript", color: "blue", icon: "📘", lessons: 8, progress: 0, prefix: "ts-" },
  { id: "java", name: "Java", color: "orange", icon: "☕", lessons: 8, progress: 0, prefix: "java-" },
  { id: "c", name: "C", color: "gray", icon: "🔧", lessons: 10, progress: 0, prefix: "c-" },
  { id: "cpp", name: "C++", color: "purple", icon: "⚙️", lessons: 10, progress: 0, prefix: "cpp-" },
];

const TOTAL_LESSONS = 66;

const DAILY_CHALLENGES = [
  { id: "1", title: "Array Manipulation", difficulty: "Easy", language: "javascript", xp: 50 },
  { id: "2", title: "String Reversal", difficulty: "Easy", language: "python", xp: 50 },
  { id: "3", title: "Binary Search", difficulty: "Medium", language: "java", xp: 100 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    problemsSolved: 0,
    totalAttempts: 0,
    streak: 0,
    xp: 0,
  });
  const [languageProgress, setLanguageProgress] = useState(LANGUAGES);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);

    async function loadStats() {
      setLoading(true);
      
      if (!isSupabaseConfigured()) {
        setStats({
          lessonsCompleted: 0,
          problemsSolved: 0,
          totalAttempts: 0,
          streak: 1,
          xp: 0,
        });
        setLoading(false);
        return;
      }
      
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

      let currentStreak = 1;
      try {
        const streakResponse = await fetch("/api/streak/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userData.id }),
        });
        const streakResult = await streakResponse.json();
        if (streakResult.success) {
          currentStreak = streakResult.streak || 1;
        }
      } catch (error) {
        console.error("Failed to update streak:", error);
      }

      const uniqueProblems = new Set(submissions?.map(s => s.problem_id) || []);

      setStats({
        lessonsCompleted: lessons?.length || 0,
        problemsSolved: uniqueProblems.size,
        totalAttempts: submissions?.length || 0,
        streak: currentStreak,
        xp: (lessons?.length || 0) * 25 + uniqueProblems.size * 50,
      });

      const updatedLanguages = LANGUAGES.map(lang => {
        const completedLessons = lessons?.filter((l: any) => 
          l.lesson_id?.startsWith(lang.prefix)
        ).length || 0;
        return {
          ...lang,
          progress: lang.lessons > 0 ? Math.round((completedLessons / lang.lessons) * 100) : 0
        };
      });
      setLanguageProgress(updatedLanguages);
      
      setLoading(false);
    }

    loadStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName = user.email?.split("@")[0] || "there";

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-500 bg-green-500/10";
      case "Medium": return "text-yellow-500 bg-yellow-500/10";
      case "Hard": return "text-red-500 bg-red-500/10";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="gradient-text">{userName}</span>
              </h1>
              <p className="text-muted-foreground">Build Real Skills With Real Practice</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-orange-500">{stats.streak} day streak</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Star className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-purple-500">{stats.xp} XP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Lessons</span>
                </div>
                <div className="text-2xl font-bold">{stats.lessonsCompleted}</div>
                <p className="text-xs text-muted-foreground">completed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Problems</span>
                </div>
                <div className="text-2xl font-bold">{stats.problemsSolved}</div>
                <p className="text-xs text-muted-foreground">solved</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span className="text-xs text-muted-foreground">Accuracy</span>
                </div>
                <div className="text-2xl font-bold">
                  {stats.totalAttempts > 0 ? Math.round((stats.problemsSolved / stats.totalAttempts) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">success rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Time</span>
                </div>
                <div className="text-2xl font-bold">{Math.floor(stats.totalAttempts * 5)}</div>
                <p className="text-xs text-muted-foreground">minutes coded</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Daily Challenges
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      +150 XP available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DAILY_CHALLENGES.map((challenge) => (
                    <Link key={challenge.id} href={`/practice/${challenge.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                            <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">{challenge.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">{challenge.language}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          <span className="text-sm font-medium text-primary">+{challenge.xp} XP</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Continue Learning
                    </CardTitle>
                    <Link href="/learn">
                      <Button variant="ghost" size="sm">
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languageProgress.map((lang) => (
                      <Link key={lang.id} href={`/learn?lang=${lang.id}`}>
                        <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group text-center">
                          <div className="text-3xl mb-2">{lang.icon}</div>
                          <p className="font-medium group-hover:text-primary transition-colors">{lang.name}</p>
                          <p className="text-xs text-muted-foreground">{lang.lessons} lessons</p>
                          <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${lang.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{lang.progress}% complete</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/learn" className="block">
                  <Card className="h-full group hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="h-7 w-7 text-blue-500" />
                      </div>
                      <h3 className="font-semibold mb-1">Learn</h3>
                      <p className="text-sm text-muted-foreground">Interactive lessons</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/practice" className="block">
                  <Card className="h-full group hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Code className="h-7 w-7 text-purple-500" />
                      </div>
                      <h3 className="font-semibold mb-1">Practice</h3>
                      <p className="text-sm text-muted-foreground">Coding challenges</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/projects" className="block">
                  <Card className="h-full group hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Rocket className="h-7 w-7 text-green-500" />
                      </div>
                      <h3 className="font-semibold mb-1">Projects</h3>
                      <p className="text-sm text-muted-foreground">Build real apps</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Lessons Completed</span>
                      <span className="text-lg font-bold text-blue-500">{stats.lessonsCompleted}/66</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(stats.lessonsCompleted / 66) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Problems Solved</span>
                      <span className="text-lg font-bold text-purple-500">{stats.problemsSolved}/180</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${(stats.problemsSolved / 180) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Code Editor</h3>
                      <p className="text-sm text-muted-foreground">AI-powered workspace</p>
                    </div>
                  </div>
                  <Link href="/editor">
                    <Button className="w-full">
                      Open Editor
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total XP</span>
                    <span className="font-semibold text-primary">{stats.xp} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Problems Solved</span>
                    <span className="font-semibold">{stats.problemsSolved}/180</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Rank</span>
                    <Badge variant="secondary">
                      {stats.xp < 100 ? "Beginner" : stats.xp < 500 ? "Intermediate" : "Advanced"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
