import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// It's generally good practice to initialize the client once globally
// if it's going to be reused across multiple requests or functions
// within the same execution context (like a serverless function warm start).
// However, ensure your API key is properly loaded.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_FALLBACK');

export async function POST(req: Request) {
  try {
    const { script } = await req.json();

    if (!script) {
      return NextResponse.json({ error: "Script is required" }, { status: 400 });
    }

    // Get the Generative Model instance using the globally initialized genAI client
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    // Again, double-check the model name in Google's official documentation for flash models,
    // e.g., 'gemini-1.5-flash-latest' if that's what you intend to use.
    // For text-only analysis, 'gemini-pro' is a common and capable choice.

    const prompt = `
Analyze this short-form video script. Provide:
1. Hook Strength (1-10 + explanation)
2. Clarity & Structure
3. Emotional Engagement
4. Retention Risks
5. CTA Effectiveness
6. Specific Rewrite Suggestions

Script:
${script}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text(); // Get the text from the response

    return NextResponse.json({ analysis: text });
  } catch (err: any) {
    console.error("Analyze script error:", err);
    return NextResponse.json(
      { error: err.message || "Analysis failed" },
      { status: 500 }
    );
  }
}