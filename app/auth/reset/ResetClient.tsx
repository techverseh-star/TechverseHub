"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import supabase and UI components
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ResetClient({ token }: { token: string | null }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      if (!token) {
        setError("Invalid reset link.");
        setChecking(false);
        return;
      }
      try {
        // optional: call your API to validate token rather than using supabase client
        const res = await fetch("/api/validate-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setValid(true);
        } else {
          setError(data.error || "Invalid or expired reset link.");
        }
      } catch (err) {
        setError("Server error.");
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [token]);

  if (checking) return <div>Loading…</div>;
  if (!valid) return (
    <div>
      <h3>Invalid Reset Link</h3>
      <p>{error}</p>
      <button onClick={() => router.push("/auth/forgot-password")}>Request New Link</button>
    </div>
  );

  return (
    <div>
      {/* show password form; on submit call your API to update password using token */}
    </div>
  );
}
