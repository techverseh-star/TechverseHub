import { BookOpen, Trophy, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
    stats: {
        lessonsCompleted: number;
        problemsSolved: number;
        totalAttempts: number;
        xp: number;
    };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Lessons</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.lessonsCompleted}</div>
                    <p className="text-xs text-muted-foreground">completed</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Trophy className="h-5 w-5 text-purple-500" />
                        <span className="text-xs text-muted-foreground">Problems</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.problemsSolved}</div>
                    <p className="text-xs text-muted-foreground">solved</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-muted-foreground">Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {stats.totalAttempts > 0 ? Math.round((stats.problemsSolved / stats.totalAttempts) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">success rate</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span className="text-xs text-muted-foreground">Time</span>
                    </div>
                    <div className="text-2xl font-bold">{Math.floor(stats.totalAttempts * 5)}</div>
                    <p className="text-xs text-muted-foreground">minutes coded</p>
                </CardContent>
            </Card>
        </div>
    );
}
