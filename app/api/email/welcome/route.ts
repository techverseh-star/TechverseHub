import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to TechVerse Hub!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Welcome to TechVerse Hub!</h1>
          </div>
          <p style="font-size: 16px; color: #333;">Thank you for joining our interactive coding platform.</p>
          <p style="font-size: 16px; color: #333;">Get started by exploring our features:</p>
          <ul style="font-size: 16px; color: #333; line-height: 1.8;">
            <li>Interactive Python and JavaScript lessons</li>
            <li>LeetCode-style coding challenges</li>
            <li>AI-powered code assistance</li>
            <li>Track your progress and achievements</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Start Learning</a>
          </div>
          <p style="color: #666; font-size: 14px;">Happy coding!</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">- The TechVerse Hub Team</p>
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
