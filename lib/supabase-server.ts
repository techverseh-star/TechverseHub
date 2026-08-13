import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Both clients below are stateless (no per-request config, no session
// persistence) and this app runs as a single long-lived Node process, so
// building a fresh client on every API call is pure waste - cache one
// instance each. Cached on `globalThis` so Next.js dev hot-reload doesn't
// spawn duplicate clients per edit (same pattern as lib/rate-limit.ts).
const globalForSupabase = globalThis as unknown as {
  __supabaseServiceClient?: SupabaseClient | null;
  __supabaseAnonClient?: SupabaseClient;
};

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
          }
        },
      },
    }
  );
}

export function createSupabaseServiceClient() {
  if (globalForSupabase.__supabaseServiceClient !== undefined) {
    return globalForSupabase.__supabaseServiceClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    globalForSupabase.__supabaseServiceClient = null;
    return null;
  }

  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  globalForSupabase.__supabaseServiceClient = client;
  return client;
}

// Verifies the bearer token sent by the client and returns the real,
// server-confirmed user id - never trust a `user_id` field taken straight
// from a request body, since that lets any caller impersonate anyone else.
export async function getVerifiedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  if (!globalForSupabase.__supabaseAnonClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    globalForSupabase.__supabaseAnonClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  const client = globalForSupabase.__supabaseAnonClient;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
