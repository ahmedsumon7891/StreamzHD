"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";

interface Opt { id: string; name: string }

export default function EditChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [cats, setCats] = useState<Opt[]>([]);
  const [countries, setCountries] = useState<Opt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "", stream_url: "", logo_url: "", category_id: "", country_id: "",
    language: "", description: "", tags: "", is_featured: false, is_active: true, epg_id: "",
  });

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCats(d.categories || []));
    fetch("/api/countries").then((r) => r.json()).then((d) => setCountries(d.countries || []));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/channels/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setLoading(false);
        if (d.channel) {
          setForm({
            name: d.channel.name || "",
            stream_url: d.channel.stream_url || "",
            logo_url: d.channel.logo_url || "",
            category_id: d.channel.category_id || "",
            country_id: d.channel.country_id || "",
            language: d.channel.language || "",
            description: d.channel.description || "",
            tags: d.channel.tags ? d.channel.tags.join(", ") : "",
            is_featured: !!d.channel.is_featured,
            is_active: !!d.channel.is_active,
            epg_id: d.channel.epg_id || "",
          });
        } else {
          toast("Channel not found", "error");
          router.push("/admin/dashboard/channels");
        }
      })
      .catch(() => {
        setLoading(false);
        toast("Failed to load channel details", "error");
      });
  }, [id, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const body = { ...form, tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean) };
    const r = await fetch(`/api/channels/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSubmitting(false);
    if (r.ok) { toast("Channel updated", "success"); router.push("/admin/dashboard/channels"); }
    else { const j = await r.json().catch(() => ({})); toast(j.error || "Failed", "error"); }
  }

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm((p) => ({ ...p, [k]: v })); }
  const input = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none";

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading channel details...</div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-6">Edit Channel</h1>
      <form onSubmit={submit} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Field label="Name *"><input className={input} required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Stream URL (m3u8 / mp4) *"><input className={input} required value={form.stream_url} onChange={(e) => set("stream_url", e.target.value)} /></Field>
        <Field label="Logo URL"><input className={input} value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><select className={input} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}><option value="">— none —</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Country"><select className={input} value={form.country_id} onChange={(e) => set("country_id", e.target.value)}><option value="">— none —</option>{countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Language"><input className={input} value={form.language} onChange={(e) => set("language", e.target.value)} /></Field>
          <Field label="EPG ID"><input className={input} value={form.epg_id} onChange={(e) => set("epg_id", e.target.value)} /></Field>
        </div>
        <Field label="Description"><textarea className={input} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Tags (comma separated)"><input className={input} value={form.tags} onChange={(e) => set("tags", e.target.value)} /></Field>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured</label>
        </div>
        <div className="flex gap-3">
          <button disabled={submitting} className="bg-primary hover:bg-primary-dark disabled:opacity-50 px-6 py-2.5 rounded-lg font-semibold">{submitting ? "Saving…" : "Save Changes"}</button>
          <button type="button" onClick={() => router.push("/admin/dashboard/channels")} className="bg-card border border-border px-6 py-2.5 rounded-lg text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs uppercase tracking-wider text-text-dim mb-1.5">{label}</span>{children}</label>;
}
