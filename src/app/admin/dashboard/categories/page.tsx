"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";

interface Cat { id: string; name: string; slug: string; sort_order: number; channel_count?: number }

export default function CategoriesAdmin() {
  const [items, setItems] = useState<Cat[]>([]);
  const [name, setName] = useState(""); const [order, setOrder] = useState(0);

  async function load() { const r = await fetch("/api/categories").then((r) => r.json()); setItems(r.categories || []); }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, sort_order: order }) });
    if (r.ok) { toast("Added", "success"); setName(""); load(); } else toast("Failed", "error");
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await fetch(`/api/categories/${id}`, { method: "DELETE" }); load(); }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Categories</h1>
      <form onSubmit={add} className="bg-card border border-border rounded-xl p-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Category name" className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
        <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} placeholder="Order" className="w-24 bg-bg border border-border rounded-lg px-3 py-2 text-sm" />
        <button className="bg-primary hover:bg-primary-dark px-5 rounded-lg font-semibold text-sm">Add</button>
      </form>
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div><div className="font-medium">{c.name}</div><div className="text-xs text-text-dim">{c.slug} · {c.channel_count} channels</div></div>
            <button onClick={() => remove(c.id)} className="text-error text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
