// /api/short-form/translate-voice.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const ELEVEN_API_KEY = process.env.ELEVEN_LABS_API_KEY;

export async function POST(req: Request) {
  try {
    const { script, voiceId, language } = await req.json();
    if (!script || !voiceId || !language) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Step 1: Translate script if not English
    let translatedScript = script;
    if (language !== "en") {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Translate the following short-form video script into ${language} without changing meaning:

${script}`;

      const result = await model.generateContent(prompt);
      translatedScript = result.response.text();
    }

    // Step 2: Generate audio via Eleven Labs
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        text: translatedScript, 
        voice_settings: { stability: 0.5, similarity_boost: 0.5 } 
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.message || "Eleven Labs TTS failed");
    }

    const audioBuffer = await res.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({ audio: base64Audio });
  } catch (err: any) {
    console.error("Translate voice error:", err);
    return NextResponse.json({ error: err.message || "Translation failed" }, { status: 500 });
  }
}
