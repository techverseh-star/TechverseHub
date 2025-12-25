import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/data/blog-posts";
import { ShareButton } from "@/components/ShareButton";

interface BlogPostPageProps {
    params: {
        id: string;
    };
}

export function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        id: post.id,
    }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
    const post = BLOG_POSTS.find((p) => p.id === params.id);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pb-16">
                {/* Hero Section */}
                <div className="relative h-[60vh] min-h-[400px] w-full">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 container max-w-4xl mx-auto px-4 pb-12">
                        <Link href="/blog">
                            <Button variant="ghost" className="mb-6 hover:bg-background/20 text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Button>
                        </Link>

                        <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">
                            {post.category}
                        </Badge>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <span className="font-medium text-foreground">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                <span>{post.readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <article className="container max-w-3xl mx-auto px-4 mt-8">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-medium">
                            {post.excerpt}
                        </p>

                        <div className="whitespace-pre-wrap leading-relaxed">
                            {post.content}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                        <div className="text-muted-foreground">
                            Share this article
                        </div>
                        <div className="flex gap-2">
                            <ShareButton title={post.title} text={post.excerpt} />
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
