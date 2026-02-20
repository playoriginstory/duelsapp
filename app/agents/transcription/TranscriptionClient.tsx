"use client";

import { useScribe } from "@elevenlabs/react";
import { useState, useCallback, useEffect } from "react"; 

// All supported languages (code and display name)
const LANGUAGES = [
  { code: "afr", label: "Afrikaans" },
  { code: "amh", label: "Amharic" },
  { code: "ara", label: "Arabic" },
  { code: "hye", label: "Armenian" },
  { code: "asm", label: "Assamese" },
  { code: "ast", label: "Asturian" },
  { code: "aze", label: "Azerbaijani" },
  { code: "bel", label: "Belarusian" },
  { code: "ben", label: "Bengali" },
  { code: "bos", label: "Bosnian" },
  { code: "bul", label: "Bulgarian" },
  { code: "mya", label: "Burmese" },
  { code: "yue", label: "Cantonese" },
  { code: "cat", label: "Catalan" },
  { code: "ceb", label: "Cebuano" },
  { code: "nya", label: "Chichewa" },
  { code: "hrv", label: "Croatian" },
  { code: "ces", label: "Czech" },
  { code: "dan", label: "Danish" },
  { code: "nld", label: "Dutch" },
  { code: "eng", label: "English" },
  { code: "est", label: "Estonian" },
  { code: "fil", label: "Filipino" },
  { code: "fin", label: "Finnish" },
  { code: "fra", label: "French" },
  { code: "ful", label: "Fulah" },
  { code: "glg", label: "Galician" },
  { code: "lug", label: "Ganda" },
  { code: "kat", label: "Georgian" },
  { code: "de", label: "German" },
  { code: "ell", label: "Greek" },
  { code: "guj", label: "Gujarati" },
  { code: "hau", label: "Hausa" },
  { code: "heb", label: "Hebrew" },
  { code: "hin", label: "Hindi" },
  { code: "hun", label: "Hungarian" },
  { code: "isl", label: "Icelandic" },
  { code: "ibo", label: "Igbo" },
  { code: "ind", label: "Indonesian" },
  { code: "gle", label: "Irish" },
  { code: "ita", label: "Italian" },
  { code: "jpn", label: "Japanese" },
  { code: "jav", label: "Javanese" },
  { code: "kea", label: "Kabuverdianu" },
  { code: "kan", label: "Kannada" },
  { code: "kaz", label: "Kazakh" },
  { code: "khm", label: "Khmer" },
  { code: "kor", label: "Korean" },
  { code: "kur", label: "Kurdish" },
  { code: "kir", label: "Kyrgyz" },
  { code: "lao", label: "Lao" },
  { code: "lav", label: "Latvian" },
  { code: "lin", label: "Lingala" },
  { code: "lit", label: "Lithuanian" },
  { code: "luo", label: "Luo" },
  { code: "ltz", label: "Luxembourgish" },
  { code: "mkd", label: "Macedonian" },
  { code: "msa", label: "Malay" },
  { code: "mal", label: "Malayalam" },
  { code: "mlt", label: "Maltese" },
  { code: "zho", label: "Mandarin Chinese" },
  { code: "mri", label: "Māori" },
  { code: "mar", label: "Marathi" },
  { code: "mon", label: "Mongolian" },
  { code: "nep", label: "Nepali" },
  { code: "nso", label: "Northern Sotho" },
  { code: "nor", label: "Norwegian" },
  { code: "oci", label: "Occitan" },
  { code: "ori", label: "Odia" },
  { code: "pus", label: "Pashto" },
  { code: "fas", label: "Persian" },
  { code: "pol", label: "Polish" },
  { code: "por", label: "Portuguese" },
  { code: "pan", label: "Punjabi" },
  { code: "ron", label: "Romanian" },
  { code: "rus", label: "Russian" },
  { code: "srp", label: "Serbian" },
  { code: "sna", label: "Shona" },
  { code: "snd", label: "Sindhi" },
  { code: "slk", label: "Slovak" },
  { code: "slv", label: "Slovenian" },
  { code: "som", label: "Somali" },
  { code: "spa", label: "Spanish" },
  { code: "swa", label: "Swahili" },
  { code: "swe", label: "Swedish" },
  { code: "tam", label: "Tamil" },
  { code: "tgk", label: "Tajik" },
  { code: "tel", label: "Telugu" },
  { code: "tha", label: "Thai" },
  { code: "tur", label: "Turkish" },
  { code: "ukr", label: "Ukrainian" },
  { code: "umb", label: "Umbundu" },
  { code: "urd", label: "Urdu" },
  { code: "uzb", label: "Uzbek" },
  { code: "vie", label: "Vietnamese" },
  { code: "cym", label: "Welsh" },
  { code: "wol", label: "Wolof" },
  { code: "xho", label: "Xhosa" },
  { code: "zul", label: "Zulu" },
];


