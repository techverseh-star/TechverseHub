"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Code2, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (!mounted) return null;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/learn", label: "Learn" },
    { href: "/practice", label: "Practice" },
    { href: "/projects", label: "Projects" },
    { href: "/editor", label: "Editor" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-3 pl-2 border-l">
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {user.email}
                  </span>
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
            )}
          </div>
        </div>

        {user && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
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
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
