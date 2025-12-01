import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { token, password, checkOnly } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    // 1️⃣ Lookup token
    const { data: resetRow, error: lookupError } = await supabase
      .from("password_resets")
      .select("*")
      .eq("token", token)
      .single();

    if (lookupError || !resetRow) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 2️⃣ Check expiry
    // Ensure expires_at is treated as UTC if it doesn't have a timezone offset
    const expiresAtString = resetRow.expires_at.endsWith("Z")
      ? resetRow.expires_at
      : `${resetRow.expires_at}Z`;

    if (new Date(expiresAtString) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Token expired" },
        { status: 400 }
      );
    }

    // 3️⃣ If frontend is only checking token — return valid
    if (checkOnly) {
      return NextResponse.json({ valid: true });
    }

    // 4️⃣ If user is resetting password — validate password
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // 5️⃣ Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      resetRow.user_id,
      { password }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 6️⃣ Delete token after use
    await supabase.from("password_resets").delete().eq("token", token);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Reset-password server error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
