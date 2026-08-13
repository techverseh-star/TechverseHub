import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import { guardAuthedRequest } from "@/lib/api-guard";

export async function POST(req: Request) {
  const guard = await guardAuthedRequest(req, { rateLimitPrefix: "files", limit: 60, windowMs: 60_000 });
  if (!guard.ok) return guard.response;
  const { userId } = guard;

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ files: data });
}
