"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Code2, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TechVerse Hub</span>
            </Link>
            {user && (
              <div className="hidden md:flex gap-4">
                <Link href="/dashboard">
                  <Button variant={pathname === "/dashboard" ? "default" : "ghost"}>
                    Dashboard
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button variant={pathname?.startsWith("/learn") ? "default" : "ghost"}>
                    Learn
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button variant={pathname?.startsWith("/practice") ? "default" : "ghost"}>
                    Practice
                  </Button>
                </Link>
                <Link href="/editor">
                  <Button variant={pathname === "/editor" ? "default" : "ghost"}>
                    Editor
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user && (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
