import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, Zap, Brain, Trophy, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">TechVerse Hub</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 py-24 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm mb-8">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>AI-powered learning platform</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Master coding with
                <span className="gradient-text block mt-2">AI-powered practice</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Interactive lessons, LeetCode-style challenges, and intelligent hints. 
                Learn Python and JavaScript with real-time code execution.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Start Learning Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 border-t">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to code</h2>
              <p className="text-muted-foreground text-lg">Comprehensive tools for learning and practicing</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="glass-card rounded-xl p-8 hover:glow transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                  <Code2 className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Interactive Lessons</h3>
                <p className="text-muted-foreground">
                  20 hands-on lessons covering Python and JavaScript fundamentals with live code examples.
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-8 hover:glow transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Assistance</h3>
                <p className="text-muted-foreground">
                  Get intelligent hints, code explanations, and debugging help powered by advanced AI models.
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-8 hover:glow transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-6">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Practice Arena</h3>
                <p className="text-muted-foreground">
                  30 coding challenges from Easy to Hard. Test your skills with real test cases and instant feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 border-t bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start coding?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of developers improving their skills with TechVerse Hub.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Built for aspiring developers. Learn, practice, and grow.</p>
        </div>
      </footer>
    </div>
  );
}
