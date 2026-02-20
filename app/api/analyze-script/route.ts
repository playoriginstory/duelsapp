import { NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { script } = await req.json();

    if (!script) {
      return NextResponse.json(
        { error: "No script provided" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
You are a high-end creator performance consultant.

Analyze the following script and provide:

1. Hook Strength (score 1-10 + explanation)
2. Clarity & Structure
3. Emotional Engagement
4. Retention Risks
5. CTA Effectiveness
6. Specific Rewrite Suggestions

Be structured and concise.

Script:
${script}
`,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MEDIUM, // Use string instead of ThinkingLevel enum
        },
      },
    });

    const analysis = response.text ?? "No analysis generated.";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Gemini analysis error:", error);

    return NextResponse.json(
      { error: "Script analysis failed" },
      { status: 500 }
    );
  }
}
