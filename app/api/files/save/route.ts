import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id, file } = await req.json();

    if (!user_id) return NextResponse.json({ error: "Missing user" });

    const { error } = await supabase
      .from("files")
      .upsert(
        {
          user_id,
          file_id: file.id,
          name: file.name,
          content: file.content,
          language: file.language,
          updated_at: new Date(),
        },
        { onConflict: "file_id" }
      );

    if (error) return NextResponse.json({ error: error.message });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
