"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: "square" | "banner" | "card";
}

export default function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  label = "Photo",
  aspectRatio = "card",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const heightClass = aspectRatio === "square" ? "h-32" : aspectRatio === "banner" ? "h-20" : "h-28";

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiBase}/uploads`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("homezy_admin_token") || ""}`,
        },
      });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      onChange(json.fileUrl || json.url || "");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  }, [uploadFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const applyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlMode(false);
    }
  };

  if (value) {
    return (
      <div className={`relative ${heightClass} w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm group`}>
        <img src={value} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-bold hover:bg-white transition flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" /> Replace
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> Uploaded
          </span>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  if (urlMode) {
    return (
      <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Paste Image URL</p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 border bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
          />
          <button
            type="button"
            onClick={applyUrl}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
          >
            Use URL
          </button>
        </div>
        <button type="button" onClick={() => setUrlMode(false)} className="text-[10px] text-slate-400 hover:text-slate-600 underline">
          ← Back to file upload
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`${heightClass} w-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition bg-slate-50`}
      onClick={() => inputRef.current?.click()}
    >
      {uploading ? (
        <>
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          <span className="text-xs text-emerald-600 font-medium">Uploading to R2...</span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-slate-400" />
            <Upload className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xs text-slate-500 font-medium">Drop image or <span className="text-emerald-600 font-bold">click to browse</span></span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setUrlMode(true); }}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-600 transition"
          >
            <LinkIcon className="w-3 h-3" /> Paste URL instead
          </button>
        </>
      )}
      {error && <p className="text-[10px] text-rose-600 font-medium">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
