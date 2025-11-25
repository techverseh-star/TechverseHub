import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("SMTP not configured, skipping reset email");
      return NextResponse.json({ success: true, skipped: true });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const userName = email.split('@')[0];
    const siteUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'https://techverse-hub.replit.app';

    const mailOptions = {
      from: `"TechVerse Hub" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your TechVerse Hub Password",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #1e293b;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">We received a request to reset your password for your TechVerse Hub account.</p>
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 15px; color: #991b1b; margin: 0;">
                <strong>Important:</strong> Supabase has sent you a separate email with the actual password reset link. Please check your inbox (and spam folder) for an email from Supabase.
              </p>
            </div>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">Click the link in that email to create a new password. The link will expire in 24 hours.</p>
            <p style="font-size: 14px; color: #64748b; margin-top: 20px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/auth/login" style="background: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Back to Login</a>
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">- The TechVerse Hub Team</p>
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
