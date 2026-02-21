// app/api/dub/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, target_lang, source_lang } = await req.json();

    if (!videoUrl || !target_lang) {
      return NextResponse.json(
        { error: "videoUrl and target_lang required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.elevenlabs.io/v1/dubbing", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_url: videoUrl,
        target_lang,
        source_lang: source_lang || "auto",
        name: "Dubbing Job",
        dubbing_studio: false,
      }),
    });

    const data = await response.json();

    console.log("ElevenLabs status:", response.status);
    console.log("ElevenLabs body:", JSON.stringify(data));

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Dubbing failed" }, { status: 500 });
  }
}