import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { script, option } = await req.json();

    if (!script) {
      return NextResponse.json(
        { error: "No script provided" },
        { status: 400 }
      );
    }

    if (!option || !["A", "B", "C"].includes(option)) {
      return NextResponse.json(
        { error: "Invalid rewrite option" },
        { status: 400 }
      );
    }

    let prompt = "";

    switch (option) {
      case "A":
        prompt = `
Rewrite the following script in a HIGH-ENERGY viral short-form style.
Start with a strong hook. Make it punchy and engaging.

Script:
${script}
`;
        break;

      case "B":
        prompt = `
Rewrite the following script in a CHARACTER-DRIVEN comedic style.
Focus on humor and personality.

Script:
${script}
`;
        break;

      case "C":
        prompt = `
Rewrite the following script in an EMOTIONAL storytelling style.
Make it concise but impactful.

Script:
${script}
`;
        break;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });


    const result = await model.generateContent(prompt);
    const rewrittenText = result.response.text();

    return NextResponse.json({
      rewrite: rewrittenText?.trim() || "",
    });

  } catch (err: any) {
    console.error("Rewrite script error:", err);

    return NextResponse.json(
      {
        error: err.message || "Rewrite failed",
      },
      { status: 500 }
    );
  }
}
