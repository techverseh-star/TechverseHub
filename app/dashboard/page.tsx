"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, Trophy, Flame } from "lucide-react";
import { supabase, isSupabaseConfigured, PracticeProblem } from "@/lib/supabase";
import { DEMO_PROBLEMS } from "@/lib/challenges";
import { DashboardHeader } from "./_components/DashboardHeader";
import { StatsOverview } from "./_components/StatsOverview";
import { DailyChallenges } from "./_components/DailyChallenges";
import { ContinueLearning } from "./_components/ContinueLearning";
import { ProgressSection } from "./_components/ProgressSection";
import { DashboardAI } from "./_components/DashboardAI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdUnit } from "@/components/AdUnit";

import { LANGUAGES } from "@/lib/constants";

const TOTAL_LESSONS = 66;

// Simple seeded random function to get consistent daily challenges
function getDailyChallenges(seed: string, preferredLanguage?: string, count: number = 3): PracticeProblem[] {
  let problems = [...DEMO_PROBLEMS];

  // If preferred language is provided, try to filter by it
  if (preferredLanguage) {
    const langProblems = problems.filter(p => p.language === preferredLanguage);
    // Only use filtered list if we have enough problems
    if (langProblems.length >= count) {
      problems = langProblems;
    }
  }

  let m = problems.length;
  let t;
  let i;

  // Create a numeric hash from the seed string
  let hash = 0;
  for (let j = 0; j < seed.length; j++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(j);
    hash |= 0;
  }

  // Custom random function using the hash
  const random = () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };

  // Fisher-Yates shuffle with seeded random
  while (m) {
    i = Math.floor(random() * m--);
    t = problems[m];
    problems[m] = problems[i];
    problems[i] = t;
  }

  return problems.slice(0, count);
}

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
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats(currentUser: any) {
      setLoading(true);

      // Generate daily challenges based on today's date
      const today = new Date().toISOString().split('T')[0];
      let preferredLanguage: string | undefined;

      if (isSupabaseConfigured()) {
        // Try to get user's last submission to determine preferred language
        const { data: lastSubmission } = await supabase
          .from("submissions")
          .select("user_id") // minimal select to check existence/ordering if needed, or just skip if we can't join easily
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
      }

      if (!isSupabaseConfigured()) {
        const challenges = getDailyChallenges(today);
        setDailyChallenges(challenges);

        setStats({
          lessonsCompleted: 0,
          problemsSolved: 0,
          totalAttempts: 0,
          xp: 0,
          streak: 0,
        });
        setLoading(false);
        return;
      }

      // Fetch stats in parallel
      const [lessonsResult, submissionsResult] = await Promise.all([
        supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", currentUser.id)
          .eq("completed", true),
        supabase
          .from("submissions")
          .select("*")
          .eq("user_id", currentUser.id)
      ]);

      const fetchedLessons = lessonsResult.data || [];
      const submissions = submissionsResult.data;
      setLessons(fetchedLessons);

      // Determine preferred language from submissions
      if (submissions && submissions.length > 0) {
        const problemIds = submissions.map(s => s.problem_id);
        const { data: problems } = await supabase
          .from("practice_problems")
          .select("id, language")
          .in("id", problemIds);

        if (problems && problems.length > 0) {
          // Count languages
          const langCounts: Record<string, number> = {};
          problems.forEach(p => {
            langCounts[p.language] = (langCounts[p.language] || 0) + 1;
          });

          // Find max
          preferredLanguage = Object.keys(langCounts).reduce((a, b) => langCounts[a] > langCounts[b] ? a : b);
        }
      }

      const challenges = getDailyChallenges(today, preferredLanguage);
      setDailyChallenges(challenges);

      const passedSubmissions = submissions?.filter(s => s.status === "passed") || [];
      const uniqueProblems = new Set(passedSubmissions.map(s => s.problem_id));
      setCompletedChallenges(uniqueProblems);

      setStats({
        lessonsCompleted: fetchedLessons.length,
        problemsSolved: uniqueProblems.size,
        totalAttempts: submissions?.length || 0,
        xp: (fetchedLessons.length) * 25 + uniqueProblems.size * 50,
        streak: 0, // Placeholder for streak logic
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
          <AdUnit slotId="REPLACE_WITH_RIGHT_AD_SLOT_ID" />
        </aside>
      </div>
      <Footer />
    </div>
  );
}

