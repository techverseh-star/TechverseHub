import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import { BLOG_POSTS } from "@/data/blog-posts";

export const metadata = {
    title: "TechVerse Blog - Articles & Tutorials",
    description: "Explore the latest insights, tutorials, and trends in software development from the TechVerseHub team."
};

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-7xl mx-auto py-12 px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        TechVerse <span className="gradient-text">Insights</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Deep dives into code, career advice, and the latest in tech.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post) => (
                        <Card key={post.id} className="group overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300">
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-background/80 text-foreground backdrop-blur-md hover:bg-background/90">
                                        {post.category}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                                    {post.excerpt}
                                </p>
                            </CardContent>

                            <CardFooter className="px-6 pb-6 pt-0 mt-auto flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{post.date.split(',')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
