import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

interface ContinueLearningProps {
    languageProgress: {
        id: string;
        name: string;
        color: string;
        iconComponent?: React.ElementType;
        icon?: string; // Fallback
        lessons?: number;
        progress?: number;
        prefix?: string;
    }[];
}

export function ContinueLearning({ languageProgress }: ContinueLearningProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Continue Learning
                    </CardTitle>
                    <Link href="/learn">
                        <Button variant="ghost" size="sm">
                            View All <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {languageProgress.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border/60 rounded-xl bg-card/20">
                        <BookOpen className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="font-medium mb-1">No languages started yet</p>
                        <p className="text-muted-foreground text-sm">Pick a language on the Learn page to get going.</p>
                    </div>
                ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languageProgress.map((lang) => {
                        const Icon = lang.iconComponent;
                        return (
                            <Link key={lang.id} href={`/learn?lang=${lang.id}`}>
                                <div className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group text-center">
                                    <div className="text-3xl mb-2 flex justify-center">
                                        {Icon ? (
                                            <Icon className="w-8 h-8" />
                                        ) : (
                                            <img src={lang.icon} alt={lang.name} className="w-8 h-8" />
                                        )}
                                    </div>
                                    <p className="font-medium group-hover:text-primary transition-colors">{lang.name}</p>
                                    <p className="text-xs text-muted-foreground">{lang.lessons} lessons</p>
                                    <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${lang.progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{lang.progress}% complete</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                )}
            </CardContent>
        </Card>
    );
}
