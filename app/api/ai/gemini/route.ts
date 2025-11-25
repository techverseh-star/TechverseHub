import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { task, content, topic } = await request.json();

    let prompt = "";

    switch (task) {
      case "lesson_explain":
        prompt = `Explain this lesson in simple terms for beginners:\n\n${content}`;
        break;

      case "simplify_concept":
        prompt = `Simplify this programming concept for a beginner:\n\n${topic}`;
        break;

      case "generate_quiz":
        prompt = `Generate 3 quiz questions about this topic:\n\n${content}`;
        break;

      case "study_helper":
        prompt = `Help me understand this programming concept:\n\n${topic}`;
        break;

      default:
        return NextResponse.json({ error: "Invalid task" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: error.message || "AI request failed" },
      { status: 500 }
    );
  }
}
