"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AgentVerticalPage() {
  const params = useParams();
  const verticalParam = params.vertical;

  const vertical =
    Array.isArray(verticalParam) ? verticalParam[0] : verticalParam || "";

  const [activeService, setActiveService] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            DUELS — {vertical.replace("-", " ").toUpperCase()} UNIT
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Deploy production capabilities or initiate a live performance session.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">

          {!activeService && (
            <div className="grid gap-4">
              <Button onClick={() => setActiveService("voiceover")}>
                Produce Voiceover
              </Button>

              <Button onClick={() => setActiveService("clone")}>
                Clone My Voice
              </Button>

              <Button onClick={() => setActiveService("live")}>
                Live Performance Session
              </Button>

              <Button onClick={() => setActiveService("translate")}>
                Deploy Translation
              </Button>
            </div>
          )}

          {activeService === "voiceover" && (
            <VoiceoverService />
          )}

          {activeService === "clone" && (
            <VoiceCloneService />
          )}

          {activeService === "live" && (
            <LiveSessionService />
          )}

          {activeService === "translate" && (
            <TranslationService />
          )}

        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- SERVICES ---------------- */

function VoiceoverService() {
  const [script, setScript] = useState("");

  const handleGenerate = () => {
    console.log("Generate voiceover for:", script);
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="border rounded p-3"
        rows={6}
        placeholder="Paste script..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />
      <Button onClick={handleGenerate}>
        Deploy Voice Production
      </Button>
    </div>
  );
}

function VoiceCloneService() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Upload high-quality voice samples to create your professional digital voice asset.
      </p>
      <input type="file" accept="audio/*" />
      <Button>
        Initiate Voice Cloning
      </Button>
    </div>
  );
}

function LiveSessionService() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Begin real-time speech analysis and performance diagnostics.
      </p>
      <Button>
        Start Live Session
      </Button>
    </div>
  );
}

function TranslationService() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Convert speech into multilingual output with real-time transcription.
      </p>
      <Button>
        Deploy Translation
      </Button>
    </div>
  );
}
