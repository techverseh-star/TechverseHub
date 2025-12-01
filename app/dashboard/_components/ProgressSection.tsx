import Link from "next/link";
import { Calendar, Zap, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProgressSectionProps {
    stats: {
        lessonsCompleted: number;
        problemsSolved: number;
        totalAttempts: number;
        xp: number;
    };
}

export function ProgressSection({ stats }: ProgressSectionProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Your Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Lessons Completed</span>
                            <span className="text-lg font-bold text-blue-500">{stats.lessonsCompleted}/66</span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${(stats.lessonsCompleted / 66) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Problems Solved</span>
                            <span className="text-lg font-bold text-purple-500">{stats.problemsSolved}/180</span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${(stats.problemsSolved / 180) * 100}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Code Editor</h3>
                            <p className="text-sm text-muted-foreground">AI-powered workspace</p>
                        </div>
                    </div>
                    <Link href="/editor">
                        <Button className="w-full">
                            Open Editor
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Quick Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total XP</span>
                        <span className="font-semibold text-primary">{stats.xp} XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Problems Solved</span>
                        <span className="font-semibold">{stats.problemsSolved}/180</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current Rank</span>
                        <Badge variant="secondary">
                            {stats.xp < 100 ? "Beginner" : stats.xp < 500 ? "Intermediate" : "Advanced"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
