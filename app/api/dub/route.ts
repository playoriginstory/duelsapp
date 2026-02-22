import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  region: process.env.AWS_REGION!,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, target_lang, source_lang } = await req.json();

    if (!videoUrl || !target_lang) {
      return NextResponse.json(
        { error: "videoUrl and target_lang required" },
        { status: 400 }
      );
    }

    // 1️⃣ Call ElevenLabs dubbing API
    const formData = new FormData();
    formData.append("source_url", videoUrl);
    formData.append("target_lang", target_lang);
    formData.append("name", "Dubbing Job");
    formData.append("dubbing_studio", "false");

    const elevenRes = await fetch("https://api.elevenlabs.io/v1/dubbing", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
      body: formData,
    });

    const data = await elevenRes.json();
    console.log("ElevenLabs status:", elevenRes.status);
    console.log("ElevenLabs body:", JSON.stringify(data));

    if (!elevenRes.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }

    // 2️⃣ Optionally return a publicly accessible S3 URL placeholder
    const dubbedFileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/dubbed/${data.dubbing_id}.mp4`;

    return NextResponse.json({
      dubbing_id: data.dubbing_id,
      status: "processing",
      dubbedFileUrl,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Dubbing failed" }, { status: 500 });
  }
}