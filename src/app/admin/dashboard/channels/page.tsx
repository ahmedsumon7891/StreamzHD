"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";

interface Row { 
  id: string; 
  name: string; 
  slug: string; 
  is_active: boolean; 
  is_featured: boolean; 
  view_count: number; 
  category?: { name: string } | null; 
  country?: { name: string } | null; 
}

const ITEMS_PER_PAGE = 25;

export default function ChannelsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    const offset = (page - 1) * ITEMS_PER_PAGE;
    try {
      const res = await fetch(`/api/channels?limit=${ITEMS_PER_PAGE}&offset=${offset}${q ? `&q=${encodeURIComponent(q)}` : ""}`).then((r) => r.json());
      setRows(res.channels || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast("Failed to load channels", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (page === 1) {
      load();
    } else {
      setPage(1);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this channel?")) return;
    const r = await fetch(`/api/channels/${id}`, { method: "DELETE" });
    if (r.ok) { 
      toast("Deleted successfully", "success"); 
      load(); 
    } else {
      toast("Failed to delete", "error");
    }
  }

  async function toggle(id: string, field: "is_active" | "is_featured", value: boolean) {
    await fetch(`/api/channels/${id}`, { 
      method: "PUT", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ [field]: value }) 
    });
    // Update local state directly to prevent a full page reload jitter
    setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    toast("Updated channel setting", "success");
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Channels</h1>
          <p className="text-text-muted text-sm mt-1">
            Showing {rows.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(page * ITEMS_PER_PAGE, total)} of {total} channels
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
              <input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Search channels..." 
                className="bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm w-full sm:w-64 focus:border-primary focus:outline-none transition" 
              />
            </div>
            <button className="bg-card border border-border hover:bg-card-hover px-3.5 py-2 rounded-lg text-sm flex items-center gap-1.5 transition">
              <SlidersHorizontal className="h-3.5 w-3.5 text-text-muted" />
              <span>Filter</span>
            </button>
          </form>
          
          <Link href="/admin/dashboard/channels/add" className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
            <Plus className="h-4 w-4" /> Add
          </Link>
          <Link href="/admin/dashboard/channels/import" className="bg-card border border-border hover:bg-card-hover px-4 py-2 rounded-lg text-sm transition">M3U Import</Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-bg/40 text-xs uppercase text-text-dim border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Name / Slug</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Country</th>
                <th className="text-right p-4 font-semibold">Views</th>
                <th className="text-center p-4 font-semibold">Active</th>
                <th className="text-center p-4 font-semibold">Featured</th>
                <th className="p-4 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted">
                    <div className="inline-block animate-pulse">Loading channels...</div>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-dim font-medium">
                    No channels found matching the query.
                  </td>
                </tr>
              )}
              {!loading && rows.map((r) => (
                <tr key={r.id} className="hover:bg-bg/20 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-text">{r.name}</div>
                    <div className="text-xs text-text-dim mt-0.5">{r.slug}</div>
                  </td>
                  <td className="p-4 text-text-muted">{r.category?.name || "—"}</td>
                  <td className="p-4 text-text-muted">{r.country?.name || "—"}</td>
                  <td className="p-4 text-right tabular-nums">{r.view_count.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={r.is_active} 
                      onChange={(e) => toggle(r.id, "is_active", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-transparent cursor-pointer" 
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={r.is_featured} 
                      onChange={(e) => toggle(r.id, "is_featured", e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-transparent cursor-pointer" 
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-3.5 items-center">
                      <Link href={`/watch/${r.slug}`} target="_blank" className="text-xs text-text-muted hover:text-primary transition font-medium">View</Link>
                      <Link href={`/admin/dashboard/channels/edit/${r.id}`} className="text-text-muted hover:text-primary transition"><Pencil className="h-4 w-4" /></Link>
                      <button onClick={() => remove(r.id)} className="text-error hover:opacity-85 transition"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="bg-bg/25 border-t border-border px-4 py-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <span className="text-xs text-text-muted">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="bg-card border border-border hover:bg-card-hover disabled:opacity-40 disabled:hover:bg-card p-2 rounded-lg text-text-muted transition flex items-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Simple smart page list */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = i + 1;
                if (page > 3 && totalPages > 5) {
                  pNum = page - 3 + i;
                  if (pNum + (4 - i) > totalPages) {
                    pNum = totalPages - 4 + i;
                  }
                }
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      page === pNum 
                        ? "bg-primary border-primary text-white" 
                        : "bg-card border-border hover:bg-card-hover text-text-muted"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="bg-card border border-border hover:bg-card-hover disabled:opacity-40 disabled:hover:bg-card p-2 rounded-lg text-text-muted transition flex items-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
