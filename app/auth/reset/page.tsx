"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, KeyRound, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🔍 1️⃣ Validate token
  useEffect(() => {
    const check = async () => {
      if (!token) {
        setError("Invalid reset link");
        setChecking(false);
        return;
      }

      const res = await fetch("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, checkOnly: true }),
      });

      const data = await res.json();

      if (data.valid) setValid(true);
      else setError(data.error || "Invalid reset link");

      setChecking(false);
    };

    check();
  }, [token]);

  // 🔑 2️⃣ Submit new password
  const submitPassword = async () => {
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (data.success) {
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } else {
      setError(data.error || "Server error");
    }
  };

  // UI ------
  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );

  if (!valid)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-4">
          <CardHeader className="text-center">
            <KeyRound className="h-10 w-10 text-red-500 mx-auto" />
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>Server error.</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={() => router.push("/auth/forgot-password")} className="w-full">
              Request New Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    );

  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-4">
          <CardHeader className="text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
            <CardTitle>Password Updated</CardTitle>
            <CardDescription>You can now log in.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full p-6">
        <CardHeader className="text-center">
          <KeyRound className="h-10 w-10 text-primary mx-auto" />
          <CardTitle>Create New Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}

          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={submitPassword}>
            Reset Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
