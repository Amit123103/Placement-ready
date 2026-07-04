import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { language, code, stdin } = await req.json();

    // Map language IDs from the frontend to Piston API language names and versions
    const pistonLangs: Record<string, { lang: string; version: string }> = {
      javascript: { lang: "javascript", version: "18.15.0" },
      python: { lang: "python", version: "3.10.0" },
      java: { lang: "java", version: "15.0.2" },
      c: { lang: "c", version: "10.2.0" },
      cpp: { lang: "cpp", version: "10.2.0" },
      csharp: { lang: "csharp", version: "6.12.0" },
      r: { lang: "r", version: "4.1.1" },
      go: { lang: "go", version: "1.16.2" },
      ruby: { lang: "ruby", version: "3.0.1" },
      rust: { lang: "rust", version: "1.68.2" }
    };

    const targetLang = pistonLangs[language];

    if (!targetLang) {
      return NextResponse.json({ stdout: "", stderr: `Unsupported language: ${language}` });
    }

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: targetLang.lang,
        version: targetLang.version,
        files: [
          {
            content: code
          }
        ],
        stdin: stdin || "",
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ stdout: "", stderr: result.message || "Failed to execute code on Piston API" });
    }

    if (result.compile && result.compile.code !== 0) {
      // Compilation error
      return NextResponse.json({
        stdout: "",
        stderr: result.compile.output
      });
    }

    // Execution success or runtime error
    return NextResponse.json({ 
      stdout: result.run.stdout, 
      stderr: result.run.stderr 
    });

  } catch (error: any) {
    return NextResponse.json({ stdout: "", stderr: error.message }, { status: 500 });
  }
}
