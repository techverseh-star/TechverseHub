import Link from "next/link";
import { BookOpen, Code, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickNav() {
    return (
        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <h3 className="font-semibold text-lg">Quick Actions</h3>
                    <div className="h-4 w-px bg-border hidden md:block" />
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <Link href="/learn" className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full gap-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20">
                            <BookOpen className="h-4 w-4" />
                            Continue Learning
                        </Button>
                    </Link>

                    <Link href="/practice" className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full gap-2 hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500/20">
                            <Code className="h-4 w-4" />
                            Practice Problems
                        </Button>
                    </Link>

                    <Link href="/projects" className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full gap-2 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20">
                            <Rocket className="h-4 w-4" />
                            New Project
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
