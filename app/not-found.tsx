"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-muted bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6 flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileQuestion className="h-10 w-10 text-primary" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter">Page Not Found</h1>
                            <p className="text-muted-foreground">
                                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                            </p>
                        </div>

                        <div className="flex flex-col w-full gap-3">
                            <Link href="/dashboard" className="w-full">
                                <Button className="w-full" size="lg">
                                    <Home className="mr-2 h-4 w-4" />
                                    Return to Dashboard
                                </Button>
                            </Link>

                            <Link href="/" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go Back Home
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
