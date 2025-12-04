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
import { supabase, PracticeProblem, isSupabaseConfigured } from "@/lib/supabase";
import { Code, CheckCircle, Search, ChevronRight, Target, Flame, Trophy, Loader2 } from "lucide-react";

import { LANGUAGES } from "@/lib/constants";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

import { DEMO_PROBLEMS } from "@/lib/challenges";

function PracticePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(searchParams.get("lang"));
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
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

    async function loadProblems() {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        setProblems(DEMO_PROBLEMS);
        setLoading(false);
        return;
      }

      const { data: problemsData } = await supabase
        .from("practice_problems")
        .select("*")
        .order("id");

      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("problem_id")
        .eq("user_id", user.id)
        .eq("status", "passed");

      if (problemsData && problemsData.length > 0) {
        // Merge DB problems with Demo problems
        const dbProblemIds = new Set(problemsData.map(p => p.id));
        const newDemoProblems = DEMO_PROBLEMS.filter(p => !dbProblemIds.has(p.id));
        setProblems([...problemsData, ...newDemoProblems]);
      } else {
        setProblems(DEMO_PROBLEMS);
      }

      if (submissionsData) {
        setSolvedProblems(new Set(submissionsData.map(s => s.problem_id)));
      }

      setLoading(false);
    }

    loadProblems();
  }, [user]);

  const filteredProblems = problems.filter(problem => {
    const matchesLanguage = !selectedLanguage || problem.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());
    return matchesLanguage && matchesDifficulty && matchesSearch;
  });

  const getLanguageProblems = (lang: string) => problems.filter(p => p.language === lang);
  const getProblemsByDifficulty = (problems: PracticeProblem[], difficulty: string) =>
    problems.filter(p => p.difficulty === difficulty);

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return <Target className="h-4 w-4" />;
      case "Medium": return <Flame className="h-4 w-4" />;
      case "Hard": return <Trophy className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading problems...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {!selectedLanguage ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Practice <span className="gradient-text">Arena</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Solve coding challenges, earn XP, and master algorithms across 6 programming languages
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {LANGUAGES.map((lang) => {
                const langProblems = getLanguageProblems(lang.id);
                const solvedCount = langProblems.filter(p => solvedProblems.has(p.id)).length;

                return (
                  <Card
                    key={lang.id}
                    className="cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => setSelectedLanguage(lang.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2 flex justify-center">
                        <lang.iconComponent className="w-10 h-10" />
                      </div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{lang.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-primary">{solvedCount}</span>/{langProblems.length} solved
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {DIFFICULTIES.map((difficulty) => {
                const diffProblems = problems.filter(p => p.difficulty === difficulty);
                const solvedCount = diffProblems.filter(p => solvedProblems.has(p.id)).length;

                return (
                  <Card key={difficulty} className={`border-l-4 ${difficulty === "Easy" ? "border-l-green-500" :
                    difficulty === "Medium" ? "border-l-yellow-500" : "border-l-red-500"
                    }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getDifficultyIcon(difficulty)}
                          <h3 className="font-semibold">{difficulty}</h3>
                        </div>
                        <Badge className={getDifficultyStyles(difficulty)}>
                          {solvedCount}/{diffProblems.length}
                        </Badge>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${difficulty === "Easy" ? "bg-green-500" :
                            difficulty === "Medium" ? "bg-yellow-500" : "bg-red-500"
                            }`}
                          style={{ width: `${diffProblems.length > 0 ? (solvedCount / diffProblems.length) * 100 : 0}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">All Problems</h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search problems..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={selectedDifficulty === "all" ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2"
                    onClick={() => setSelectedDifficulty("all")}
                  >
                    All
                  </Badge>
                  {DIFFICULTIES.map((d) => (
                    <Badge
                      key={d}
                      variant={selectedDifficulty === d ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 ${selectedDifficulty === d ? getDifficultyStyles(d) : ""}`}
                      onClick={() => setSelectedDifficulty(d)}
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filteredProblems.slice(0, 20).map((problem) => (
                  <Link key={problem.id} href={`/practice/${problem.id}`}>
                    <Card className="group hover:border-primary/50 transition-all">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Code className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                              {problem.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                                {(() => {
                                  const Icon = LANGUAGES.find(l => l.id === problem.language)?.iconComponent;
                                  return Icon && <Icon className="w-4 h-4" />;
                                })()}
                                {problem.language}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {solvedProblems.has(problem.id) && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          <Badge className={getDifficultyStyles(problem.difficulty)}>
                            {problem.difficulty}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filteredProblems.length > 20 && (
                <div className="text-center mt-6">
                  <p className="text-muted-foreground">Showing 20 of {filteredProblems.length} problems. Select a language to see all.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setSelectedLanguage(null)}>
                ← Back to All
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">
                    {(() => {
                      const Icon = LANGUAGES.find(l => l.id === selectedLanguage)?.iconComponent;
                      return Icon && <Icon className="w-10 h-10" />;
                    })()}
                  </span>
                  <div>
                    <h1 className="text-3xl font-bold">{LANGUAGES.find(l => l.id === selectedLanguage)?.name} Problems</h1>
                    <p className="text-muted-foreground">{filteredProblems.length} problems available</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {filteredProblems.filter(p => solvedProblems.has(p.id)).length}/{filteredProblems.length} solved
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search problems..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={selectedDifficulty === "all" ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSelectedDifficulty("all")}
                >
                  All
                </Badge>
                {DIFFICULTIES.map((d) => (
                  <Badge
                    key={d}
                    variant={selectedDifficulty === d ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 ${selectedDifficulty === d ? getDifficultyStyles(d) : ""}`}
                    onClick={() => setSelectedDifficulty(d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </div>

            {DIFFICULTIES.map((difficulty) => {
              const diffProblems = filteredProblems.filter(p => p.difficulty === difficulty);
              if (diffProblems.length === 0) return null;
              const solvedCount = diffProblems.filter(p => solvedProblems.has(p.id)).length;

              return (
                <div key={difficulty} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getDifficultyStyles(difficulty)}`}>
                      {getDifficultyIcon(difficulty)}
                    </div>
                    <h2 className="text-xl font-bold">{difficulty}</h2>
                    <Badge variant="secondary">{solvedCount}/{diffProblems.length} solved</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {diffProblems.map((problem, idx) => (
                      <Link key={problem.id} href={`/practice/${problem.id}`}>
                        <Card className="group hover:border-primary/50 transition-all h-full">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getDifficultyStyles(difficulty)}`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium group-hover:text-primary transition-colors">
                                {problem.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {problem.description}
                              </p>
                            </div>
                            {solvedProblems.has(problem.id) && (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredProblems.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No problems found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading practice problems...</p>
          </div>
        </div>
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  );
}
