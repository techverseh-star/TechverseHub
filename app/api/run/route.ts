import { NextRequest, NextResponse } from "next/server";
import { NodeVM } from "vm2";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { code, language, testInput } = await request.json();

    if (language === "javascript") {
      return executeJavaScript(code, testInput);
    } else if (language === "python") {
      return await executePython(code, testInput);
    }

    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Execution failed" }, { status: 500 });
  }
}

function executeJavaScript(code: string, testInput?: string) {
  try {
    const vm = new NodeVM({
      timeout: 3000,
      console: "redirect",
    });

    let output = "";
    const modifiedCode = `
      ${code}
      ${testInput ? `console.log(solution(${testInput}));` : ""}
    `;

    const result = vm.run(modifiedCode);
    
    output = result || "Code executed successfully";

    return NextResponse.json({ output });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}

async function executePython(code: string, testInput?: string) {
  try {
    const tempDir = "/tmp";
    const fileName = `code_${Date.now()}.py`;
    const filePath = path.join(tempDir, fileName);

    const modifiedCode = `
${code}
${testInput ? `\nprint(solution(${testInput}))` : ""}
    `;

    await fs.writeFile(filePath, modifiedCode);

    try {
      const { stdout, stderr } = await execAsync(`timeout 3 python3 ${filePath}`, {
        maxBuffer: 1024 * 1024,
      });

      await fs.unlink(filePath);

      if (stderr) {
        return NextResponse.json({ error: stderr });
      }

      return NextResponse.json({ output: stdout.trim() });
    } catch (execError: any) {
      await fs.unlink(filePath);
      
      if (execError.killed) {
        return NextResponse.json({ error: "Execution timeout (3 seconds)" });
      }
      
      return NextResponse.json({ error: execError.stderr || execError.message });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
