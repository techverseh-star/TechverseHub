import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";
import { requestResetSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`request-reset-ip:${ip}`, 5, 15 * 60_000);
    if (!ipLimit.ok) return rateLimitResponse(ipLimit.retryAfterSec);

    const parsed = requestResetSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    const { email } = parsed.data;

    const emailLimit = rateLimit(`request-reset-email:${email}`, 5, 15 * 60_000);
    if (!emailLimit.ok) return rateLimitResponse(emailLimit.retryAfterSec);

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Find user
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find((u: { email?: string }) => u.email === email);

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Clear any outstanding tokens for this user before issuing a new one
    await supabase.from("password_resets").delete().eq("user_id", user.id);

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Save token
    await supabase.from("password_resets").insert({
      user_id: user.id,
      token,
      expires_at: expires,
    });

    const resetUrl = `${process.env.BASE_URL}/auth/reset?token=${token}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    await transporter.sendMail({
      from: `TechVerse Hub <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}" style="padding:10px 20px; background:#4F46E5; color:white; border-radius:6px; text-decoration:none;">
          Reset Password
        </a>
        <p>Link expires in 10 minutes.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Request-reset error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
