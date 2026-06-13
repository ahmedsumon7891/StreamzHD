"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Row { id: string; name: string; slug: string; is_active: boolean; is_featured: boolean; view_count: number; category?: { name: string } | null; country?: { name: string } | null; }

export default function ChannelsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/channels?limit=200${q ? `&q=${encodeURIComponent(q)}` : ""}`).then((r) => r.json());
    setRows(r.channels || []); setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function remove(id: string) {
    if (!confirm("Delete this channel?")) return;
    const r = await fetch(`/api/channels/${id}`, { method: "DELETE" });
    if (r.ok) { toast("Deleted", "success"); load(); } else toast("Failed", "error");
  }

  async function toggle(id: string, field: "is_active" | "is_featured", value: boolean) {
    await fetch(`/api/channels/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) });
    load();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold">Channels</h1>
          <p className="text-text-muted text-sm mt-1">{rows.length} loaded</p>
        </div>
        <div className="flex gap-2">
          <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="bg-card border border-border rounded-lg px-3 py-2 text-sm w-64" />
            <button className="bg-card border border-border px-4 rounded-lg text-sm">Filter</button>
          </form>
          <Link href="/admin/dashboard/channels/add" className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add
          </Link>
          <Link href="/admin/dashboard/channels/import" className="bg-card border border-border px-4 py-2 rounded-lg text-sm">M3U Import</Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg/50 text-xs uppercase text-text-dim">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Category</th><th className="text-left p-3">Country</th><th className="text-right p-3">Views</th><th className="text-center p-3">Active</th><th className="text-center p-3">Featured</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-6 text-center text-text-muted">Loading…</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-bg/50">
                <td className="p-3 font-medium">{r.name}<div className="text-xs text-text-dim">{r.slug}</div></td>
                <td className="p-3 text-text-muted">{r.category?.name || "—"}</td>
                <td className="p-3 text-text-muted">{r.country?.name || "—"}</td>
                <td className="p-3 text-right">{r.view_count.toLocaleString()}</td>
                <td className="p-3 text-center"><input type="checkbox" checked={r.is_active} onChange={(e) => toggle(r.id, "is_active", e.target.checked)} /></td>
                <td className="p-3 text-center"><input type="checkbox" checked={r.is_featured} onChange={(e) => toggle(r.id, "is_featured", e.target.checked)} /></td>
                <td className="p-3 flex justify-end gap-2">
                  <Link href={`/watch/${r.slug}`} target="_blank" className="text-xs text-text-muted hover:text-primary">View</Link>
                  <button onClick={() => remove(r.id)} className="text-error hover:opacity-80"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
