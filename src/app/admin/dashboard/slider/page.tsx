"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import type { SliderImage } from "@/types";

export default function SliderAdminPage() {
  const [items, setItems] = useState<SliderImage[]>([]);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", button_text: "Watch Live Now", button_link: "/", is_active: true, sort_order: 0 });

  async function load() {
    const r = await fetch("/api/slider").then((r) => r.json()); setItems(r.slides || []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/slider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { toast("Slide added", "success"); setForm({ ...form, title: "", description: "", image_url: "" }); load(); }
    else toast("Failed", "error");
  }

  async function remove(id: string) {
    if (!confirm("Delete slide?")) return;
    await fetch(`/api/slider/${id}`, { method: "DELETE" }); load();
  }

  const input = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm";
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-display font-bold">Hero Slider</h1>

      <form onSubmit={add} className="bg-card border border-border rounded-xl p-6 grid md:grid-cols-2 gap-4">
        <input placeholder="Title" required className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Image URL" required className={input} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <textarea placeholder="Description" className={`${input} md:col-span-2`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Button text" className={input} value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} />
        <input placeholder="Button link" className={input} value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} />
        <input type="number" placeholder="Order" className={input} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
        <button className="bg-primary hover:bg-primary-dark px-5 py-2 rounded-lg font-semibold md:col-span-2">Add slide</button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s) => (
          <div key={s.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="aspect-video bg-black bg-cover bg-center" style={{ backgroundImage: `url(${s.image_url})` }} />
            <div className="p-4">
              <div className="font-semibold">{s.title}</div>
              <div className="text-xs text-text-muted line-clamp-2 mt-1">{s.description}</div>
              <div className="flex justify-between items-center mt-3 text-xs">
                <span className={s.is_active ? "text-success" : "text-text-dim"}>{s.is_active ? "Active" : "Inactive"}</span>
                <button onClick={() => remove(s.id)} className="text-error">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
