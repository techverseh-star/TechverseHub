import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { user_id } = await req.json();

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user_id);

  if (error) return NextResponse.json({ error: error.message });

  return NextResponse.json({ files: data });
}
