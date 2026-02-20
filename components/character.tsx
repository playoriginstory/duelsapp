"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Agent type
type Agent = {
  value: number;
  vertical: string;
  description: string;
  preview: string;
  prompt: string;
};

// Static library of agents
const AGENT_LIBRARY: Agent[] = [
  {
    value: 0,
    vertical: "short-form",
    description: "Short Form Video Coach",
    preview: "/assets/images/mediacoach.png",
    prompt:
      "A cutting-edge media coach for short form video creators. Dressed in sleek urban techwear, holographic AR glasses display analytics around them. Neon-lit studio backdrop with multiple camera drones capturing every movement. They exude energy, creativity, and cinematic flair.",
  },
  {
    value: 2,
    vertical: "transcription",
    description: "Real-Time Translation Coach",
    preview: "/assets/images/marketingcoach.png",
    prompt:
      "A visionary marketing strategist coaching in a sleek, futuristic control room. Surrounded by holographic ad campaigns, dynamic charts, and social media feeds. Outfit combines high fashion with wearable tech. Their posture and expression convey inspiration, innovation, and creative dominance.",
  },
  {
    value: 3,
    vertical: "eventproduction",
    description: "Event Production Coach",
    preview: "/assets/images/eventcoach.png",
    prompt:
      "An elite event production coach in a high-tech concert hall. Wearing smart tactical gear for stage management with LED accents, holding a holographic tablet controlling lights, sound, and visuals. Neon spotlights reflect off metallic surfaces. Energetic, precise, and hands-on with tech-driven stage mastery.",
  },
  {
    value: 5,
    vertical: "dubbing",
    description: "Dubbing Coach",
    preview: "/assets/images/writingagent.png",
    prompt:
      "A modern dubbing coach in a stylish digital library. Dressed in smart casual techwear with augmented reality glasses, floating virtual notes and storyboards surround them. Soft ambient lighting and a minimalist workspace enhance focus. They radiate wisdom, creativity, and clarity for storytelling mastery.",
  },
];

// Prompt library for random generation
const AGENT_PROMPT_LIBRARY: Record<string, string[]> = {
  "short-form": [
    "A dynamic short form video coach with AR analytics and neon studio lighting.",
    "Urban media strategist reviewing viral clips with holographic dashboards.",
    "Creative short-form mentor holding tablet, surrounded by camera drones."
  ],
  marketing: [
    "Marketing strategist guiding a team with holographic charts and social media feeds.",
    "High-energy branding coach in futuristic office, digital dashboards floating.",
    "Creative marketing mentor in sleek, minimalistic control room inspiring ideas."
  ],
  eventproduction: [
    "Stage manager controlling lights and visuals in high-tech concert hall.",
    "Event production coach in LED-lit venue holding a holographic tablet."
  ],
  writing: [
    "Modern writing mentor surrounded by floating storyboards and virtual notes.",
    "Creative writing coach in minimalist library guiding storytelling techniques."
  ],
};
export default function ServiceAgentPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>(AGENT_LIBRARY);
  const [isGenerating, setIsGenerating] = useState(false);

  // Navigate to agent vertical page
  const goToAgentPage = (vertical: string) => {
    router.push(`/agents/${vertical}`);
  };

  // Generate a new agent image via Nano Banana
  const handleGenerateNew = async (index: number) => {
    const agent = agents[index];
    if (!agent) return;

    setIsGenerating(true);

    try {
      const prompts = AGENT_PROMPT_LIBRARY[agent.vertical] || [];
      if (!prompts.length) throw new Error("No prompts available for this style");

      const randomPrompt =
        prompts[Math.floor(Math.random() * prompts.length)];

      const res = await fetch("/api/nano-banana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: randomPrompt }),
      });

      const data = await res.json();
      if (!res.ok || !data.url)
        throw new Error(data?.error || "Failed to generate agent");

      const newAgents = [...agents];
      newAgents[index] = { ...agent, preview: data.url };
      setAgents(newAgents);
    } catch (err: any) {
      console.error("Error generating new agent:", err);
      alert(err.message || "Failed to generate new agent");
    } finally {
      setIsGenerating(false);
    }
  };

  const goToVoiceoverPage = () => {
    router.push("/agents/short-form/voiceover");
  };

  const goToTranscriptionPage = () => {
    router.push("/agents/transcription");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Agents</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {agents.map((agent, index) => (
            <div
              key={agent.value}
              className="flex flex-col items-center gap-2"
            >
              {/* Clickable Card */}
              <div
                className={cn(
                  "cursor-pointer rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
                onClick={() => goToAgentPage(agent.vertical)}
              >
                <p className="text-center text-sm text-gray-500 py-1 bg-gray-100">
                  Service: {agent.description}
                </p>

                <img
                  src={agent.preview}
                  alt={agent.description}
                  className="h-48 w-48 object-cover"
                />

                <p className="p-2 text-xs text-gray-600">
                  {agent.prompt}
                </p>
              </div>

              {/* Generate New */}
              <Button
                size="sm"
                variant="outline"
                disabled={isGenerating}
                onClick={() => handleGenerateNew(index)}
              >
                {isGenerating ? "Generating..." : "Generate New"}
              </Button>

              {/* Short Form Special Button */}
              {agent.vertical === "short-form" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={goToVoiceoverPage}
                  className="mt-1"
                >
                  Voiceover Production
                </Button>
              )}

              {/* Transcription Special Button */}
              {agent.vertical === "transcription" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={goToTranscriptionPage}
                  className="mt-1"
                >
                  Enter Transcription
                </Button>
              )}

              {/* Dubbing Special Button */}
              {agent.vertical === "dubbing" && (
              <Button
              size="sm"
              variant="secondary"
              onClick={() => goToAgentPage(agent.vertical)}
              className="mt-1"
  >
    Enter Dubbing
  </Button>
)}

            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}