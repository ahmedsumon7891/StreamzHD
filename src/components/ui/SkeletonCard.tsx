export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="aspect-video skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton rounded w-3/4" />
        <div className="h-2.5 skeleton rounded w-1/2" />
      </div>
    </div>
  );
}
