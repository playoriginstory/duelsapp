import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });

    const res = await fetch("https://api.elevenlabs.io/v1/single-use-token/realtime_scribe", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("ElevenLabs API error:", res.status, text);
      return NextResponse.json({ error: "ElevenLabs API error", detail: text }, { status: res.status });
    }

    const data = await res.json();
    console.log("Fresh token data:", data);

    return NextResponse.json({ token: data.token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Token creation error:", error);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}
