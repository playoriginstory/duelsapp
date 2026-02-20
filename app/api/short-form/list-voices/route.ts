// /api/short-form/list-voices.ts
import { NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
console.log("API KEY EXISTS:", !!process.env.ELEVENLABS_API_KEY);


export async function GET() {
  try {
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "Eleven Labs API key not set" }, { status: 500 });
    }

    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.message || "Failed to fetch voices");
    }

    const data = await res.json();
    // Map to id + name
    const voices = data.voices.map((v: any) => ({ id: v.voice_id, name: v.name }));

    return NextResponse.json({ voices });
  } catch (err: any) {
    console.error("List voices error:", err);
    return NextResponse.json({ error: err.message || "Failed to list voices" }, { status: 500 });
  }
}
