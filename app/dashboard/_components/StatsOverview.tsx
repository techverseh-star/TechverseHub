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
            <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Lessons</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{stats.lessonsCompleted}</span>
                        <span className="text-xs text-muted-foreground">completed</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Trophy className="h-4 w-4 text-purple-500" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Problems</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{stats.problemsSolved}</span>
                        <span className="text-xs text-muted-foreground">solved</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Target className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                            {stats.totalAttempts > 0 ? Math.round((stats.problemsSolved / stats.totalAttempts) * 100) : 0}%
                        </span>
                        <span className="text-xs text-muted-foreground">success rate</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Clock className="h-4 w-4 text-orange-500" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Time</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{Math.floor(stats.totalAttempts * 5)}</span>
                        <span className="text-xs text-muted-foreground">mins</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
