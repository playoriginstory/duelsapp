// /app/api/short-form/generate-voice/route.ts OR pages/api/short-form/generate-voice.ts
import { NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(req: Request) {
  try {
    const { script, voiceId, language } = await req.json();

    if (!script || !voiceId) {
      return NextResponse.json({ error: "Missing script or voiceId" }, { status: 400 });
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "Eleven Labs API key not set" }, { status: 500 });
    }

    // ✅ Correct URL string
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        text: script, 
        voice_settings: { stability: 0.5, similarity_boost: 0.5 } 
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.message || "Eleven Labs TTS failed");
    }

    const audioBuffer = await res.arrayBuffer();

    // ✅ Convert ArrayBuffer to Base64 in a universal way
    let base64Audio = "";
    if (typeof Buffer !== "undefined") {
      base64Audio = Buffer.from(audioBuffer).toString("base64");
    } else {
      const binary = new Uint8Array(audioBuffer)
        .reduce((acc, byte) => acc + String.fromCharCode(byte), "");
      base64Audio = btoa(binary);
    }

    return NextResponse.json({ audio: base64Audio });

  } catch (err: any) {
    console.error("Generate voice error:", err);
    return NextResponse.json({ error: err.message || "Voice generation failed" }, { status: 500 });
  }
}
