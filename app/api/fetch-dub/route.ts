import { NextRequest } from "next/server";
import { uploadToS3 } from "@/lib/s3"; // adjust import path

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dubbing_id = searchParams.get("dubbing_id");
  const target_lang = searchParams.get("target_lang");

  if (!dubbing_id || !target_lang) {
    return new Response("Missing parameters", { status: 400 });
  }

  console.log("Fetching dubbed file for:", dubbing_id, target_lang);

  // Fetch from ElevenLabs
  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/dubbing/${dubbing_id}/audio/${target_lang}`,
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! } }
  );

  if (!elevenRes.ok) {
    const errorText = await elevenRes.text();
    console.error("Audio fetch failed:", errorText);
    return new Response(errorText, { status: elevenRes.status });
  }

  // Convert to buffer
  const arrayBuffer = await elevenRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to S3 (folder "dub")
  const contentType = elevenRes.headers.get("content-type") || "audio/mpeg";
  const url = await uploadToS3(buffer, "dub", `${dubbing_id}_${target_lang}.mp4`, contentType);

  console.log("Dub uploaded to S3:", url);

  // Return public URL
  return new Response(JSON.stringify({ dubbedFileUrl: url }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}