"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Code2, ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      setError("Password reset is not available. Please contact support.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
                <div className="mx-auto w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription>
                  We've sent a password reset link to {email}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign in
                  </Button>
                </Link>
              </CardContent>
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
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Forgot password?</CardTitle>
              <CardDescription>
                Enter your email and we'll send you a reset link
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </CardContent>
            </form>
            <div className="px-6 pb-6 text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to Sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
