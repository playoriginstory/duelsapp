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

    const formData = new FormData();
    formData.append("source_url", videoUrl);
    formData.append("target_lang", target_lang);
    formData.append("name", "Dubbing Job");
    formData.append("dubbing_studio", "false");

    const response = await fetch("https://api.elevenlabs.io/v1/dubbing", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        // ⚠️ do NOT set Content-Type here — let fetch set it with the boundary
      },
      body: formData,
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