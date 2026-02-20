import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { getAgentConfig } from "@/lib/agent-config";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { vertical } = await req.json();

    if (!vertical) {
      return NextResponse.json(
        { error: "Missing vertical" },
        { status: 400 }
      );
    }

    const config = getAgentConfig(vertical);

    const agent = await elevenlabs.conversationalAi.agents.create({
      name: config.name,
      tags: ["coach", vertical],
      conversationConfig: {
        tts: {
          voiceId: "aMSt68OGf4xUZAnLpTU8", // change later if needed
          modelId: "eleven_flash_v2",
        },
        agent: {
          firstMessage: config.firstMessage,
          prompt: {
            prompt: config.prompt,
          },
        },
      },
    });

    return NextResponse.json({ agentId: agent.agentId });

  } catch (error: any) {
    console.error("Agent creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
