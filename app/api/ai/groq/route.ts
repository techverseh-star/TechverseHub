import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { task, code, language, problem, hints, solution, size, context, messages } = await request.json();

    let prompt = "";
    let model = "llama-3.3-70b-versatile";

    // Handle Chat Task separately
    if (task === "chat") {
      const systemMessage = `You are TechVerseHub AI, an expert coding assistant. You are helpful, concise, and precise.
You have access to the user's current code file.
Current Language: ${language}
Current Code:
\`\`\`${language}
${code}
\`\`\`
If the user asks you to write or edit code, provide the full code or the specific snippet in a markdown code block.
`;

      const chatMessages = [
        { role: "system", content: systemMessage },
        ...(messages || [])
      ];

      const completion = await groq.chat.completions.create({
        messages: chatMessages,
        model: model,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const reply = completion.choices[0]?.message?.content || "";
      return NextResponse.json({ response: reply });
    }

    // Handle Study Planning Task
    if (task === "study_planning") {
      const systemMessage = `You are TechVerseHub AI, a dedicated coding tutor and career mentor.
Your goal is to help the user plan their learning path, suggest projects, and provide motivation.
You are encouraging, knowledgeable, and structured.
When asked for a study plan, provide a clear, step-by-step roadmap.
When asked for advice, give practical and actionable tips.
Keep responses concise but helpful.`;

      const chatMessages = [
        { role: "system", content: systemMessage },
        ...(messages || [])
      ];

      const completion = await groq.chat.completions.create({
        messages: chatMessages,
        model: model,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const reply = completion.choices[0]?.message?.content || "";
      return NextResponse.json({ response: reply });
    }

    // Handle other tasks
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
        if (code && context) {
          prompt = `Give a helpful hint for completing this coding project. Don't reveal the full solution, just guide the user:\n\n${context}\n\nCurrent code:\n${code}`;
        } else if (size === "small") {
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
