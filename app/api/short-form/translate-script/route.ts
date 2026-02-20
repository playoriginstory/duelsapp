import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY in environment variables.");

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });
    if (!targetLanguage) return NextResponse.json({ error: "No target language provided" }, { status: 400 });

    const prompt = `
Translate the following text into ${targetLanguage}. Keep the meaning accurate and natural:

"${text}"
`;

const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
const result = await model.generateContent(prompt);
    const translated = result.response?.text?.();

    if (!translated) return NextResponse.json({ error: "Translation failed" }, { status: 500 });

    return NextResponse.json({ translated: translated.trim() });
  } catch (err: any) {
    console.error("Translation error:", err);
    return NextResponse.json({ error: err.message || "Translation failed" }, { status: 500 });
  }
}
