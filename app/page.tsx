"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { Code2, Zap, Brain, Trophy, ArrowRight, BookOpen, Terminal, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const typingContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.3,
    }
  }
};

const typingChar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } }
};

const TypewriterText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <motion.span variants={typingContainer} initial="hidden" animate="visible" className={className}>
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={typingChar}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  // Avoid flashing guest marketing copy (Sign In / Start Learning Free) at
  // someone who's already signed in - send them to the dashboard instead.
  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <section className="relative overflow-hidden pt-32 pb-24">
          <div className="container mx-auto px-4 relative">
            <motion.div 
              className="max-w-4xl mx-auto flex flex-col items-center text-center"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-secondary/20 text-xs font-medium tracking-wide uppercase mb-8">
                <span>The Standard for Technical Excellence</span>
              </motion.div>

              <motion.h1 variants={fadeUpVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                <TypewriterText text="Master Software Engineering " />
                <br />
                <TypewriterText text="Without the Fluff." className="text-zinc-500" />
              </motion.h1>

              <motion.p variants={fadeUpVariants} className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Join a community of top-tier developers. Learn core concepts, build real-world systems, and master your craft with focused, high-signal curriculum.
              </motion.p>

              <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                <Link href="/auth/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="gap-2 text-md px-10 h-14 rounded-full shadow-md">
                      Start Building Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/auth/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="text-md px-10 h-14 rounded-full border-border/50 bg-transparent hover:bg-secondary/50">
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-12 border-y border-border/50 bg-secondary/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 text-center">
              {[
                { label: "Active Learners", value: "15,000+" },
                { label: "Interactive Labs", value: "180+" },
                { label: "Lines of Code", value: "2.5M+" },
                { label: "Supported Languages", value: "6" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-4xl font-black text-primary mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-5xl mx-auto rounded-2xl border border-border/50 bg-[#0a0a0a] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center px-4 py-3 border-b border-border/30 bg-[#111]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto text-xs font-mono text-muted-foreground">main.py</div>
              </div>
              <div className="p-6 md:p-8 overflow-x-auto text-sm md:text-base font-mono text-zinc-300 leading-relaxed">
                <span className="text-pink-500">def</span> <span className="text-blue-400">train_neural_network</span>(data, epochs=<span className="text-orange-400">100</span>):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500"># Initialize weights and biases</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;model = Sequential([<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Dense(<span className="text-orange-400">128</span>, activation=<span className="text-green-400">'relu'</span>),<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Dropout(<span className="text-orange-400">0.2</span>),<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Dense(<span className="text-orange-400">10</span>, activation=<span className="text-green-400">'softmax'</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;])<br />
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-500">return</span> model.compile(optimizer=<span className="text-green-400">'adam'</span>, loss=<span className="text-green-400">'sparse_categorical_crossentropy'</span>)
                <motion.span 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-2 h-4 bg-primary ml-1 align-middle"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 border-t">
          <motion.div 
            className="container mx-auto px-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUpVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to code</h2>
              <p className="text-muted-foreground text-lg">Comprehensive tools for learning, building, and growing</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Code2, title: "Interactive Labs", desc: "Deep-dive lessons covering Python, TypeScript, Java, C, and C++ from beginner to systems level." },
                { icon: Brain, title: "Smart Architecture", desc: "Design robust systems and write code that scales, avoiding anti-patterns." },
                { icon: Trophy, title: "Practice Arena", desc: "180+ algorithm challenges and real test cases with instant validation." },
                { icon: Zap, title: "Community Driven", desc: "Connect with peers, review code, and grow together in a high-signal environment." },
                { icon: Code2, title: "Real-World Builds", desc: "Deploy production-ready projects and master full-stack deployment pipelines." },
                { icon: Brain, title: "Open Source Focus", desc: "Contribute to real libraries and build an undeniable portfolio of work." }
              ].map((card, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeUpVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="glass-card rounded-2xl p-8 group cursor-default shadow-sm hover:shadow-primary/5 hover:border-primary/20"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6 text-zinc-300 group-hover:text-white group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="py-24 border-t">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">How TechVerse Hub Works</h2>
              <p className="text-muted-foreground text-xl">A proven framework to take you from beginner to senior engineer.</p>
            </div>

            <div className="space-y-32">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 space-y-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">1</div>
                  <h3 className="text-3xl font-bold">Learn Core Concepts</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Read deep-dive lessons that strip away the fluff. We explain complex systems, memory management, and advanced architecture in plain English.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 w-full relative">
                  <div className="aspect-[4/3] rounded-2xl bg-secondary/30 border border-border/50 flex items-center justify-center relative overflow-hidden">
                    <BookOpen className="h-24 w-24 text-primary/20 absolute" />
                    <div className="absolute inset-4 bg-background border border-border/50 shadow-xl rounded-xl p-6 opacity-90">
                      <div className="h-4 w-1/3 bg-secondary rounded mb-4" />
                      <div className="h-3 w-full bg-secondary/50 rounded mb-2" />
                      <div className="h-3 w-5/6 bg-secondary/50 rounded mb-2" />
                      <div className="h-3 w-4/6 bg-secondary/50 rounded" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 space-y-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">2</div>
                  <h3 className="text-3xl font-bold">Interactive Practice</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Put theory into practice instantly. Solve algorithms, debug systems, and write actual code in our browser-based environments.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 w-full relative">
                  <div className="aspect-[4/3] rounded-2xl bg-secondary/30 border border-border/50 flex items-center justify-center relative overflow-hidden">
                    <Terminal className="h-24 w-24 text-primary/20 absolute" />
                    <div className="absolute inset-4 bg-[#0a0a0a] border border-border/50 shadow-xl rounded-xl p-4 opacity-90 flex flex-col">
                      <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
                        <div className="h-2 w-12 bg-primary/50 rounded" />
                        <div className="h-2 w-12 bg-white/10 rounded" />
                      </div>
                      <div className="flex-1 border border-white/10 rounded bg-black/50 p-3">
                        <div className="h-2 w-1/2 bg-green-500/50 rounded mb-2" />
                        <div className="h-2 w-1/3 bg-white/20 rounded" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 space-y-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">3</div>
                  <h3 className="text-3xl font-bold">Build & Deploy</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Stop building calculators. Build scalable APIs, distributed systems, and modern web apps that look incredible on your resume.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 w-full relative">
                  <div className="aspect-[4/3] rounded-2xl bg-secondary/30 border border-border/50 flex items-center justify-center relative overflow-hidden">
                    <Rocket className="h-24 w-24 text-primary/20 absolute" />
                    <div className="absolute inset-4 bg-background border border-border/50 shadow-xl rounded-xl p-1 opacity-90 flex gap-1">
                      <div className="w-1/4 h-full bg-secondary/30 rounded" />
                      <div className="flex-1 h-full bg-secondary/10 rounded flex flex-col gap-1 p-1">
                        <div className="h-1/3 w-full bg-secondary/30 rounded" />
                        <div className="flex-1 w-full bg-secondary/20 rounded" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 border-t bg-secondary/5">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by Engineers</h2>
              <p className="text-muted-foreground text-xl">Don't just take our word for it.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Sarah Jenkins", role: "Senior Frontend Engineer", body: "The clean architecture and lack of fluff is exactly what I was looking for to level up my systems knowledge." },
                { name: "David Chen", role: "Backend Developer", body: "I finally understand how memory management works under the hood thanks to the C++ interactive labs." },
                { name: "Aisha Patel", role: "Full Stack Developer", body: "Building the mesh network project completely changed how I think about distributed systems. Highly recommended." },
              ].map((testimonial, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl border border-border/50 bg-background shadow-sm flex flex-col justify-between"
                >
                  <p className="text-muted-foreground mb-8 leading-relaxed">"{testimonial.body}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 border-t bg-secondary/10">
          <motion.div 
            className="container mx-auto px-4 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start coding?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of developers improving their skills with TechVerse Hub.
            </p>
            <Link href="/auth/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Button size="lg" className="gap-2 rounded-full h-14 px-10">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
