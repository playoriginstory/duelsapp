"use client";

import { useState } from "react";
import ClientTranscription from "./TranscriptionClient";

export default function TranscriptionPage() {
  const [mode, setMode] = useState<"client" | "server" | null>(null);
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");

  const handleUrlTranscribe = async () => {
    const res = await fetch("/api/transcription/stream-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setTranscript(data.transcript || "");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-gray-200">
      <h1 className="text-2xl font-bold text-gray-100">
        Realtime Transcription Agent
      </h1>
  
      <div className="flex gap-4">
        <button
          onClick={() => setMode("client")}
          className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
        >
          🎙 Live (Client Side)
        </button>
  
        <button
          onClick={() => setMode("server")}
          className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
        >
          🌐 Stream from URL
        </button>
      </div>
  
      {mode === "client" && <ClientTranscription />}
  
      {mode === "server" && (
        <div className="space-y-4">
          <input
            className="border border-zinc-700 bg-zinc-900 p-2 w-full rounded text-gray-200 placeholder-gray-500"
            placeholder="Paste audio stream URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
  
          <button
            onClick={handleUrlTranscribe}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700"
          >
            Start Transcription
          </button>
  
          {transcript && (
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}