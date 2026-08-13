"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "@/lib/supabase";
import { getLessons } from "@/lib/api";
import { BookOpen, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdUnit } from "@/components/AdUnit";
import { LANGUAGES } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";

function getLevelFromId(id: string): 'beginner' | 'intermediate' | 'advanced' {
  const num = parseInt(id.split('-').pop() || '0');
  if (id.includes('py-') || id.includes('js-')) {
    if (num <= 7) return 'beginner';
    if (num <= 12) return 'intermediate';
    return 'advanced';
  } else if (id.includes('ts-') || id.includes('java-')) {
    if (num <= 3) return 'beginner';
    if (num <= 6) return 'intermediate';
    return 'advanced';
  } else {
    if (num <= 4) return 'beginner';
    if (num <= 7) return 'intermediate';
    return 'advanced';
  }
}

function LearnSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
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

function LearnPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<string | null>("beginner");

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
        const fetchedLessons = await getLessons();
        const augmentedLessons = fetchedLessons.map((l) => ({
          ...l,
          level: getLevelFromId(l.id)
        }));
        setLessons(augmentedLessons as Lesson[]);
      } catch (error) {
        console.error("Failed to load learning data", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading) {
    return <LearnSkeleton />;
  }

  if (!user) return null;

  const levels = [
    { id: "beginner", title: "Level 1: Beginner Foundations", num: 1 },
    { id: "intermediate", title: "Level 2: Intermediate Engineering", num: 2 },
    { id: "advanced", title: "Level 3: Advanced Concepts", num: 3 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center">
        <aside className="hidden laptop:block w-[180px] shrink-0 p-4 sticky top-24 h-fit">
          <AdUnit
            slotId="9618594430"
            style={{ display: "inline-block", width: "160px", height: "600px" }}
            format={null}
          />
        </aside>
        <main className="flex-1 w-full max-w-[1200px] mx-auto">
          <div className="w-full px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Core <span className="gradient-text">Concepts</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Master programming from basics to advanced with structured theory and learning paths.
              </p>
            </div>

            <div className="space-y-8">
              {levels.map((level) => {
                const levelLessons = lessons.filter((l: any) => l.level === level.id);
                if (levelLessons.length === 0) return null;

                // Group by language to form "Modules"
                const modules = LANGUAGES.map(lang => {
                  const langLessons = levelLessons.filter(l => l.language === lang.id);
                  return {
                    moduleId: lang.id,
                    title: lang.name,
                    description: lang.description,
                    difficulty: level.id,
                    lessons: langLessons
                  };
                }).filter(m => m.lessons.length > 0);

                return (
                  <Card key={level.id} className="overflow-hidden border border-border">
                    <div 
                      className="p-6 bg-secondary/20 cursor-pointer flex justify-between items-center hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                          L{level.num}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{level.title}</h2>
                          <p className="text-muted-foreground">{modules.length} Language Modules</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-6 w-6 transition-transform ${expandedLevel === level.id ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {expandedLevel === level.id && (
                      <div className="p-6 bg-background">
                        <div className="grid grid-cols-1 gap-6">
                          {modules.map((module) => (
                            <div key={module.moduleId} className="border rounded-xl p-6 bg-card/50">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold mb-2">{module.title} Module</h3>
                                  <p className="text-muted-foreground mb-4">{module.description}</p>
                                </div>
                                <Badge variant="outline" className={
                                  module.difficulty === 'beginner' ? 'text-green-500 border-green-500 capitalize' :
                                  module.difficulty === 'intermediate' ? 'text-yellow-500 border-yellow-500 capitalize' :
                                  'text-red-500 border-red-500 capitalize'
                                }>
                                  {module.difficulty}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  Lessons
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {module.lessons.map((lesson, idx) => (
                                    <Link key={lesson.id} href={`/learn/${lesson.id}`}>
                                      <div className="p-3 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group flex items-start gap-3 h-full">
                                        <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0 font-medium text-sm">
                                          {idx + 1}
                                        </div>
                                        <div>
                                          <p className="font-medium group-hover:text-primary transition-colors text-sm line-clamp-2">
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
                );
              })}
            </div>
          </div>
        </main>
        <aside className="hidden laptop:block w-[180px] shrink-0 p-4 sticky top-24 h-fit">
          <AdUnit slotId="8305512761" />
        </aside>
      </div>
      <Footer />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<LearnSkeleton />}>
      <LearnPageContent />
    </Suspense>
  );
}
