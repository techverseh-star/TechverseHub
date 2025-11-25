"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase, PracticeProblem } from "@/lib/supabase";
import { Code, CheckCircle } from "lucide-react";

export default function PracticePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function loadProblems() {
      const { data: problemsData } = await supabase
        .from("practice_problems")
        .select("*")
        .order("id");

      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("problem_id")
        .eq("user_id", user.id)
        .eq("status", "passed");

      if (problemsData) setProblems(problemsData);
      if (submissionsData) {
        setSolvedProblems(new Set(submissionsData.map(s => s.problem_id)));
      }
    }

    loadProblems();
  }, [user]);

  const filteredProblems = problems.filter(problem => 
    filter === "all" ? true : problem.difficulty === filter
  );

  if (!user) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Arena</h1>
          <p className="text-muted-foreground">Solve coding challenges and level up your skills</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Badge 
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            All
          </Badge>
          <Badge 
            variant={filter === "Easy" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("Easy")}
          >
            Easy
          </Badge>
          <Badge 
            variant={filter === "Medium" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("Medium")}
          >
            Medium
          </Badge>
          <Badge 
            variant={filter === "Hard" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("Hard")}
          >
            Hard
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredProblems.map((problem) => (
            <Link key={problem.id} href={`/practice/${problem.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{problem.title}</CardTitle>
                      </div>
                      <CardDescription className="flex gap-2">
                        <Badge className={getDifficultyColor(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                        <Badge variant="secondary">{problem.language}</Badge>
                      </CardDescription>
                    </div>
                    {solvedProblems.has(problem.id) && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {problem.description.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No problems found. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
