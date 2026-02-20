import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dubbingId = searchParams.get("id");

  if (!dubbingId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const response = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}`, {
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
  });

  const data = await response.json();
  console.log("ElevenLabs status response:", JSON.stringify(data, null, 2));
  return NextResponse.json(data);
}