"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase, PracticeProblem, isSupabaseConfigured } from "@/lib/supabase";
import { Code, CheckCircle, Search } from "lucide-react";

const DEMO_PROBLEMS: PracticeProblem[] = [
  { id: "1", title: "Two Sum", difficulty: "Easy", language: "javascript", description: "Given an array of integers nums and an integer target...", examples: "", solution: "", hints: "" },
  { id: "2", title: "Reverse String", difficulty: "Easy", language: "python", description: "Write a function that reverses a string...", examples: "", solution: "", hints: "" },
  { id: "3", title: "Palindrome Number", difficulty: "Easy", language: "javascript", description: "Given an integer x, return true if x is a palindrome...", examples: "", solution: "", hints: "" },
  { id: "11", title: "Container With Most Water", difficulty: "Medium", language: "javascript", description: "Given n non-negative integers...", examples: "", solution: "", hints: "" },
  { id: "12", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", language: "python", description: "Given a string s, find the length...", examples: "", solution: "", hints: "" },
  { id: "21", title: "Regular Expression Matching", difficulty: "Hard", language: "javascript", description: "Given an input string s and a pattern p...", examples: "", solution: "", hints: "" },
];

export default function PracticePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

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
      if (!isSupabaseConfigured()) {
        setProblems(DEMO_PROBLEMS);
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
        setProblems(problemsData);
      } else {
        setProblems(DEMO_PROBLEMS);
      }
      
      if (submissionsData) {
        setSolvedProblems(new Set(submissionsData.map(s => s.problem_id)));
      }
    }

    loadProblems();
  }, [user]);

  const filteredProblems = problems.filter(problem => {
    const matchesFilter = filter === "all" || problem.difficulty === filter;
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!user) return null;

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  const getDifficultyDot = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-red-500";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice Arena</h1>
          <p className="text-muted-foreground">Solve coding challenges and level up your skills</p>
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
            {["all", "Easy", "Medium", "Hard"].map((f) => (
              <Badge 
                key={f}
                variant={filter === f ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 ${filter === f && f !== "all" ? getDifficultyStyles(f) : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredProblems.map((problem) => (
            <Link key={problem.id} href={`/practice/${problem.id}`}>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center`}>
                      <Code className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {problem.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getDifficultyDot(problem.difficulty)}`} />
                        <span className="text-sm text-muted-foreground">{problem.difficulty}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground capitalize">{problem.language}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {solvedProblems.has(problem.id) && (
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    <Badge className={getDifficultyStyles(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Code className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No problems found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
