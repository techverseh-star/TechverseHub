import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { task, code, language, problem, hints, solution, size } = await request.json();

    let prompt = "";
    let model = "llama-3.3-70b-versatile";

    switch (task) {
      case "code_explain":
        prompt = `Explain this ${language} code in simple terms:\n\n${code}`;
        break;

      case "code_debug":
        prompt = `Debug this ${language} code and explain any issues:\n\n${code}`;
        break;

      case "code_refactor":
        prompt = `Refactor this ${language} code to make it more efficient and readable:\n\n${code}\n\nProvide the refactored code and explain the improvements.`;
        break;

      case "practice_hint":
        if (size === "small") {
          prompt = `Give a small hint for this coding problem (don't reveal the solution):\n\n${problem}\n\nAvailable hints: ${hints}`;
        } else {
          prompt = `Give a bigger hint for this coding problem (still don't reveal the full solution):\n\n${problem}\n\nAvailable hints: ${hints}`;
        }
        break;

      case "practice_solution":
        prompt = `Explain the solution to this coding problem:\n\n${problem}\n\nSolution: ${solution}`;
        break;

      default:
        return NextResponse.json({ error: "Invalid task" }, { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content || "";

    let extractedCode = "";
    if (task === "code_refactor") {
      const codeMatch = response.match(/```(?:javascript|python)?\n([\s\S]*?)\n```/);
      if (codeMatch) {
        extractedCode = codeMatch[1];
      }
    }

    return NextResponse.json({ 
      response,
      code: extractedCode,
    });
  } catch (error: any) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: error.message || "AI request failed" },
      { status: 500 }
    );
  }
}
