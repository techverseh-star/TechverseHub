import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password" },
        { status: 400 }
      );
    }

    // 1️⃣ Lookup token in DB
    const { data, error: tokenError } = await supabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .single();

    if (tokenError || !data) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 2️⃣ Check expiry
    const expired = new Date(data.expires_at) < new Date();
    if (expired) {
      return NextResponse.json(
        { error: "Token expired. Please request a new reset link." },
        { status: 400 }
      );
    }

    // 3️⃣ Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.user_id,
      {
        password: password,
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 4️⃣ Delete used token (prevent reuse)
    await supabase.from("password_resets").delete().eq("token", token);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Server error while resetting password" },
      { status: 500 }
    );
  }
}
