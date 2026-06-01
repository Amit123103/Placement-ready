import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { language, code, stdin } = await req.json();

    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    // Language mapping for JDoodle
    const jdoodleLangs: Record<string, { lang: string; version: string }> = {
      javascript: { lang: "nodejs", version: "4" },
      python: { lang: "python3", version: "4" },
      java: { lang: "java", version: "4" },
      c: { lang: "c", version: "5" },
      cpp: { lang: "cpp", version: "5" },
      csharp: { lang: "csharp", version: "4" },
      r: { lang: "r", version: "4" },
      go: { lang: "go", version: "4" },
      ruby: { lang: "ruby", version: "4" },
      rust: { lang: "rust", version: "4" }
    };

    const targetLang = jdoodleLangs[language] || { lang: language, version: "0" };

    // If API keys are configured, use real JDoodle execution
    if (clientId && clientSecret) {
      const response = await fetch("https://api.jdoodle.com/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          script: code,
          language: targetLang.lang,
          versionIndex: targetLang.version,
          stdin: stdin || "",
        }),
      });

      const result = await response.json();
      
      if (result.error) {
         return NextResponse.json({ stdout: "", stderr: result.error });
      }

      // JDoodle returns output and memory/cpu. Errors are often mixed in output but sometimes it fails explicitly.
      return NextResponse.json({ 
        stdout: result.output, 
        stderr: "" 
      });
    }

    // FALLBACK: MOCK EXECUTION (If keys are not set)
    console.warn("JDOODLE_CLIENT_ID or JDOODLE_CLIENT_SECRET is missing. Using Mock Execution.");
    
    // Simulate some network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple mock logic: just echo stdin for basic test cases to simulate output
    // Or if there's an obvious syntax error keyword, simulate an error
    if (code.includes("syntax error") || code.includes("throw new Error")) {
      return NextResponse.json({ 
        stdout: "", 
        stderr: "Mock Execution Error: SyntaxError on line 3\n    at Object.<anonymous> (/app/script.js:3:1)" 
      });
    }

    return NextResponse.json({ 
      stdout: stdin ? stdin : "Mock Output: Code executed successfully. Please configure JDoodle API keys for real execution.", 
      stderr: "" 
    });

  } catch (error: any) {
    return NextResponse.json({ stdout: "", stderr: error.message }, { status: 500 });
  }
}
