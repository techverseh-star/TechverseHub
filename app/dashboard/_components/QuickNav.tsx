import Link from "next/link";
import { BookOpen, Code, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function QuickNav() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/learn" className="block">
                <Card className="h-full group hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-7 w-7 text-blue-500" />
                        </div>
                        <h3 className="font-semibold mb-1">Learn</h3>
                        <p className="text-sm text-muted-foreground">Interactive lessons</p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/practice" className="block">
                <Card className="h-full group hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Code className="h-7 w-7 text-purple-500" />
                        </div>
                        <h3 className="font-semibold mb-1">Practice</h3>
                        <p className="text-sm text-muted-foreground">Coding challenges</p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/projects" className="block">
                <Card className="h-full group hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Rocket className="h-7 w-7 text-green-500" />
                        </div>
                        <h3 className="font-semibold mb-1">Projects</h3>
                        <p className="text-sm text-muted-foreground">Build real apps</p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
