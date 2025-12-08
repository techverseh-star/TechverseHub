"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProblems, PracticeProblem } from "@/lib/api";
import { DashboardHeader } from "./_components/DashboardHeader";
import { StatsOverview } from "./_components/StatsOverview";
import { DailyChallenges } from "./_components/DailyChallenges";
import { ContinueLearning } from "./_components/ContinueLearning";
import { DashboardAI } from "./_components/DashboardAI";
import { AdUnit } from "@/components/AdUnit";
import { LANGUAGES } from "@/lib/constants";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
  const [dailyChallenges, setDailyChallenges] = useState<PracticeProblem[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadStats(currentUser: any) {
      setLoading(true);

      const [lessonsResult, submissionsResult, problemsResult] = await Promise.all([
        supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", currentUser.id)
          .eq("completed", true),
        supabase
          .from("submissions")
          .select("*")
          .eq("user_id", currentUser.id),
        getProblems()
      ]);

      const fetchedLessons = lessonsResult.data || [];
      const submissions = submissionsResult.data || [];
      const allProblems = problemsResult || [];

      // Logic to pick "Daily" challenges - for now, just random 3 from all problems
      // or rotating based on date
      const today = new Date();
      const seed = today.getDate() + today.getMonth() * 31 + today.getFullYear() * 365;

      const shuffled = [...allProblems].sort(() => 0.5 - Math.random()); // Simple shuffle
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

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      loadStats(user);
    }
    init();
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
