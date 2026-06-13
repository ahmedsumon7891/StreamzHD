"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import { Upload } from "lucide-react";

interface Opt { id: string; name: string }

export default function M3UImportPage() {
  const [importSource, setImportSource] = useState<"text" | "url">("text");
  const [m3u, setM3u] = useState("");
  const [m3uUrl, setM3uUrl] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [cats, setCats] = useState<Opt[]>([]);
  const [countries, setCountries] = useState<Opt[]>([]);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCats(d.categories || []));
    fetch("/api/countries").then((r) => r.json()).then((d) => setCountries(d.countries || []));
  }, []);

  async function handleFile(f: File) {
    const text = await f.text(); setM3u(text);
  }

  async function submit() {
    const isUrl = importSource === "url";
    if (isUrl && !m3uUrl.trim()) return toast("Please enter an M3U URL", "error");
    if (!isUrl && !m3u.trim()) return toast("Paste or upload an M3U", "error");

    setLoading(true); setResult(null);
    const r = await fetch("/api/channels/import", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isUrl ? { url: m3uUrl } : { m3u }),
        category_id: category || null,
        country_id: country || null,
      }),
    });
    setLoading(false);
    if (!r.ok) {
      const errorData = await r.json().catch(() => null);
      toast(errorData?.error || "Import failed", "error");
      return;
    }
    const j = await r.json();
    setResult(j); toast(`Imported ${j.imported} channels`, "success");
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Bulk M3U Import</h1>
      <p className="text-text-muted text-sm">Import channels by uploading/pasting M3U content or supplying a remote M3U URL. Channels are upserted by slug.</p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        {/* Tab Selector */}
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => setImportSource("text")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              importSource === "text"
                ? "border-primary text-text font-bold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            File / Text Paste
          </button>
          <button
            onClick={() => setImportSource("url")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              importSource === "url"
                ? "border-primary text-text font-bold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Import from URL
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="block text-xs uppercase tracking-wider text-text-dim mb-1.5">Default category</span>
            <select className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">— from playlist group-title —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block"><span className="block text-xs uppercase tracking-wider text-text-dim mb-1.5">Default country</span>
            <select className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">— none —</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>

        {importSource === "text" ? (
          <>
            <label className="flex items-center gap-3 cursor-pointer bg-bg border border-dashed border-border rounded-lg px-4 py-6 hover:border-primary transition">
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-sm">Upload .m3u file</span>
              <input type="file" accept=".m3u,.m3u8,text/plain" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>

            <textarea
              value={m3u} onChange={(e) => setM3u(e.target.value)}
              placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-id=&quot;id&quot; tvg-logo=&quot;logo&quot; group-title=&quot;News&quot;,Channel Name&#10;https://stream.example.com/playlist.m3u8"
              className="w-full bg-bg border border-border rounded-lg p-3 text-xs font-mono h-72"
            />
          </>
        ) : (
          <div className="space-y-2">
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-text-dim mb-1.5">M3U Playlist URL</span>
              <input
                type="url"
                value={m3uUrl}
                onChange={(e) => setM3uUrl(e.target.value)}
                placeholder="https://example.com/playlist.m3u"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm"
              />
            </label>
            <p className="text-xs text-text-dim">Make sure the URL is public and returns a raw M3U format text.</p>
          </div>
        )}

        <button onClick={submit} disabled={loading} className="bg-primary hover:bg-primary-dark disabled:opacity-50 px-6 py-2.5 rounded-lg font-semibold">
          {loading ? "Importing…" : "Import channels"}
        </button>
      </div>

      {result && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex gap-6">
            <div><div className="text-3xl font-bold text-success">{result.imported}</div><div className="text-xs uppercase text-text-dim">Imported</div></div>
            <div><div className="text-3xl font-bold text-warning">{result.skipped}</div><div className="text-xs uppercase text-text-dim">Skipped</div></div>
          </div>
          {result.errors.length > 0 && (
            <details><summary className="cursor-pointer text-sm text-text-muted">View {result.errors.length} warning(s)</summary>
              <ul className="mt-2 text-xs text-text-muted space-y-1 max-h-64 overflow-y-auto">
                {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
