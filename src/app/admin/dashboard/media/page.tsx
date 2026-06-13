"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "@/components/ui/Toast";

interface Media { id: string; filename: string; url: string; bucket: string; mime_type: string | null; size_bytes: number | null }

const BUCKETS = ["media", "logos", "sliders", "categories", "countries"];

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [bucket, setBucket] = useState("media");
  const [uploading, setUploading] = useState(false);

  async function load() { const r = await fetch("/api/media").then((r) => r.json()); setItems(r.media || []); }
  useEffect(() => { load(); }, []);

  async function upload(f: File) {
    setUploading(true);
    const fd = new FormData(); fd.append("file", f); fd.append("bucket", bucket);
    const r = await fetch("/api/media", { method: "POST", body: fd });
    setUploading(false);
    if (r.ok) { toast("Uploaded", "success"); load(); } else { const j = await r.json().catch(() => ({})); toast(j.error || "Failed", "error"); }
  }
  async function remove(id: string) { if (!confirm("Delete file?")) return; await fetch(`/api/media?id=${id}`, { method: "DELETE" }); load(); }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-display font-bold">Media Library</h1>
      <div className="bg-card border border-border rounded-xl p-5 flex flex-wrap gap-3 items-center">
        <select value={bucket} onChange={(e) => setBucket(e.target.value)} className="bg-bg border border-border rounded-lg px-3 py-2 text-sm">
          {BUCKETS.map((b) => <option key={b}>{b}</option>)}
        </select>
        <label className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer">
          {uploading ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        <p className="text-xs text-text-muted">JPG, PNG, WebP, SVG · max 5MB</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-lg overflow-hidden group">
            <div className="aspect-square bg-black relative">
              <Image src={m.url} alt={m.filename} fill className="object-contain p-2" sizes="200px" />
            </div>
            <div className="p-2">
              <div className="text-xs truncate" title={m.filename}>{m.filename}</div>
              <div className="flex justify-between items-center mt-1">
                <button onClick={() => navigator.clipboard.writeText(m.url).then(() => toast("URL copied", "success"))} className="text-[10px] text-primary">Copy URL</button>
                <button onClick={() => remove(m.id)} className="text-[10px] text-error">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
