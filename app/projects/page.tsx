"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket, Code, Clock, Star, ChevronRight, Layers,
  Terminal, Globe, Database, Cpu, Lock, Zap, Loader2, MessageCircle, BookOpen
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProjects, Project as ApiProject } from "@/lib/api";

import { LANGUAGES } from "@/lib/constants";
import { AdUnit } from "@/components/AdUnit";

interface Project extends ApiProject {
  icon: React.ReactNode;
}

function ProjectsPageContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);

      const fetchedProjects = await getProjects();

      const mappedProjects = fetchedProjects.map(p => {
        let Icon = Terminal;
        const titleLower = p.title.toLowerCase();
        if (titleLower.includes("web") || titleLower.includes("landing") || titleLower.includes("portfolio")) Icon = Globe;
        else if (titleLower.includes("data") || titleLower.includes("sql") || titleLower.includes("inventory")) Icon = Database;
        else if (titleLower.includes("calc") || titleLower.includes("math")) Icon = Cpu;
        else if (titleLower.includes("game")) Icon = Zap;
        else if (titleLower.includes("app") || titleLower.includes("chat")) Icon = MessageCircle;
        else if (titleLower.includes("system") || titleLower.includes("manager")) Icon = Layers;

        return {
          ...p,
          icon: <Icon className="h-6 w-6" />
        };
      });

      setProjects(mappedProjects);
      setLoading(false);
    }
    loadData();
  }, [router]);

  const filteredProjects = projects.filter(project => {
    const matchesLanguage = !selectedLanguage || project.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === "all" || project.difficulty === selectedDifficulty;
    return matchesLanguage && matchesDifficulty;
  });

  const getLanguageInfo = (langId: string) => LANGUAGES.find(l => l.id === langId);

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Intermediate": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Advanced": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading projects...</p>
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
            slotId="2890917443"
            style={{ display: "inline-block", width: "160px", height: "600px" }}
            format={null}
          />
        </aside>
        <main className="flex-1 w-full max-w-[1600px] mx-auto">
          <div className="w-full px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Build Real <span className="gradient-text">Projects</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Apply your skills by building complete applications from scratch. Each project includes step-by-step guidance and real-world features.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button
                variant={selectedLanguage === null ? "default" : "outline"}
                onClick={() => setSelectedLanguage(null)}
                className="gap-2"
              >
                All Languages
              </Button>
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang.id}
                  variant={selectedLanguage === lang.id ? "default" : "outline"}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className="gap-2"
                >
                  <span>
                    <lang.iconComponent className="w-4 h-4" />
                  </span>
                  {lang.name}
                </Button>
              ))}
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {["all", "Beginner", "Intermediate", "Advanced"].map((diff) => (
                <Badge
                  key={diff}
                  variant={selectedDifficulty === diff ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 ${selectedDifficulty === diff && diff !== "all"
                    ? getDifficultyStyles(diff)
                    : ""
                    }`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff === "all" ? "All Levels" : diff}
                </Badge>
              ))}
            </div>

            {selectedLanguage && (
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-3">
                  <span className="text-4xl">
                    {(() => {
                      const LangIcon = getLanguageInfo(selectedLanguage)?.iconComponent;
                      return LangIcon ? <LangIcon className="w-10 h-10" /> : null;
                    })()}
                  </span>
                  {getLanguageInfo(selectedLanguage)?.name} Projects
                </h2>
                <p className="text-muted-foreground mt-2">
                  {filteredProjects.length} projects available
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const lang = getLanguageInfo(project.language);
                const LangIcon = lang?.iconComponent;

                return (
                  <Card
                    key={project.id}
                    className="group hover:border-primary/50 transition-all hover:shadow-lg flex flex-col"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            {project.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {project.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xl">
                                {LangIcon && <LangIcon className="w-5 h-5" />}
                              </span>
                              <span className="text-sm text-muted-foreground">{lang?.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      {project.concepts && project.concepts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.concepts.slice(0, 4).map((concept: string) => (
                            <Badge key={concept} variant="secondary" className="text-xs">
                              {concept}
                            </Badge>
                          ))}
                          {project.concepts.length > 4 && (
                            <Badge variant="secondary" className="text-xs">+{project.concepts.length - 4}</Badge>
                          )}
                        </div>
                      )}

                      <div className="space-y-2 mb-4 text-sm mt-auto">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {project.steps ? project.steps.length : 0} Guided Steps
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {project.duration}
                          </div>
                          <Badge className={getDifficultyStyles(project.difficulty)}>
                            {project.difficulty}
                          </Badge>
                        </div>
                        <Link href={`/projects/${project.id}`}>
                          <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                            Start <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}

            <div className="mt-16 text-center">
              <Card className="inline-block max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Star className="h-8 w-8 text-primary" />
                    <h2 className="text-2xl font-bold">Have a project idea?</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Use our AI-powered editor to get help building any project you can imagine.
                    Get real-time code suggestions, debugging help, and best practices.
                  </p>
                  <Link href="/editor">
                    <Button size="lg" className="gap-2">
                      <Rocket className="h-5 w-5" />
                      Open Code Editor
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <aside className="hidden laptop:block w-[180px] shrink-0 p-4 sticky top-24 h-fit">
          <AdUnit slotId="7951672437" />
        </aside>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}
