import Link from "next/link";
import { Linkedin, Code2, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-12 pb-8">
            <div className="container max-w-screen-2xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Code2 className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-bold text-xl">TechVerse Hub</span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Empowering developers to master their craft through real-world practice and interactive learning.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="https://instagram.com/techversehubofficial" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="https://www.linkedin.com/public-profile/settings?trk=d_flagship3_profile_self_view_public_profile" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/learn" className="hover:text-primary transition-colors">Learn</Link></li>
                            <li><Link href="/practice" className="hover:text-primary transition-colors">Practice</Link></li>
                            <li><Link href="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
                            <li><Link href="/editor" className="hover:text-primary transition-colors">Code Editor</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link></li>
                            <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-8 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                        © {new Date().getFullYear()} TechVerse Hub. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
