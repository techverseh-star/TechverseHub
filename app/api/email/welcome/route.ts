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
      subject: "Welcome to TechVerse Hub!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Welcome to TechVerse Hub!</h1>
          <p>Thank you for joining our interactive coding platform.</p>
          <p>Get started by exploring our lessons and practice problems:</p>
          <ul>
            <li>Interactive Python and JavaScript lessons</li>
            <li>LeetCode-style coding challenges</li>
            <li>AI-powered code assistance</li>
            <li>Track your progress and achievements</li>
          </ul>
          <p>Happy coding!</p>
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
