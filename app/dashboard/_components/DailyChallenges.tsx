import Link from "next/link";
import { Target, CheckCircle2, Play, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PracticeProblem } from "@/lib/supabase";

interface DailyChallengesProps {
    dailyChallenges: PracticeProblem[];
    completedChallenges: Set<string>;
}

export function DailyChallenges({ dailyChallenges, completedChallenges }: DailyChallengesProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Easy": return "text-green-500 bg-green-500/10";
            case "Medium": return "text-yellow-500 bg-yellow-500/10";
            case "Hard": return "text-red-500 bg-red-500/10";
            default: return "";
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Daily Challenges
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                        +150 XP available
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {dailyChallenges.map((challenge) => {
                    const isCompleted = completedChallenges.has(challenge.id);
                    return (
                        <Link key={challenge.id} href={`/practice/${challenge.id}`}>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-green-500/20' : 'bg-background'}`}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium group-hover:text-primary transition-colors">{challenge.title}</p>
                                        <p className="text-sm text-muted-foreground capitalize">{challenge.language}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                                        {challenge.difficulty}
                                    </Badge>
                                    <span className="text-sm font-medium text-primary">
                                        {isCompleted ? 'Completed' : '+50 XP'}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}
