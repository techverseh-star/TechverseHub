"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      // Name would theoretically come from user_metadata if we save it during signup
      setName(user.user_metadata?.full_name || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // In developer mock mode, we just simulate a save delay.
    // In production, we would use supabase.auth.updateUser({ data: { full_name: name } })
    setTimeout(() => {
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 800);
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-border/50">
            <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center text-2xl font-bold text-muted-foreground uppercase">
              {email.charAt(0) || "U"}
            </div>
            <div>
              <Button type="button" variant="outline" size="sm" className="mb-2">
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. Max size of 2MB.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Your email address is managed through your authentication provider.
            </p>
          </div>

          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      <div className="pt-8 border-t border-border/50">
        <h2 className="text-xl font-semibold mb-6">Appearance</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
              theme === "light" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-foreground/20 text-muted-foreground"
            }`}
          >
            <Sun className="h-6 w-6" />
            <span className="font-medium text-sm">Light</span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
              theme === "dark" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-foreground/20 text-muted-foreground"
            }`}
          >
            <Moon className="h-6 w-6" />
            <span className="font-medium text-sm">Dark</span>
          </button>
          
          <button
            onClick={() => setTheme("system")}
            className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
              theme === "system" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-foreground/20 text-muted-foreground"
            }`}
          >
            <Monitor className="h-6 w-6" />
            <span className="font-medium text-sm">System</span>
          </button>
        </div>
      </div>
    </div>
  );
}
