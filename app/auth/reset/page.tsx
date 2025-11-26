"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleReset = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { data, error } = await fetch("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json());

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    router.push("/auth/login?reset=success");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          <form onSubmit={handleReset}>
            <Label>New Password</Label>
            <Input
              type="password"
              className="mb-4"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Label>Confirm Password</Label>
            <Input
              type="password"
              className="mb-4"
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
