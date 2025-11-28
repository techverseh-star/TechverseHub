// lib/auth.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// returns full user, or null
export async function getLoggedUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}
