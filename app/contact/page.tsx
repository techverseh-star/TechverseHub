"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Code2, Palette, MessageSquare, ArrowRight, Sparkles, Linkedin, Instagram } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-background to-background -z-10" />
                <div className="container px-4 mx-auto text-center">
                    <Badge variant="secondary" className="mb-6 animate-fade-in">
                        Contact Us
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        We’d love to <span className="gradient-text">hear from you!</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                        Whether you have a question, feedback, collaboration idea, or want to join our journey — feel free to reach out. TechVerse Hub is built for learners, creators, and innovators just like you.
                    </p>
                </div>
            </section>

            {/* Founders Section */}
            <section className="py-16">
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Meet the Founders</h2>
                        <p className="text-muted-foreground">The minds behind TechVerse Hub.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Mayank Prajapati */}
                        <Card className="group hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Code2 className="h-32 w-32 text-blue-500" />
                            </div>
                            <CardContent className="p-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Code2 className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-1">Mayank Prajapati</h3>
                                <p className="text-blue-500 font-medium mb-4">Founder & Lead Developer</p>
                                <p className="text-muted-foreground mb-6">
                                    Passionate about building practical learning tools, real-world coding environments, and creating the future of skill-based education.
                                </p>
                                <div className="inline-flex items-center gap-2 text-sm font-medium bg-secondary/50 px-3 py-1 rounded-full mb-6">
                                    <Sparkles className="h-3 w-3 text-yellow-500" />
                                    Developer of the complete TechVerse Hub ecosystem
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    <Mail className="h-4 w-4" />
                                    <a href="mailto:mayankprajapat010@gmail.com" className="hover:underline">mayankprajapat010@gmail.com</a>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <Link href="https://www.linkedin.com/public-profile/settings?trk=d_flagship3_profile_self_view_public_profile" target="_blank" className="p-2 rounded-full bg-secondary/50 hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                                        <Linkedin className="h-5 w-5" />
                                    </Link>
                                    <Link href="https://instagram.com/prajapatixmayank" target="_blank" className="p-2 rounded-full bg-secondary/50 hover:bg-pink-500/10 hover:text-pink-500 transition-colors">
                                        <Instagram className="h-5 w-5" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Keshav Agarwal */}
                        <Card className="group hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Palette className="h-32 w-32 text-purple-500" />
                            </div>
                            <CardContent className="p-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Palette className="h-8 w-8 text-purple-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-1">Keshav Agarwal</h3>
                                <p className="text-purple-500 font-medium mb-4">Co-Founder & Designer</p>
                                <p className="text-muted-foreground mb-6">
                                    The creative mind behind the UI/UX and visual identity of TechVerse Hub. Focused on designing simple, intuitive, and beautiful digital experiences.
                                </p>
                                <div className="inline-flex items-center gap-2 text-sm font-medium bg-secondary/50 px-3 py-1 rounded-full mb-6">
                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                    TechVerse Designer
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    <Mail className="h-4 w-4" />
                                    <a href="mailto:vishalagarwal1975q@gmail.com" className="hover:underline">vishalagarwal1975q@gmail.com</a>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <Link href="https://www.linkedin.com/in/keshav-agarwal-537612381?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" className="p-2 rounded-full bg-secondary/50 hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                                        <Linkedin className="h-5 w-5" />
                                    </Link>
                                    <Link href="https://instagram.com/keshu_121" target="_blank" className="p-2 rounded-full bg-secondary/50 hover:bg-pink-500/10 hover:text-pink-500 transition-colors">
                                        <Instagram className="h-5 w-5" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* General Inquiries & Connect */}
            <section className="py-20 bg-secondary/30">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">General Inquiries</h3>
                            <p className="text-muted-foreground">
                                For platform issues, support, or business queries:
                            </p>
                            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Support Team</p>
                                    <p className="text-sm text-muted-foreground">techversehub.co.in</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                (You can also reach out through the founder emails above.)
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold">Let’s Connect</h3>
                            <p className="text-muted-foreground">
                                TechVerse Hub is growing fast, and we’re always excited to meet new learners, partners, and collaborators. If you have an idea, suggestion, or feedback — we’re just one message away.
                            </p>
                            <Link href="/feedback">
                                <Button className="w-full sm:w-auto">
                                    Send Feedback <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
