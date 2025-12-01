import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { subject, message, rating, email, userId } = await req.json();

        if (!message || !rating) {
            return NextResponse.json(
                { error: "Message and rating are required" },
                { status: 400 }
            );
        }

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("SMTP not configured, skipping feedback email");
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

        const userLabel = email ? `${email} (${userId || 'Unknown ID'})` : "Anonymous User";
        const subjectLine = subject ? `Feedback: ${subject}` : "New Feedback Received";

        const mailOptions = {
            from: `"TechVerse Hub Feedback" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to admin (same as sender for now, or configurable)
            replyTo: email,
            subject: subjectLine,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">New Feedback Received</h2>
          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 6px;">
            <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${userLabel}</p>
            <p style="margin: 0 0 8px 0;"><strong>Rating:</strong> ${"⭐".repeat(rating)} (${rating}/5)</p>
            ${subject ? `<p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>` : ""}
          </div>
          <div style="margin-top: 20px;">
            <h3 style="color: #334155; font-size: 16px;">Message:</h3>
            <p style="white-space: pre-wrap; color: #475569; line-height: 1.5;">${message}</p>
          </div>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Feedback error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to send feedback" },
            { status: 500 }
        );
    }
}
