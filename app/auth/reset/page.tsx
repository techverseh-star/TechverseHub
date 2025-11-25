"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Code2, ArrowLeft, Loader2, CheckCircle, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured()) {
        setError("Authentication is not configured.");
        setCheckingSession(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        if (accessToken && type === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (!error) {
            setIsValidSession(true);
          } else {
            setError("Invalid or expired reset link. Please request a new one.");
          }
        } else {
          setError("Invalid reset link. Please request a new password reset.");
        }
      }
      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-bold">TechVerse Hub</span>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-bold">TechVerse Hub</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="border-border/50 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Password Updated!</CardTitle>
                <CardDescription>
                  Your password has been successfully changed. Redirecting to login...
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full h-11">
                    Go to Login
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <ArrowLeft className="h-4 w-4" />
              <Code2 className="h-6 w-6 text-primary" />
              <span className="font-bold">TechVerse Hub</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="border-border/50 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                  <KeyRound className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
                <CardDescription>
                  {error || "This password reset link is invalid or has expired."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-3">
                <Link href="/auth/forgot-password" className="w-full">
                  <Button className="w-full h-11">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full h-11">
                    Back to Login
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/auth/login" className="flex items-center gap-2 w-fit">
            <ArrowLeft className="h-4 w-4" />
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-bold">TechVerse Hub</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Set New Password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
