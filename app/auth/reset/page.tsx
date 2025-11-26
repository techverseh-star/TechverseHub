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

  // -----------------------------------------------------------
  // CHECK SESSION — REQUIRED FOR PASSWORD RESET
  // -----------------------------------------------------------
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
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        if (accessToken && type === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || ""
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

  // -----------------------------------------------------------
  // HANDLE PASSWORD UPDATE
  // -----------------------------------------------------------
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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut();

    setTimeout(() => router.push("/auth/login"), 2000);
    setLoading(false);
  };

  // -----------------------------------------------------------
  // STATE-BASED RETURN BLOCKS
  // -----------------------------------------------------------

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
            <CardTitle>Password Updated</CardTitle>
            <CardDescription>You can now log in with your new password.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/auth/login")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <KeyRound className="h-10 w-10 text-red-500 mx-auto" />
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/auth/forgot-password" className="w-full">
              <Button className="w-full">Request New Link</Button>
            </Link>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full">Back to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // FINAL FORM RETURN
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <KeyRound className="h-10 w-10 text-primary mx-auto" />
          <CardTitle>Set New Password</CardTitle>
        </CardHeader>

        <form onSubmit={handlePasswordUpdate}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <Label>New Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
