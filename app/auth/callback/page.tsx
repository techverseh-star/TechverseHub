"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// The Supabase client stores auth (including the OAuth PKCE code verifier) in
// localStorage/sessionStorage, not cookies, so the code exchange must happen
// here on the client with `detectSessionInUrl` rather than in a server route.
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const next = searchParams.get("next") || "/dashboard";

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace(next);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(next);
      }
    });

    const timeout = setTimeout(() => setFailed(true), 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          {failed ? (
            <>
              <p className="text-destructive font-medium mb-3">Sign-in failed or timed out.</p>
              <Link href="/auth/login" className="text-primary hover:underline text-sm">
                Back to login
              </Link>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Signing you in...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
