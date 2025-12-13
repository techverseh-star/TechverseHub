"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, Lesson } from "@/lib/supabase";
import { getLessons } from "@/lib/api"; // Import new API
import { BookOpen, CheckCircle, Search, ChevronRight, Layers, Loader2 } from "lucide-react";

import { LANGUAGES } from "@/lib/constants";
import { AdUnit } from "@/components/AdUnit";

const LEVELS = [
  { id: "beginner", name: "Beginner", icon: "🌱", color: "green" },
  { id: "intermediate", name: "Intermediate", icon: "🌿", color: "yellow" },
  { id: "advanced", name: "Advanced", icon: "🌳", color: "red" },
];

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(searchParams.get("lang"));
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);

      // Fetch lessons using API layer (maps codeExample etc)
      const fetchedLessons = await getLessons();

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      // Augment lessons with levels (since level isn't in DB yet or simple inference)
      const augmentedLessons = fetchedLessons.map((l) => ({
        ...l,
        level: getLevelFromId(l.id)
      }));

      setLessons(augmentedLessons as Lesson[]);

      if (progressData) {
        setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
      }

      setLoading(false);
    }

    function getLevelFromId(id: string): 'beginner' | 'intermediate' | 'advanced' {
      const num = parseInt(id.split('-').pop() || '0'); // Safe split last part
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

    loadData();
  }, [user]);

  const filteredLessons = lessons.filter(lesson => {
    const matchesLanguage = !selectedLanguage || lesson.language === selectedLanguage;
    const matchesLevel = selectedLevel === "all" || (lesson as any).level === selectedLevel;
    const matchesSearch = lesson.title.toLowerCase().includes(search.toLowerCase());
    return matchesLanguage && matchesLevel && matchesSearch;
  });

  const getLessonsByLevel = (level: string) => {
    return filteredLessons.filter((l: any) => l.level === level);
  };

  const getLanguageColor = (lang: string) => {
    const language = LANGUAGES.find(l => l.id === lang);
    return language?.color || "gray";
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      green: "bg-green-500/10 text-green-500 border-green-500/20",
      red: "bg-red-500/10 text-red-500 border-red-500/20",
      gray: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[color] || "bg-gray-500/10 text-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading lessons...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
        <main className="flex-1 w-full max-w-[1600px] mx-auto">
          <div className="w-full px-4 py-8">
            {!selectedLanguage ? (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold mb-4">
                    Learn to <span className="gradient-text">Code</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Master programming from basics to advanced with interactive lessons, real examples, and hands-on practice
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {LANGUAGES.map((lang) => {
                    const langLessons = lessons.filter(l => l.language === lang.id);
                    const completedCount = langLessons.filter(l => completedLessons.has(l.id)).length;
                    const progress = langLessons.length > 0 ? (completedCount / langLessons.length) * 100 : 0;
                    const Icon = lang.iconComponent;

                    return (
                      <Card
                        key={lang.id}
                        className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
                        onClick={() => setSelectedLanguage(lang.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${getColorClasses(lang.color)}`}>
                              {Icon && <Icon className="w-10 h-10" />}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {lang.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">{lang.description}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">{langLessons.length} lessons</span>
                            <span className="font-medium text-primary">{completedCount}/{langLessons.length} completed</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${lang.color === "blue" ? "bg-blue-500" :
                                lang.color === "yellow" ? "bg-yellow-500" :
                                  lang.color === "orange" ? "bg-orange-500" :
                                    lang.color === "gray" ? "bg-gray-500" :
                                      lang.color === "purple" ? "bg-purple-500" : "bg-primary"
                                }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="mt-16">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Layers className="h-6 w-6 text-primary" />
                    Learning Path
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {LEVELS.map((level, idx) => (
                      <Card key={level.id} className="relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${level.color === "green" ? "bg-green-500" :
                          level.color === "yellow" ? "bg-yellow-500" : "bg-red-500"
                          }`} />
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">{level.icon}</span>
                            <div>
                              <h3 className="font-semibold text-lg">{level.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {level.id === "beginner" && "Start your coding journey"}
                                {level.id === "intermediate" && "Build on your foundation"}
                                {level.id === "advanced" && "Master advanced concepts"}
                              </p>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {level.id === "beginner" && (
                              <>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Variables & Data Types</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Control Flow</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Basic Syntax</li>
                              </>
                            )}
                            {level.id === "intermediate" && (
                              <>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Functions & Methods</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Object-Oriented Programming</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-500" /> Data Structures</li>
                              </>
                            )}
                            {level.id === "advanced" && (
                              <>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Design Patterns</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Performance Optimization</li>
                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-red-500" /> Advanced Features</li>
                              </>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <Button variant="ghost" onClick={() => setSelectedLanguage(null)}>
                    ← Back to Languages
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">
                        {(() => {
                          const lang = LANGUAGES.find(l => l.id === selectedLanguage);
                          const Icon = lang?.iconComponent;
                          return Icon && <Icon className="w-10 h-10" />;
                        })()}
                      </span>
                      <div>
                        <h1 className="text-3xl font-bold">{LANGUAGES.find(l => l.id === selectedLanguage)?.name}</h1>
                        <p className="text-muted-foreground">{LANGUAGES.find(l => l.id === selectedLanguage)?.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {filteredLessons.filter(l => completedLessons.has(l.id)).length}/{filteredLessons.length} completed
                    </span>
                  </div>
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
                    <Badge
                      variant={selectedLevel === "all" ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => setSelectedLevel("all")}
                    >
                      All Levels
                    </Badge>
                    {LEVELS.map((level) => (
                      <Badge
                        key={level.id}
                        variant={selectedLevel === level.id ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-2 ${selectedLevel === level.id ? getColorClasses(level.color) : ""}`}
                        onClick={() => setSelectedLevel(level.id)}
                      >
                        {level.icon} {level.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {["beginner", "intermediate", "advanced"].map((level) => {
                  const levelLessons = getLessonsByLevel(level);
                  if (levelLessons.length === 0) return null;
                  const levelInfo = LEVELS.find(l => l.id === level);
                  const levelCompleted = levelLessons.filter(l => completedLessons.has(l.id)).length;

                  return (
                    <div key={level} className="mb-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{levelInfo?.icon}</span>
                        <h2 className="text-xl font-bold capitalize">{level}</h2>
                        <Badge variant="secondary" className={getColorClasses(levelInfo?.color || "gray")}>
                          {levelCompleted}/{levelLessons.length} completed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {levelLessons.map((lesson, idx) => (
                          <Link key={lesson.id} href={`/learn/${lesson.id}`}>
                            <Card className="h-full group hover:border-primary/50 transition-all hover:shadow-lg">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getColorClasses(getLanguageColor(lesson.language))}`}>
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium group-hover:text-primary transition-colors mb-1">
                                      {lesson.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {lesson.content}
                                    </p>
                                  </div>
                                  {completedLessons.has(lesson.id) && (
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredLessons.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No lessons found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <aside className="hidden laptop:block w-[180px] shrink-0 p-4 sticky top-24 h-fit">
          <AdUnit
            slotId="8305512761"
            style={{ display: "inline-block", width: "160px", height: "600px" }}
            format={null}
          />
        </aside>
      </div>
      <Footer />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading lessons...</p>
          </div>
        </div>
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
