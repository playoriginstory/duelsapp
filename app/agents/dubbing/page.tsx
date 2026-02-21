"use client";

import { useState } from "react";

export default function DubbingAgent() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [fileSizeMB, setFileSizeMB] = useState<number | null>(null);

  const MAX_VIDEO_DURATION_SEC = 600;

  const LANGUAGES = [
    { code: "en", name: "English" }, { code: "hi", name: "Hindi" },
    { code: "pt", name: "Portuguese" }, { code: "zh", name: "Chinese" },
    { code: "es", name: "Spanish" }, { code: "fr", name: "French" },
    { code: "de", name: "German" }, { code: "ja", name: "Japanese" },
    { code: "ar", name: "Arabic" }, { code: "ru", name: "Russian" },
    { code: "ko", name: "Korean" }, { code: "id", name: "Indonesian" },
    { code: "it", name: "Italian" }, { code: "nl", name: "Dutch" },
    { code: "tr", name: "Turkish" }, { code: "pl", name: "Polish" },
    { code: "sv", name: "Swedish" }, { code: "fil", name: "Filipino" },
    { code: "ms", name: "Malay" }, { code: "ro", name: "Romanian" },
    { code: "uk", name: "Ukrainian" }, { code: "el", name: "Greek" },
    { code: "cs", name: "Czech" }, { code: "da", name: "Danish" },
    { code: "fi", name: "Finnish" }, { code: "bg", name: "Bulgarian" },
    { code: "hr", name: "Croatian" }, { code: "sk", name: "Slovak" },
    { code: "ta", name: "Tamil" },
  ];

  const getVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve, reject) => {
      if (!file.type.startsWith("video/")) return resolve(0);
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration); };
      video.onerror = () => reject("Cannot read video metadata");
      video.src = url;
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const sizeMB = selectedFile.size / (1024 * 1024);
    setFileSizeMB(sizeMB);

    if (!selectedFile.type.startsWith("audio/") && !selectedFile.type.startsWith("video/")) {
      alert("Unsupported file type.");
      return;
    }

    if (selectedFile.type.startsWith("video/")) {
      try {
        const duration = await getVideoDuration(selectedFile);
        if (duration > MAX_VIDEO_DURATION_SEC) {
          alert(`Video too long. Max ${MAX_VIDEO_DURATION_SEC / 60} minutes.`);
          return;
        }
      } catch {
        alert("Failed to read video duration");
        return;
      }
    }

    setFile(selectedFile);
  };

  const pollStatus = (id: string, key: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/dub-status?id=${id}`);
        const data = await res.json();
        setStatus(data);

        if (data.status === "processing") {
          setProgress((prev) => (prev >= 90 ? prev : prev + 10));
        }

        if (data.status === "dubbed" || data.status === "failed") {
          clearInterval(interval);
          if (data.status === "dubbed") setProgress(100);

          // cleanup S3 file
          try {
            await fetch("/api/delete-file", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key }),
            });
          } catch (err) {
            console.error("S3 cleanup failed:", err);
          }

          if (data.status === "failed") alert("Dubbing failed");
        }
      } catch (err) {
        console.error("Polling failed:", err);
        clearInterval(interval);
      }
    }, 5000);

    return interval;
  };

  const handleSubmit = async () => {
    if (!file) { alert("Upload a file first"); return; }

    setLoading(true);
    setProgress(0);
    setStatus(null);
    setResult(null);

    try {
      // 1️⃣ Get presigned S3 URL
      const presignRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, fileUrl, key } = await presignRes.json();

      // 2️⃣ Upload file with progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error("S3 upload failed"));
        xhr.onerror = () => reject(new Error("S3 upload error"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3️⃣ Call dubbing API
      const dubRes = await fetch("/api/dub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: fileUrl,
          target_lang: targetLang,
          source_lang: "auto",
        }),
      });
      
      console.log("DUB response status:", dubRes.status);
      console.log("DUB response ok:", dubRes.ok);
      
      const data = await dubRes.json().catch((e) => {
        console.error("Failed to parse JSON:", e);
        return null;
      });
      
      console.log("DUB response data:", data);
      
      if (!data?.dubbing_id) {
        throw new Error("Dubbing failed — missing dubbing_id");
      }
      
      setResult(data);

      // 4️⃣ Start polling with S3 key
      const fileKey = key || fileUrl.split("/").pop()!;
      pollStatus(data.dubbing_id, fileKey);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Dubbing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-500">Dubbing Agent</h1>

      <input
        type="file"
        accept="audio/*,video/*"
        onChange={handleFileChange}
        className="border border-gray-300 p-2 rounded w-full text-gray-500"
      />

      {fileSizeMB && (
        <p className="text-sm text-gray-500">File size: {fileSizeMB.toFixed(1)} MB</p>
      )}

      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full text-gray-500"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded w-full transition"
      >
        {loading
          ? progress < 100
            ? `Uploading... ${progress}%`
            : "Processing..."
          : "Dub File"}
      </button>

      {result && (
        <div className="mt-4 p-4 border border-gray-300 rounded space-y-2 text-gray-600 bg-gray-100 shadow-sm">
          <p><strong>Dubbing ID:</strong> {result.dubbing_id}</p>
          {status && <p><strong>Progress:</strong> {progress}%</p>}
          {progress > 0 && progress < 100 && (
            <div className="w-full bg-gray-300 rounded h-2 mt-1">
              <div className="bg-gray-500 h-2 rounded transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      {status?.status === "dubbed" && result?.dubbing_id && (
        <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Dubbed Video</h2>
          <video
            controls
            className="w-full mt-2 rounded"
            src={`/api/fetch-dub?dubbing_id=${result.dubbing_id}&target_lang=${targetLang}`}
          />
          <a
            href={`/api/fetch-dub?dubbing_id=${result.dubbing_id}&target_lang=${targetLang}`}
            download={`dubbed_${targetLang}.mp4`}
            className="mt-3 inline-block bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded transition"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}