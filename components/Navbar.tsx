"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Code2, LogOut, Menu, X, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    } finally {
      // Forcefully clear auth tokens from local and session storage just in case signOut failed
      if (typeof window !== 'undefined') {
        for (let i = window.localStorage.length - 1; i >= 0; i--) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith('sb-')) {
            window.localStorage.removeItem(key);
          }
        }
        for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
          const key = window.sessionStorage.key(i);
          if (key && key.startsWith('sb-')) {
            window.sessionStorage.removeItem(key);
          }
        }
      }
      window.location.href = "/";
    }
  };

  if (!mounted) return null;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/learn", label: "Core Concepts" },
    { href: "/practice", label: "Interactive Labs" },
    { href: "/projects", label: "Real-World Builds" },
    { href: "/editor", label: "Editor" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold hidden sm:inline">TechVerse Hub</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={pathname?.startsWith(link.href)
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l">
                  <span className="text-sm text-muted-foreground truncate max-w-[150px] mr-2">
                    {user.email}
                  </span>
                  <Link href="/settings">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </div>
        <div 
          className={cn(
            "md:hidden absolute top-16 right-4 w-[calc(100%-2rem)] max-w-sm bg-background border border-border rounded-xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-top-right overflow-hidden z-50",
            mobileMenuOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="p-4 flex flex-col gap-2">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${pathname?.startsWith(link.href)
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground"
                        }`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Sign in</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
