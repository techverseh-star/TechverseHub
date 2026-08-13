"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { PracticeProblem } from "@/lib/api";
import { DashboardHeader } from "./_components/DashboardHeader";
import { StatsOverview } from "./_components/StatsOverview";
import { DailyChallenges } from "./_components/DailyChallenges";
import { ContinueLearning } from "./_components/ContinueLearning";
import { DashboardAI } from "./_components/DashboardAI";
import { AdUnit } from "@/components/AdUnit";
import { LANGUAGES } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    problemsSolved: 0,
    totalAttempts: 0,
    xp: 0,
    streak: 0,
  });
  const [languageProgress, setLanguageProgress] = useState(
    LANGUAGES.filter(lang => ["python", "javascript", "typescript", "java", "c", "cpp"].includes(lang.id))
  );
  const [dailyChallenges, setDailyChallenges] = useState<Pick<PracticeProblem, "id" | "title" | "difficulty" | "language">[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadStats(currentUser: any) {
      setLoading(true);

      // Narrow selects to just the columns actually used below - the previous
      // "*" selects were pulling full submission code/timestamps and full
      // problem descriptions/solutions/hints just to compute counts and pick
      // 3 random titles, which is unnecessary payload on every dashboard load.
      const [lessonsResult, submissionsResult, problemsResult] = await Promise.all([
        supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", currentUser.id)
          .eq("completed", true),
        supabase
          .from("submissions")
          .select("problem_id, status")
          .eq("user_id", currentUser.id),
        supabase
          .from("practice_problems")
          .select("id, title, difficulty, language"),
      ]);

      const fetchedLessons = lessonsResult.data || [];
      const submissions = submissionsResult.data || [];
      const allProblems = problemsResult.data || [];

      // Pick 3 "Daily" challenges, seeded by today's date so every user sees
      // the same set on a given day and it rotates the next day - a plain
      // Math.random() shuffle (the previous approach) picked a new random
      // set on every single page load/reload, which isn't "daily" at all.
      const today = new Date();
      let seed = today.getDate() + today.getMonth() * 31 + today.getFullYear() * 365;
      const seededRandom = () => {
        // mulberry32
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };

      const shuffled = [...allProblems].sort(() => 0.5 - seededRandom());
      const challenges = shuffled.slice(0, 3);
      setDailyChallenges(challenges);

      const passedSubmissions = submissions.filter(s => s.status === "passed");
      const uniqueProblems = new Set(passedSubmissions.map(s => s.problem_id));
      setCompletedChallenges(uniqueProblems);

      setStats({
        lessonsCompleted: fetchedLessons.length,
        problemsSolved: uniqueProblems.size,
        totalAttempts: submissions.length,
        xp: (fetchedLessons.length) * 25 + uniqueProblems.size * 50,
        streak: 0,
      });

      const updatedLanguages = LANGUAGES
        .filter(lang => ["python", "javascript", "typescript", "java", "c", "cpp"].includes(lang.id))
        .map(lang => {
          const completedLessons = fetchedLessons.filter((l: any) =>
            l.lesson_id?.startsWith(lang.prefix!)
          ).length || 0;
          return {
            ...lang,
            progress: lang.lessons! > 0 ? Math.round((completedLessons / lang.lessons!) * 100) : 0
          };
        });
      setLanguageProgress(updatedLanguages);

      setLoading(false);
    }

    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadStats(user);
  }, [authLoading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-7 w-12" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Card>
                    <CardContent className="p-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Skeleton className="h-5 w-36" />
                  <Card>
                    <CardContent className="p-6 space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="lg:col-span-4">
                <Card className="h-[420px]">
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-full w-full rounded-lg" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const userName = user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center">
        <aside className="hidden laptop:block w-[180px] shrink-0 p-4 sticky top-24 h-fit">
          <AdUnit
            slotId="2890917443"
            style={{ display: "inline-block", width: "160px", height: "600px" }}
            format={null}
          />
        </aside>
        <main className="flex-1 w-full max-w-[1600px]">
          <div className="w-full max-w-[1600px] px-4 py-8 mx-auto">
            <div className="space-y-8">
              <DashboardHeader userName={userName} xp={stats.xp} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area - 8 columns */}
                <div className="lg:col-span-8 space-y-8">
                  <StatsOverview stats={stats} />

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">Continue Learning</h2>
                    <ContinueLearning
                      languageProgress={languageProgress}
                    />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">Daily Challenges</h2>
                    <DailyChallenges
                      dailyChallenges={dailyChallenges}
                      completedChallenges={completedChallenges}
                    />
                  </div>
                </div>

                {/* Sidebar Area - 4 columns */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="sticky top-8">
                    <DashboardAI />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <aside className="hidden laptop:block w-[180px] shrink-0 p-4 sticky top-24 h-fit">
          <AdUnit slotId="7951672437" />
        </aside>
      </div>
      <Footer />
    </div>
  );
}
