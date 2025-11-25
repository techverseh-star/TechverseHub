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
      subject: "Don't Forget Your Daily Practice!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Time to Code!</h1>
          <p>It's been a while since your last practice session on TechVerse Hub.</p>
          <p>Keep your coding skills sharp by:</p>
          <ul>
            <li>Completing a new lesson</li>
            <li>Solving a coding challenge</li>
            <li>Trying the code editor workspace</li>
          </ul>
          <p>Consistent practice leads to mastery. See you on the platform!</p>
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
