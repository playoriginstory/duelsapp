import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: "Missing text or voiceId" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      return NextResponse.json(
        { error: "Voice generation failed" },
        { status: 500 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    return NextResponse.json({
      audio: base64Audio,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Voice generation failed" },
      { status: 500 }
    );
  }
}
