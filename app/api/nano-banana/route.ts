import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Ensure the API key is read only server-side
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("GOOGLE_API_KEY is missing!");
  throw new Error("GOOGLE_API_KEY not set in server environment");
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Increase request body size for images
export const maxDuration = 60; // optional, for timeout
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, file } = await req.json();

    if (!prompt || !file) {
      return NextResponse.json({ error: "Missing prompt or file" }, { status: 400 });
    }

    // Extract Base64 and MIME type
    const [metadata, base64Data] = file.split(",");
    const mimeType = metadata?.split(";")[0]?.split(":")[1] || "image/png";

    // Create the inlineData part
    const imagePart = { inlineData: { data: base64Data, mimeType } };

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    // Generate content with prompt + inline image
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    // Extract generated image Base64
    const parts = response.candidates?.[0]?.content?.parts;
    const generatedImageBase64 = parts?.find(p => p.inlineData?.data)?.inlineData?.data;

    if (!generatedImageBase64) {
      throw new Error("No image data returned from Nano Banana");
    }

    const imageUrl = `data:${mimeType};base64,${generatedImageBase64}`;
    return NextResponse.json({ url: imageUrl });

  } catch (err: any) {
    console.error("Nano Banana API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
