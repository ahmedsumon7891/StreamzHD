"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import { Upload, RefreshCw, Layers, MapPin } from "lucide-react";

interface Opt { id: string; name: string }
interface Playlist { id: string; name: string; type: string; url: string; last_imported_at: string | null }

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

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [syncResult, setSyncResult] = useState<{ total_imported: number; logs: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCats(d.categories || []));
    fetch("/api/countries").then((r) => r.json()).then((d) => setCountries(d.countries || []));
    fetchPlaylists();
  }, []);

  async function fetchPlaylists() {
    try {
      // Fetch playlists from a simple select query
      // Since playlists might not have a dedicated public API, we can fetch them via settings/channels or run a quick inline fetch if the route exists.
      // Let's call /api/settings or create a small API to list them if needed. Or just make the sync trigger query directly.
      // Wait, we can fetch them from the sync endpoint if we do a GET request, or let the sync API handle it.
      // Let's verify: we can make our sync route handle GET requests to return the playlist list!
      // This is extremely clean. Let's see: we can fetch from '/api/playlists/sync' with GET to return playlists.
      const res = await fetch("/api/playlists/sync");
      if (res.ok) {
        const d = await res.json();
        setPlaylists(d.playlists || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

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
    // Refresh playlists if last_imported dates changed
    fetchPlaylists();
  }

  async function triggerSync(playlistId?: string) {
    setSyncing(true);
    setSyncResult(null);
    try {
      const r = await fetch("/api/playlists/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlist_id: playlistId || null }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast(data?.error || "Sync failed", "error");
      } else {
        setSyncResult({
          total_imported: data.total_imported,
          logs: data.logs || []
        });
        toast(`Sync complete! Synced ${data.total_imported} channels`, "success");
        fetchPlaylists();
      }
    } catch (err) {
      toast("An unexpected error occurred during sync", "error");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Channel Import & Sync</h1>
          <p className="text-text-muted text-sm mt-1">Import channels from custom M3U files or synchronize from seeded official IPTV-org playlists.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Column: Bulk M3U Import */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold font-display">Bulk M3U Import</h2>
            
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

            <button onClick={submit} disabled={loading} className="bg-primary hover:bg-primary/90 disabled:opacity-50 px-6 py-2.5 rounded-lg font-semibold">
              {loading ? "Importing…" : "Import channels"}
            </button>
          </div>

          {result && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h3 className="font-bold text-sm">Import Results</h3>
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

        {/* Right Column: Playlist Auto-Sync */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-display">Seeded Playlists</h2>
              <button 
                onClick={() => triggerSync()} 
                disabled={syncing}
                title="Sync All Active Playlists"
                className="p-2 bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 transition"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              </button>
            </div>
            <p className="text-xs text-text-muted">
              These are verified, official playlists seeded inside your database. Synchronization downloads channels and organizes them by category or country automatically.
            </p>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="p-3 bg-bg border border-border rounded-lg flex flex-col gap-1.5 hover:border-primary/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {playlist.type === "category" ? (
                        <Layers className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-success" />
                      )}
                      <span className="text-xs font-semibold text-white/95">{playlist.name}</span>
                    </div>
                    <button 
                      onClick={() => triggerSync(playlist.id)} 
                      disabled={syncing}
                      className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/5 transition"
                    >
                      Sync
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-dim">
                    <span className="capitalize">{playlist.type}</span>
                    <span>
                      {playlist.last_imported_at 
                        ? `Synced: ${new Date(playlist.last_imported_at).toLocaleDateString()}` 
                        : "Never Synced"}
                    </span>
                  </div>
                </div>
              ))}
              {playlists.length === 0 && (
                <p className="text-xs text-text-dim text-center py-6">No playlists found. Run DB migrations to seed playlists.</p>
              )}
            </div>
          </div>

          {syncResult && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-3 max-h-[300px] overflow-hidden flex flex-col">
              <h3 className="font-bold text-sm">Sync Logs</h3>
              <div className="text-2xl font-bold text-success">{syncResult.total_imported} <span className="text-xs font-normal text-text-muted">channels processed</span></div>
              <div className="bg-bg border border-border rounded-lg p-2 font-mono text-[10px] overflow-y-auto flex-1 space-y-1">
                {syncResult.logs.map((log, index) => (
                  <div key={index} className="text-text-muted">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
