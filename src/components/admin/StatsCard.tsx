export function StatsCard({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? "bg-primary/10 border-primary/30" : "bg-card border-border"}`}>
      <div className="text-xs uppercase tracking-wider text-text-dim font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-display font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
      {hint && <div className="text-xs text-text-muted mt-1">{hint}</div>}
    </div>
  );
}
