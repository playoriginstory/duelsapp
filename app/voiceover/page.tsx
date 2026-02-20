"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Voice {
  id: string;
  name: string;
}

interface RewriteOption {
  label: string;
  text: string;
}

interface CharacterLine {
  character: string;
  text: string;
  voiceId: string;
  audio?: string | null;
}

export default function VoiceoverProductionPage() {
  const [originalScript, setOriginalScript] = useState(""); // keeps the raw input
  const [script, setScript] = useState("");                 // textarea value
  const [analysis, setAnalysis] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [rewrites, setRewrites] = useState<RewriteOption[]>([]);
  const [selectedText, setSelectedText] = useState("");     // for voice generation
  const [characterLines, setCharacterLines] = useState<CharacterLine[]>([]);

  /* =========================
     FETCH VOICES
  ========================== */
  useEffect(() => {
    fetch("/api/short-form/list-voices")
      .then((res) => res.json())
      .then((data) => setVoices(data.voices || []))
      .catch((err) => console.error("Failed to load voices:", err));
  }, []);

  /* =========================
     ANALYZE SCRIPT
  ========================== */
  const handleAnalyze = async () => {
    if (!script) return alert("Please enter a script first.");

    setLoading(true);
    setAnalysis("");
    setRewrites([]);
    setSelectedText("");
    setCharacterLines([]);

    try {
      const res = await fetch("/api/short-form/analyze-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      const data = await res.json();

      setAnalysis(data.analysis || "");
      setOriginalScript(script);

      const apiRewrites: RewriteOption[] =
        data.rewrites && data.rewrites.length
          ? data.rewrites
          : [
              { label: "A", text: script },
              { label: "B", text: script },
              { label: "C", text: script },
            ];
      setRewrites(apiRewrites);

      setSelectedText(script);

      // Split script into character lines if provided
      const lines: CharacterLine[] = script
        .split("\n")
        .map((l) => {
          const parts = l.split(":");
          if (parts.length >= 2) {
            return { character: parts[0].trim(), text: parts.slice(1).join(":").trim(), voiceId: "" };
          }
          return null;
        })
        .filter((l): l is CharacterLine => l !== null);
      setCharacterLines(lines);

    } catch (err) {
      console.error(err);
      alert("Failed to analyze script");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HANDLE REWRITE A/B/C
  ========================== */
  const handleRewrite = async (option: string) => {
    if (!originalScript) return alert("Enter a script first.");
    setLoading(true);

    try {
      const res = await fetch("/api/short-form/rewrite-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: originalScript, option }),
      });

      const data = await res.json();

      if (!data.rewrite) {
        alert("No rewrite returned");
        return;
      }

      // Update or add this rewrite
      setRewrites((prev) => {
        const filtered = prev.filter((r) => r.label !== option);
        return [...filtered, { label: option, text: data.rewrite }];
      });
    } catch (err) {
      console.error("Rewrite failed:", err);
      alert("Rewrite failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GENERATE VOICE FOR LINE
  ========================== */
  const handleGenerateLine = async (lineIndex: number) => {
    const line = characterLines[lineIndex];
    if (!line.voiceId) return alert("Select a voice for this character first.");
    setLoading(true);

    try {
      const res = await fetch("/api/short-form/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: line.text, voiceId: line.voiceId }),
      });
      const data = await res.json();
      if (data.audio) {
        setCharacterLines((prev) => {
          const updated = [...prev];
          updated[lineIndex].audio = `data:audio/mp3;base64,${data.audio}`;
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate voice for this line");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Voiceover Production</h1>

      {/* SCRIPT INPUT */}
      <textarea
        className="w-full border p-3 rounded"
        rows={6}
        placeholder="Paste your script (Character: line)..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      <Button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Script"}
      </Button>

      {/* AGENT FEEDBACK + REWRITE OPTIONS */}
      {analysis && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Agent Feedback</h2>
          <p className="text-sm whitespace-pre-wrap">{analysis}</p>
          <div className="flex space-x-2 mt-2">
            <Button onClick={() => handleRewrite("A")} disabled={loading}>
              Option A
            </Button>
            <Button onClick={() => handleRewrite("B")} disabled={loading}>
              Option B
            </Button>
            <Button onClick={() => handleRewrite("C")} disabled={loading}>
              Option C
            </Button>
          </div>
        </div>
      )}

      {/* SELECT ORIGINAL OR REWRITE */}
      {rewrites.length > 0 && (
        <div className="border p-4 rounded bg-gray-100 space-y-4 mt-2">
          <h3 className="font-semibold">Choose Version</h3>

          {/* Original */}
          <div>
            <h4 className="font-medium">Original Script</h4>
            <Button onClick={() => setSelectedText(originalScript)} className="mt-1">
              Use Original
            </Button>
          </div>

          {/* Rewrites */}
          {rewrites.map((r) => (
            <div key={r.label}>
              <h4 className="font-medium">Rewrite Option {r.label}</h4>
              <p className="whitespace-pre-wrap text-sm">{r.text}</p>
              <Button onClick={() => setSelectedText(r.text)} className="mt-1">
                Use Rewrite {r.label}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* CHARACTER LINES + VOICE GENERATION */}
      {characterLines.length > 0 && (
        <div className="space-y-4 mt-4">
          <h3 className="font-semibold">Character Lines</h3>
          {characterLines.map((line, idx) => (
            <div key={idx} className="border p-2 rounded space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{line.character}:</span>
                <select
                  value={line.voiceId}
                  onChange={(e) =>
                    setCharacterLines((prev) => {
                      const updated = [...prev];
                      updated[idx].voiceId = e.target.value;
                      return updated;
                    })
                  }
                  className="border p-1 rounded flex-1"
                >
                  <option value="">Select Voice</option>
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <Button onClick={() => handleGenerateLine(idx)} disabled={loading || !line.voiceId}>
                  {loading ? "Generating..." : "Generate Voice"}
                </Button>
              </div>
              {line.audio && (
                <audio controls className="w-full mt-1">
                  <source src={line.audio} type="audio/mp3" />
                </audio>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
