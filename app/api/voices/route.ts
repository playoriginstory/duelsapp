import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  try {
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY!,
    });

    const response = await client.voices.search({
      pageSize: 20,
      includeTotalCount: false,
    });

    return NextResponse.json({
      voices: response.voices.map((v) => ({
        voice_id: v.voiceId,
        name: v.name,
        category: v.category,
        preview_url: v.previewUrl,
      })),
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 }
    );
  }
}
