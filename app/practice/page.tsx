"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { BookOpen, CheckCircle, ChevronRight, Loader2, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdUnit } from "@/components/AdUnit";
import { PracticeSummaryLevel } from "@/lib/practiceData";
import { useAuth } from "@/components/AuthProvider";

function PracticeSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
          <Skeleton className="h-12 w-80 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 flex items-center gap-5">
              <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-32" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function PracticePageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [levels, setLevels] = useState<PracticeSummaryLevel[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const [category, setCategory] = useState<'Web dev' | 'Dsa'>((urlCategory as 'Web dev' | 'Dsa') || 'Web dev');

  useEffect(() => {
    if (urlCategory === 'Dsa' || urlCategory === 'Web dev') {
      setCategory(urlCategory);
    }
  }, [urlCategory]);

  const handleCategoryChange = (newCategory: 'Web dev' | 'Dsa') => {
    setCategory(newCategory);
    router.replace(`/practice?category=${encodeURIComponent(newCategory)}`, { scroll: false });
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/practice?category=${encodeURIComponent(category)}`);
        if (res.ok) {
          const data = await res.json();
          setLevels(data);
        }
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("completed", true);

        if (progress) {
          setCompletedLessons(progress.map((p: any) => p.lesson_id));
        }
      } catch (error) {
        console.error("Failed to load practice data", error);
      } finally {
        setLoading(false);
        setHasLoadedOnce(true);
      }
    }

    loadData();
  }, [user, category]);

  // Derived state for Dashboard
  let totalLessons = 0;
  let completedCount = 0;
  let nextLessonUrl: string | null = null;
  let nextLessonTitle: string | null = null;

  for (const level of levels) {
    for (const module of level.modules) {
      for (const lesson of module.lessons) {
        totalLessons++;
        if (completedLessons.includes(lesson.lessonId)) {
          completedCount++;
        } else if (!nextLessonUrl) {
          nextLessonUrl = `/practice/${level.level}/${module.moduleId}/${lesson.lessonId}?category=${encodeURIComponent(category)}`;
          nextLessonTitle = lesson.title;
        }
      }
    }
  }

  const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  if (loading && !hasLoadedOnce) {
    return <PracticeSkeleton />;
  }

  if (!user) return null;

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
        <main className="flex-1 py-12 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16 relative">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                {category === 'Web dev' ? 'Full Stack Web Dev ' : 'Data Structures & Algorithms '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Interactive Labs</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                {category === 'Web dev' 
                  ? 'Master web development with structured theory, examples, and hands-on coding practice.'
                  : 'Master Data Structures and Algorithms with step-by-step breakdowns, mental models, and hands-on practice.'}
              </p>
              
              <div className="inline-flex bg-secondary/50 p-1.5 rounded-full border border-border/50 backdrop-blur-sm gap-1">
                <Button 
                  variant="ghost"
                  onClick={() => handleCategoryChange('Web dev')}
                  size="lg"
                  className={`rounded-full px-8 transition-all duration-300 ${category === 'Web dev' ? 'bg-background shadow-md text-foreground hover:bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  Web Development
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => handleCategoryChange('Dsa')}
                  size="lg"
                  className={`rounded-full px-8 transition-all duration-300 ${category === 'Dsa' ? 'bg-background shadow-md text-foreground hover:bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                >
                  Data Structures & Algorithms
                </Button>
              </div>
            </div>

            {/* Dashboard Progress Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Course Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold">{progressPercentage}%</span>
                    <span className="text-sm text-muted-foreground mb-1">({completedCount}/{totalLessons})</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Study Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold flex items-center gap-1.5">
                      <Flame className="h-7 w-7 text-orange-500 fill-orange-500/20" />
                      1
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">Day Streak</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Keep learning to build your streak!</p>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-sm border-border/50 md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Next Up</CardTitle>
                </CardHeader>
                <CardContent>
                  {nextLessonUrl ? (
                    <div className="space-y-4">
                      <p className="text-sm font-medium line-clamp-1">{nextLessonTitle}</p>
                      <Link href={nextLessonUrl}>
                        <Button className="w-full gap-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">
                          Continue <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-emerald-500">Course Completed! 🎉</p>
                      <Button variant="outline" className="w-full gap-2 border-emerald-500/50 text-emerald-500" disabled>
                        All Done
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : levels.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl bg-card/20">
                <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg font-medium mb-1">No curriculum available yet</p>
                <p className="text-muted-foreground text-sm">
                  {category === 'Web dev' ? 'Web Development' : 'DSA'} lessons are coming soon. Check back later!
                </p>
              </div>
            ) : (
            <div className="space-y-8">
              {levels.map((level) => (
                <Card key={level.level} className="overflow-hidden border border-border bg-card shadow-none transition-all duration-300 rounded-2xl">
                  <div
                    className="p-6 cursor-pointer flex justify-between items-center hover:bg-secondary/5 transition-colors group"
                    onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                        L{level.level}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">{level.title}</h2>
                        <p className="text-muted-foreground">{level.modules.length} Modules</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-6 w-6 transition-transform ${expandedLevel === level.level ? 'rotate-90' : ''}`} />
                  </div>

                  {expandedLevel === level.level && (
                    <div className="p-6 bg-background/40">
                      <div className="grid grid-cols-1 gap-6">
                        {level.modules.map((module, modIdx) => (
                          <div key={module.moduleId} className="border border-border/50 rounded-xl p-6 bg-[#0a0a0a] relative overflow-hidden group/module hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                            {/* Subtle top gradient line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover/module:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex justify-between items-start mb-5">
                              <div>
                                <div className="flex gap-2 mb-3">
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                                    Level {level.level}
                                  </Badge>
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                                    Module {modIdx + 1}
                                  </Badge>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 group-hover/module:text-primary transition-colors">{module.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{module.description}</p>
                              </div>
                              <Badge variant="outline" className={`ml-4 shrink-0 font-medium tracking-wide ${
                                module.difficulty === 'Easy' || module.difficulty === 'Beginner' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' :
                                  module.difficulty === 'Medium' || module.difficulty === 'Intermediate' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                                    'text-rose-500 border-rose-500/30 bg-rose-500/10'
                              }`}>
                                {module.difficulty || 'All Levels'}
                              </Badge>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                {module.lessons.length} Lessons
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {module.lessons.map((lesson, idx) => (
                                  <Link key={lesson.lessonId} href={`/practice/${level.level}/${module.moduleId}/${lesson.lessonId}?category=${encodeURIComponent(category)}`}>
                                    <div className="p-3 border border-border/40 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group/lesson flex items-start gap-3 h-full bg-background/50 hover:shadow-sm relative overflow-hidden">
                                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary scale-y-0 group-hover/lesson:scale-y-100 transition-transform origin-left duration-300" />
                                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 font-medium text-sm transition-colors ${completedLessons.includes(lesson.lessonId) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-secondary/50 border border-border/50 group-hover/lesson:bg-primary/10 group-hover/lesson:text-primary group-hover/lesson:border-primary/20'}`}>
                                        {completedLessons.includes(lesson.lessonId) ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                                      </div>
                                      <div className="pt-1.5 flex-1 pr-2">
                                        <p className={`font-medium transition-colors text-sm line-clamp-2 leading-tight ${completedLessons.includes(lesson.lessonId) ? 'text-emerald-500' : 'group-hover/lesson:text-primary'}`}>
                                          {lesson.title}
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            )}
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

export default function PracticePage() {
  return (
    <Suspense fallback={<PracticeSkeleton />}>
      <PracticePageContent />
    </Suspense>
  );
}
