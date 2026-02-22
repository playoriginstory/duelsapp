import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dubbing_id = searchParams.get("dubbing_id");
  const target_lang = searchParams.get("target_lang");

  if (!dubbing_id || !target_lang)
    return new Response("Missing parameters", { status: 400 });

  console.log("Fetching audio for:", dubbing_id, target_lang);

  const elevenRes = await fetch(
    `https://api.elevenlabs.io/v1/dubbing/${dubbing_id}/audio/${target_lang}`,
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! } }
  );

  if (!elevenRes.ok) {
    const errorText = await elevenRes.text();
    console.error("Audio fetch failed:", errorText);
    return new Response(errorText, { status: elevenRes.status });
  }

  const contentType = elevenRes.headers.get("content-type") || "audio/mpeg";

  return new Response(elevenRes.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}