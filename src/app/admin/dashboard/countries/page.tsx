"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";

interface Co { id: string; name: string; code: string; channel_count?: number }

export default function CountriesAdmin() {
  const [items, setItems] = useState<Co[]>([]);
  const [form, setForm] = useState({ name: "", code: "", sort_order: 0 });

  async function load() { const r = await fetch("/api/countries").then((r) => r.json()); setItems(r.countries || []); }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/countries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { toast("Added", "success"); setForm({ name: "", code: "", sort_order: 0 }); load(); } else toast("Failed", "error");
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await fetch(`/api/countries/${id}`, { method: "DELETE" }); load(); }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Countries</h1>
      <form onSubmit={add} className="bg-card border border-border rounded-xl p-4 grid grid-cols-4 gap-2">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Country" className="col-span-2 bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required placeholder="Code (ISO)" maxLength={3} className="bg-bg border border-border rounded-lg px-3 py-2 text-sm uppercase" />
        <button className="bg-primary hover:bg-primary-dark rounded-lg font-semibold text-sm">Add</button>
      </form>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div><div className="font-medium">{c.name} <span className="text-text-dim text-xs">({c.code})</span></div><div className="text-xs text-text-dim">{c.channel_count} channels</div></div>
            <button onClick={() => remove(c.id)} className="text-error text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
