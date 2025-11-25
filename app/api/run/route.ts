import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { code, language, testInput } = await request.json();

    if (language === "javascript") {
      return await executeJavaScript(code, testInput);
    } else if (language === "python") {
      return await executePython(code, testInput);
    } else if (language === "typescript") {
      return await executeTypeScript(code, testInput);
    } else if (language === "java" || language === "c" || language === "cpp") {
      return NextResponse.json({ 
        output: `Note: ${language.toUpperCase()} code execution is not available in the browser. Your code looks ready to run locally!\n\nTo run ${language.toUpperCase()} code:\n1. Copy this code to a local file\n2. Compile and run using your local ${language.toUpperCase()} compiler` 
      });
    }

    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Execution failed" }, { status: 500 });
  }
}

async function executeJavaScript(code: string, testInput?: string) {
  try {
    const tempDir = "/tmp";
    const fileName = `code_${Date.now()}.js`;
    const filePath = path.join(tempDir, fileName);

    const wrappedCode = `
const __logs = [];
const __originalLog = console.log;
console.log = (...args) => {
  __logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

try {
${code}
${testInput ? `
const __result = typeof solution === 'function' ? solution(${testInput}) : undefined;
if (__result !== undefined) console.log(__result);
` : ''}
} catch (e) {
  console.log('Error:', e.message);
}

console.log = __originalLog;
process.stdout.write(__logs.join('\\n'));
`;

    await fs.writeFile(filePath, wrappedCode);

    try {
      const { stdout, stderr } = await execAsync(`timeout 3 node ${filePath}`, {
        maxBuffer: 1024 * 1024,
      });

      await fs.unlink(filePath);

      if (stderr && !stdout) {
        return NextResponse.json({ error: stderr });
      }

      return NextResponse.json({ output: stdout.trim() || "Code executed successfully (no output)" });
    } catch (execError: any) {
      try {
        await fs.unlink(filePath);
      } catch {}
      
      if (execError.killed) {
        return NextResponse.json({ error: "Execution timeout (3 seconds)" });
      }
      
      return NextResponse.json({ error: execError.stderr || execError.message });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}

async function executeTypeScript(code: string, testInput?: string) {
  try {
    const tempDir = "/tmp";
    const fileName = `code_${Date.now()}.ts`;
    const filePath = path.join(tempDir, fileName);
    const jsFilePath = filePath.replace('.ts', '.js');

    const wrappedCode = `
const __logs: string[] = [];
const __originalLog = console.log;
console.log = (...args: any[]) => {
  __logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

try {
${code}
${testInput ? `
const __result = typeof solution === 'function' ? solution(${testInput}) : undefined;
if (__result !== undefined) console.log(__result);
` : ''}
} catch (e: any) {
  console.log('Error:', e.message);
}

console.log = __originalLog;
process.stdout.write(__logs.join('\\n'));
`;

    await fs.writeFile(filePath, wrappedCode);

    try {
      await execAsync(`npx tsc --target ES2020 --module commonjs --esModuleInterop ${filePath} 2>&1 || true`);
      
      const { stdout, stderr } = await execAsync(`timeout 3 node ${jsFilePath}`, {
        maxBuffer: 1024 * 1024,
      });

      try {
        await fs.unlink(filePath);
        await fs.unlink(jsFilePath);
      } catch {}

      if (stderr && !stdout) {
        return NextResponse.json({ error: stderr });
      }

      return NextResponse.json({ output: stdout.trim() || "Code executed successfully (no output)" });
    } catch (execError: any) {
      try {
        await fs.unlink(filePath);
        await fs.unlink(jsFilePath);
      } catch {}
      
      if (execError.killed) {
        return NextResponse.json({ error: "Execution timeout (3 seconds)" });
      }
      
      return NextResponse.json({ error: execError.stderr || execError.message });
    }
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
${testInput ? `
if 'solution' in dir():
    print(solution(${testInput}))
` : ""}
`;

    await fs.writeFile(filePath, modifiedCode);

    try {
      const { stdout, stderr } = await execAsync(`timeout 3 python3 ${filePath}`, {
        maxBuffer: 1024 * 1024,
      });

      await fs.unlink(filePath);

      if (stderr && !stdout) {
        return NextResponse.json({ error: stderr });
      }

      return NextResponse.json({ output: stdout.trim() || "Code executed successfully (no output)" });
    } catch (execError: any) {
      try {
        await fs.unlink(filePath);
      } catch {}
      
      if (execError.killed) {
        return NextResponse.json({ error: "Execution timeout (3 seconds)" });
      }
      
      return NextResponse.json({ error: execError.stderr || execError.message });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
