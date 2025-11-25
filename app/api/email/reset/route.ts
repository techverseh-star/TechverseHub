import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your TechVerse Hub Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Password Reset Request</h1>
          <p>We received a request to reset your password for TechVerse Hub.</p>
          <p>Check your Supabase dashboard for the password reset link sent by Supabase.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="color: #666; font-size: 12px;">- The TechVerse Hub Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: error.message || "Email failed to send" },
      { status: 500 }
    );
  }
}
