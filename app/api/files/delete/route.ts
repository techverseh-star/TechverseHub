// app/api/files/delete/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import { guardAuthedRequest } from "@/lib/api-guard";
import { fileDeleteSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const guard = await guardAuthedRequest(req, {
      rateLimitPrefix: "files",
      limit: 60,
      windowMs: 60_000,
      schema: fileDeleteSchema,
    });
    if (!guard.ok) return guard.response;
    const { userId, data: { file_id } } = guard;

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { error } = await supabase
      .from("files")
      .delete()
      .eq("user_id", userId)
      .eq("file_id", file_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
