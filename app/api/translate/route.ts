import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No API Key" }, { status: 500 });
  }

  // --- DEBUGGING STEP: List available models ---
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    if (listData.error) {
      console.error("❌ API KEY ERROR:", listData.error.message);
      return NextResponse.json({ error: listData.error.message }, { status: 500 });
    }

    const availableModels = listData.models?.map((m: any) => m.name) || [];
    console.log("------------------------------------------------");
    console.log("✅ YOUR AVAILABLE MODELS:");
    console.log(availableModels.join("\n"));
    console.log("------------------------------------------------");
    
  } catch (err) {
    console.error("Failed to list models:", err);
  }
  // ---------------------------------------------

  try {
    const { text, targetLanguage } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We try the most standard model first. 
    // If this fails, look at your terminal logs to see the correct name.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Translate to ${targetLanguage}: "${text}"`;
    const result = await model.generateContent(prompt);
    const translation = result.response.text().trim();

    return NextResponse.json({ translation });
  } catch (error: any) {
    console.error("❌ TRANSLATE ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}