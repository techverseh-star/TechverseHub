import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("SMTP not configured, skipping welcome email");
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
      subject: "Welcome to TechVerse Hub - Build Real Skills With Real Practice!",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TechVerse Hub!</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Build Real Skills With Real Practice</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #1e293b;">Hi ${userName}!</p>
            <p style="font-size: 16px; color: #475569; line-height: 1.6;">Thank you for joining TechVerse Hub! You now have access to:</p>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul style="font-size: 15px; color: #334155; line-height: 2; margin: 0; padding-left: 20px;">
                <li><strong>6 Programming Languages</strong> - Python, JavaScript, TypeScript, Java, C, C++</li>
                <li><strong>66+ Interactive Lessons</strong> - From beginner to advanced</li>
                <li><strong>180+ Practice Problems</strong> - LeetCode-style challenges</li>
                <li><strong>AI-Powered Assistance</strong> - Get help when you're stuck</li>
                <li><strong>Progress Tracking</strong> - Streaks, XP, and achievements</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${siteUrl}/dashboard" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Start Learning Now</a>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">Keep your streak alive by practicing every day!</p>
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
