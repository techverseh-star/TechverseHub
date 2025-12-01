"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Bot, BookOpen, Code2, Users, ArrowRight, Sparkles, Target, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
                <div className="container px-4 mx-auto text-center">
                    <Badge variant="secondary" className="mb-6 animate-fade-in">
                        About TechVerse Hub
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Learning that feels like <span className="gradient-text">Creating</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                        TechVerse Hub is a next-generation learning platform built for one purpose — to help you learn, build, and grow through real, industry-ready skills.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/learn">
                            <Button size="lg" className="rounded-full">
                                Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/practice">
                            <Button size="lg" variant="outline" className="rounded-full">
                                Try Challenges
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-secondary/30">
                <div className="container px-4 mx-auto">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-6">
                            <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            To make skill-based learning accessible for everyone — by combining real coding experience with modern AI assistance.
                        </p>
                        <blockquote className="text-2xl font-medium italic text-foreground/80 border-l-4 border-primary pl-6 py-2 bg-background/50 rounded-r-lg">
                            “I didn’t just study… I built something real.”
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* Offerings Section */}
            <section className="py-20">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">What We Offer</h2>
                        <p className="text-muted-foreground">Everything you need to go from beginner to builder.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Rocket className="h-6 w-6 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Hands-On Coding Environment</h3>
                                <p className="text-muted-foreground">
                                    Write, run, and test code directly inside TechVerse Hub — no setup, no configuration, just pure learning.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="group hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/5">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-6 w-6 text-green-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Beginner-Friendly Learning Paths</h3>
                                <p className="text-muted-foreground">
                                    Easy-to-follow modules that teach coding through examples, projects, and real scenarios.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="group hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/5">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Code2 className="h-6 w-6 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Real Project Experience</h3>
                                <p className="text-muted-foreground">
                                    You won’t just practice—you’ll build. From small scripts to full applications, everything you learn becomes a real project.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center mb-12">
                        <Badge variant="outline" className="mb-4">Future Roadmap</Badge>
                        <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
                        <p className="text-muted-foreground">We are constantly evolving. Here is what’s next.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <Card className="group border-dashed hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/5 bg-secondary/10">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Bot className="h-6 w-6 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">AI-Powered Developer Agents</h3>
                                <p className="text-muted-foreground">
                                    Get help like never before. Our upcoming full-stack AI agent will guide you through real project building, debugging, and understanding complex concepts.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="group border-dashed hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/5 bg-secondary/10">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Users className="h-6 w-6 text-pink-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">A Community for Learners & Builders</h3>
                                <p className="text-muted-foreground">
                                    TechVerse Hub is growing into a space where learners share ideas, ask questions, and build impressive projects together.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-20 bg-primary/5">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border text-sm font-medium">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                Why TechVerse Hub?
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Because learning should be simple, practical, and future-ready.
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                We combine the best of both worlds — human-like teaching and AI-driven development support — so you can go from beginner to builder confidently.
                            </p>
                        </div>
                        <div className="bg-background p-8 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Lightbulb className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Our Vision</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                A world where anyone can learn to code, build products, and explore technology — without needing expensive resources or complicated setups.
                            </p>
                            <p className="font-medium text-primary">
                                A world where learning feels like creating.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
