import { NextResponse } from "next/server";

const languageVersions: Record<string, string> = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  cpp: "10.2.0",
  c: "10.2.0",
  ruby: "3.0.1",
  go: "1.16.2",
  rust: "1.68.2",
};

export async function POST(req: Request) {
  try {
    const { code, language, run } = await req.json();

    const version = languageVersions[language] || "*";

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        version,
        files: [
          {
            content: code,
          },
        ],
        run,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      output: data.run?.output || data.compile?.output || "",
      error: data.run?.stderr || data.compile?.stderr || "",
    });
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
