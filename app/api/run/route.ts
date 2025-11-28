import { NextRequest, NextResponse } from "next/server";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

// Language map for piston
const langMap: Record<string, { runtime: string; version: string }> = {
  javascript: { runtime: "javascript", version: "18.15.0" },
  typescript: { runtime: "typescript", version: "5.0.3" },
  python: { runtime: "python", version: "3.10.0" },
  python3: { runtime: "python", version: "3.10.0" },
  c: { runtime: "c", version: "10.2.0" },
  cpp: { runtime: "c++", version: "10.2.0" },
  java: { runtime: "java", version: "15.0.2" },
  go: { runtime: "go", version: "1.18.1" },
  ruby: { runtime: "ruby", version: "3.0.1" },
  php: { runtime: "php", version: "8.2.3" },
  kotlin: { runtime: "kotlin", version: "1.8.0" },
  rust: { runtime: "rust", version: "1.68.2" },
  swift: { runtime: "swift", version: "5.3.3" },
};

export async function POST(req: NextRequest) {
  try {
    const { code, language, testInput } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" });
    }

    // HTML is handled by iframe - NOT through API
    if (language === "html") {
      return NextResponse.json({
        output: "HTML is rendered directly in the browser.",
      });
    }

    const conf = langMap[language];
    if (!conf) {
      return NextResponse.json({
        error: `Unsupported language: ${language}`,
      });
    }

    // Piston API body
    const body = {
      language: conf.runtime,
      version: conf.version,
      files: [
        {
          name: `main.${getExt(language)}`,
          content: code,
        },
      ],
      stdin: testInput || "",
    };

    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json({ error: "Invalid Piston response." });
    }

    const output =
      data.run?.stdout?.trim() ||
      data.run?.output?.trim() ||
      "";

    const error =
      data.run?.stderr?.trim() ||
      data.run?.compile_output?.trim() ||
      "";

    return NextResponse.json({
      output,
      error,
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Execution failed",
    });
  }
}

// Helper: determine file extension for piston
function getExt(lang: string) {
  switch (lang) {
    case "javascript":
      return "js";
    case "typescript":
      return "ts";
    case "python":
    case "python3":
      return "py";
    case "c":
      return "c";
    case "cpp":
      return "cpp";
    case "java":
      return "java";
    case "go":
      return "go";
    case "php":
      return "php";
    case "ruby":
      return "rb";
    case "swift":
      return "swift";
    case "kotlin":
      return "kt";
    case "rust":
      return "rs";
    default:
      return "txt";
  }
}
