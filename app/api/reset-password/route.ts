import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { ok, retryAfterSec } = rateLimit(`reset-password:${ip}`, 10, 60_000);
    if (!ok) return rateLimitResponse(retryAfterSec);

    const parsed = resetPasswordSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }
    const { token, password, checkOnly } = parsed.data;

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
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
    // Ensure expires_at is treated as UTC if it doesn't have a timezone
    // indicator. PostgREST can return timestamptz either Z-suffixed or in
    // +00:00 offset notation - the old `endsWith("Z")` check treated the
    // offset form as "missing" and appended a Z, producing an unparseable
    // string like "...+00:00Z" (Invalid Date), which made expiry checks
    // silently always pass. Detect any timezone indicator, not just "Z".
    const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(resetRow.expires_at);
    const expiresAtString = hasTimezone ? resetRow.expires_at : `${resetRow.expires_at}Z`;
    const expiresAt = new Date(expiresAtString);

    if (isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
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
