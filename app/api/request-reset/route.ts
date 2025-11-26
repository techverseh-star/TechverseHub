import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Check user
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json({ ok: true }); // Do NOT reveal existence
    }

    // Create token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store token
    await supabase.from("password_resets").insert({
      user_id: user.id,
      token,
      expires_at: expires,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset?token=${token}`;

    // Email transport
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