export default function ClientTranscription() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguageCode, setTargetLanguageCode] = useState("spa"); 
  
  // Store translations: { [transcriptId]: "Translated text" }
  const [translationMap, setTranslationMap] = useState<Record<string, string>>({});

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    onError: (err) => setError(String(err)),
    onSessionStarted: () => console.log("Session started ✅"),
    // We don't need onCommittedTranscript logic here anymore,
    // we will handle it in the useEffect below.
  });

  // Helper to trigger translation via our Next.js API
  const handleTranslate = useCallback(async (text: string, id: string) => {
    // Prevent duplicate requests for the same ID
    if (translationMap[id]) return;

    try {
      // Set a temporary loading state or placeholder if desired, 
      // but here we just wait for the result.
      
      const targetLangLabel = LANGUAGES.find(l => l.code === targetLanguageCode)?.label || "English";

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: targetLangLabel }),
      });
      
      const data = await res.json();
      
      if (data.translation) {
        setTranslationMap((prev) => ({
          ...prev,
          [id]: data.translation,
        }));
      }
    } catch (err) {
      console.error("Translation failed", err);
    }
  }, [targetLanguageCode, translationMap]); // Dependencies

  // NEW: Watch for new committed transcripts and trigger translation
  useEffect(() => {
    // Get the most recent committed transcript
    const lastTranscript = scribe.committedTranscripts[scribe.committedTranscripts.length - 1];

    // If there is a transcript, and we haven't translated it yet
    if (lastTranscript && !translationMap[lastTranscript.id]) {
      handleTranslate(lastTranscript.text, lastTranscript.id);
    }
  }, [scribe.committedTranscripts, handleTranslate, translationMap]);


  const start = async () => {
    try {
      setConnecting(true);
      setError(null);
      setTranslationMap({}); // Reset translations on new session

      if (scribe.isConnected) {
        try { await scribe.disconnect(); } catch {}
        await new Promise((r) => setTimeout(r, 500));
      }

      const res = await fetch("/api/transcription/scribe-token");
      if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
      const { token } = await res.json();

      await scribe.connect({
        token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        modelId: "scribe_v2_realtime",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setConnecting(false);
    }
  };

  const stop = async () => {
    try {
      if (scribe.isConnected) await scribe.disconnect();
    } catch (err) {
      console.error("Error disconnecting Scribe:", err);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-zinc-950 min-h-screen text-gray-200 font-sans">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <div className="flex flex-col">
          <label className="text-xs text-zinc-500 mb-1">Target Language</label>
          <select
            value={targetLanguageCode}
            onChange={(e) => setTargetLanguageCode(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded p-2 text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={start}
            disabled={scribe.isConnected || connecting}
            className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 font-medium disabled:opacity-50 transition-colors"
          >
            {connecting ? "Connecting..." : "Start Session"}
          </button>

          <button
            onClick={stop}
            disabled={!scribe.isConnected}
            className="px-6 py-2 rounded bg-red-600 hover:bg-red-500 font-medium disabled:opacity-50 transition-colors"
          >
            Stop
          </button>
        </div>

        <div className="ml-auto text-sm">
          <span className={`inline-flex items-center px-3 py-1 rounded-full ${scribe.isConnected ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-zinc-800 text-zinc-400'}`}>
            {scribe.isConnected ? "● Live" : "○ Idle"}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/50 border border-red-900 text-red-200">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Original Transcription */}
        <div className="space-y-4">
          <h2 className="text-zinc-400 text-sm uppercase tracking-wider font-semibold border-b border-zinc-800 pb-2">
            Original Transcript
          </h2>
          
          <div className="min-h-[400px] bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 space-y-4 relative">
            {scribe.committedTranscripts.length === 0 && !scribe.partialTranscript && (
              <p className="text-zinc-600 italic">Waiting for speech...</p>
            )}

            {/* Render committed segments */}
            {scribe.committedTranscripts.map((t) => (
              <p key={t.id} className="text-white text-lg leading-relaxed animate-in fade-in duration-300">
                {t.text}
              </p>
            ))}

            {/* Render partial (live) segment */}
            {scribe.partialTranscript && (
              <p className="text-blue-400 text-lg leading-relaxed animate-pulse">
                {scribe.partialTranscript}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: AI Translation */}
        <div className="space-y-4">
          <h2 className="text-zinc-400 text-sm uppercase tracking-wider font-semibold border-b border-zinc-800 pb-2">
            Gemini Translation ({LANGUAGES.find(l => l.code === targetLanguageCode)?.label})
          </h2>

          <div className="min-h-[400px] bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 space-y-4">
             {scribe.committedTranscripts.length === 0 && (
              <p className="text-zinc-600 italic">Translation will appear here...</p>
            )}

            {scribe.committedTranscripts.map((t) => {
              const translatedText = translationMap[t.id];
              return (
                <div key={t.id} className="min-h-[1.75rem]">
                  {translatedText ? (
                    <p className="text-green-300 text-lg leading-relaxed animate-in fade-in slide-in-from-left-2 duration-500">
                      {translatedText}
                    </p>
                  ) : (
                    // Loading placeholder while Gemini processes
                    <div className="flex gap-1 items-center h-full pt-2">
                      <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}