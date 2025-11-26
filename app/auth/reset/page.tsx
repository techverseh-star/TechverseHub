"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  // Validate token on load
  useEffect(() => {
    async function verify() {
      if (!token) {
        setMessage("Invalid reset link.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, checkOnly: true }),
      });

      const data = await res.json();

      if (data.valid) {
        setValid(true);
      } else {
        setMessage("Invalid or expired reset link.");
      }

      setLoading(false);
    }

    verify();
  }, [token]);

  // Submit new password
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    const res = await fetch("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/auth/login");
    } else {
      setMessage(data.error || "Server error.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <KeyRound className="h-10 w-10 text-red-500 mx-auto" />
          <p className="mt-4 font-semibold text-red-600">Invalid Reset Link</p>
          <p className="text-gray-400">{message}</p>

          <Link
            href="/auth/forgot-password"
            className="mt-4 inline-block underline text-blue-500"
          >
            Request New Link
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl p-6">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            {message && (
              <p className="text-red-500 text-center">{message}</p>
            )}

            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
