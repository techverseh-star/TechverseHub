import { Star } from "lucide-react";

interface DashboardHeaderProps {
    userName: string;
    xp: number;
}

export function DashboardHeader({ userName, xp }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, <span className="gradient-text">{userName}</span>
                </h1>
                <p className="text-muted-foreground">Build Real Skills With Real Practice</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <Star className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold text-purple-500">{xp} XP</span>
                </div>
            </div>
        </div>
    );
}
