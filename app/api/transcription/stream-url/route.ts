import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Scribe, RealtimeEvents, AudioFormat, CommitStrategy } from "@elevenlabs/client";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ELEVENLABS_API_KEY" },
        { status: 500 }
      );
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Generate a single-use token server-side
    const elevenlabs = new ElevenLabsClient({ apiKey });
    const { token } = await elevenlabs.tokens.singleUse.create("realtime_scribe");

    // Connect using the client SDK with the token
    const connection = Scribe.connect({
      token,
      modelId: "scribe_v2_realtime",
      includeTimestamps: true,
      audioFormat: AudioFormat.PCM_16000,
      sampleRate: 16000,
      commitStrategy: CommitStrategy.MANUAL,
    });

    let finalTranscript = "";

    // Wait for session to start before sending audio
    await new Promise<void>((resolve) => {
      connection.on(RealtimeEvents.SESSION_STARTED, () => resolve());
    });

    connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
      finalTranscript += data.text + " ";
    });

    connection.on(RealtimeEvents.ERROR, (err) => {
      console.error("Realtime error:", err);
    });

    // Fetch audio from URL and stream chunks into connection
    const audioRes = await fetch(url);

    if (!audioRes.ok || !audioRes.body) {
      return NextResponse.json(
        { error: `Failed to fetch audio URL: ${audioRes.status}` },
        { status: 400 }
      );
    }

    const reader = audioRes.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const base64 = Buffer.from(value).toString("base64");
      connection.send({ audioBase64: base64 });

      // Small delay to avoid overwhelming the websocket
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Signal end of audio and wait for final transcript
    connection.commit();

    await new Promise<void>((resolve) => {
      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, () => resolve());
      // Fallback timeout in case no more transcripts come
      setTimeout(resolve, 8000);
    });

    connection.close();

    return NextResponse.json({
      transcript: finalTranscript.trim(),
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Streaming failed:", message);
    return NextResponse.json({ error: "Streaming failed", detail: message }, { status: 500 });
  }
}