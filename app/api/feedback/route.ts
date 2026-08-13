import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";
import { feedbackSchema, escapeHtml } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const { ok, retryAfterSec } = rateLimit(`feedback:${ip}`, 5, 60_000);
        if (!ok) return rateLimitResponse(retryAfterSec);

        const parsed = feedbackSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || "Message and rating are required" },
                { status: 400 }
            );
        }
        const { subject, message, rating, email, userId } = parsed.data;

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

        const userLabel = email
            ? `${escapeHtml(email)} (${escapeHtml(userId || "Unknown ID")})`
            : "Anonymous User";
        // Strip CR/LF specifically for the header value (not HTML-escaped -
        // that would show literal "&amp;" etc. in the recipient's subject line).
        const subjectLine = subject ? `Feedback: ${subject.replace(/[\r\n]+/g, " ")}` : "New Feedback Received";
        const safeSubject = subject ? escapeHtml(subject) : "";
        const safeMessage = escapeHtml(message);

        const mailOptions = {
            from: `"TechVerse Hub Feedback" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to admin (same as sender for now, or configurable)
            ...(email ? { replyTo: email } : {}),
            subject: subjectLine,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">New Feedback Received</h2>
          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 6px;">
            <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${userLabel}</p>
            <p style="margin: 0 0 8px 0;"><strong>Rating:</strong> ${"⭐".repeat(rating)} (${rating}/5)</p>
            ${safeSubject ? `<p style="margin: 0;"><strong>Subject:</strong> ${safeSubject}</p>` : ""}
          </div>
          <div style="margin-top: 20px;">
            <h3 style="color: #334155; font-size: 16px;">Message:</h3>
            <p style="white-space: pre-wrap; color: #475569; line-height: 1.5;">${safeMessage}</p>
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
