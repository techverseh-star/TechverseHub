import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import { guardAuthedRequest } from "@/lib/api-guard";
import { fileSaveSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const guard = await guardAuthedRequest(req, {
      rateLimitPrefix: "files",
      limit: 60,
      windowMs: 60_000,
      schema: fileSaveSchema,
    });
    if (!guard.ok) return guard.response;
    const { userId, data: { file } } = guard;

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { error } = await supabase
      .from("files")
      .upsert(
        {
          user_id: userId,
          file_id: file.id,
          name: file.name,
          content: file.content,
          language: file.language,
          updated_at: new Date(),
        },
        { onConflict: "file_id" }
      );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
