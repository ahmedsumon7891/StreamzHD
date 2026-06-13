"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import type { EpgSource } from "@/types";

export default function EpgAdmin() {
  const [items, setItems] = useState<EpgSource[]>([]);
  const [form, setForm] = useState({ name: "", url: "", is_active: true });

  async function load() { const r = await fetch("/api/epg").then((r) => r.json()); setItems(r.sources || []); }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/epg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { toast("Added", "success"); setForm({ name: "", url: "", is_active: true }); load(); } else toast("Failed", "error");
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await fetch(`/api/epg?id=${id}`, { method: "DELETE" }); load(); }

  const input = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm";
  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <h1 className="text-3xl font-display font-bold">EPG Sources</h1>
      <p className="text-text-muted text-sm">Store XMLTV / EPG URLs here for future integration.</p>
      <form onSubmit={add} className="bg-card border border-border rounded-xl p-4 grid gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Source name" className={input} />
        <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required placeholder="https://.../epg.xml" className={input} />
        <button className="bg-primary hover:bg-primary-dark rounded-lg font-semibold text-sm py-2">Add source</button>
      </form>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {items.map((s) => (
          <div key={s.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0"><div className="font-medium">{s.name}</div><div className="text-xs text-text-muted truncate">{s.url}</div></div>
            <button onClick={() => remove(s.id)} className="text-error text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
