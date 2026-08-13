"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextValue {
  user: any;
  session: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, session: null, loading: true });

// Single, app-wide auth check. Lives in the root layout, which Next.js keeps
// mounted across client-side navigations, so this only runs once per visit
// instead of every page re-fetching (and re-waiting on) auth independently.
// Uses getSession() (reads the locally persisted session) instead of
// getUser() (a network round-trip to Supabase on every call) since we just
// need to know who's signed in, not force-revalidate the token on every page.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setSession(session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSession(session ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
