"use client";
import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import { Download } from "lucide-react";

interface Stats {
  totalChannels: number; activeChannels: number; inactiveChannels: number; featuredChannels: number;
  totalViews: number; viewsToday: number; viewsThisWeek: number; viewsThisMonth: number;
  topChannels: { id: string; name: string; view_count: number; slug: string }[];
  topCategories: { id: string; name: string; channel_count: number }[];
  topCountries: { id: string; name: string; code: string; channel_count: number }[];
}

export default function DashboardOverview() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setS).catch(() => undefined);
  }, []);
  if (!s) return <div className="p-10 text-text-muted">Loading…</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Overview of StreamZ HD</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/export?format=m3u" className="bg-card border border-border hover:border-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <Download className="h-4 w-4" /> Export M3U
          </a>
          <a href="/api/export?format=json" className="bg-card border border-border hover:border-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <Download className="h-4 w-4" /> Export JSON
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total channels" value={s.totalChannels} accent />
        <StatsCard label="Active" value={s.activeChannels} hint={`${s.inactiveChannels} inactive`} />
        <StatsCard label="Featured" value={s.featuredChannels} />
        <StatsCard label="Total views" value={s.totalViews} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard label="Views today" value={s.viewsToday} />
        <StatsCard label="Views this week" value={s.viewsThisWeek} />
        <StatsCard label="Views this month" value={s.viewsThisMonth} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Top channels</h3>
          <ol className="space-y-2 text-sm">
            {s.topChannels.map((c, i) => (
              <li key={c.id} className="flex justify-between"><span><span className="text-text-dim mr-2">#{i + 1}</span>{c.name}</span><span className="text-text-muted">{c.view_count.toLocaleString()}</span></li>
            ))}
            {!s.topChannels.length && <li className="text-text-dim">No data yet.</li>}
          </ol>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Top categories</h3>
          <ol className="space-y-2 text-sm">
            {s.topCategories.map((c) => (
              <li key={c.id} className="flex justify-between"><span>{c.name}</span><span className="text-text-muted">{c.channel_count}</span></li>
            ))}
          </ol>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Top countries</h3>
          <ol className="space-y-2 text-sm">
            {s.topCountries.map((c) => (
              <li key={c.id} className="flex justify-between"><span>{c.name}</span><span className="text-text-muted">{c.channel_count}</span></li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
