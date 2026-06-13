import { TrendingUp } from "lucide-react";
import type { Channel } from "@/types";

export function BreakingNewsTicker({ channels }: { channels: Channel[] }) {
  if (!channels.length) return null;
  const items = [...channels, ...channels]; // duplicate for seamless loop
  return (
    <div className="bg-gradient-to-r from-card to-transparent border-y border-border overflow-hidden">
      <div className="flex items-stretch">
        <div className="bg-primary text-black px-5 flex items-center gap-2 flex-shrink-0 z-10 shadow-lg shadow-primary/30">
          <TrendingUp className="h-4 w-4 stroke-[2.5]" />
          <span className="text-xs font-black tracking-wider uppercase whitespace-nowrap">Trending Feeds</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex animate-marquee whitespace-nowrap py-3">
            {items.map((c, i) => (
              <div key={`${c.id}-${i}`} className="flex items-center gap-2 px-6 text-sm">
                <span className="text-primary font-bold text-lg">•</span>
                <span className="text-text-muted font-bold tracking-wider text-xs">NOW BROADCASTING:</span>
                <span className="font-bold text-white">{c.name}</span>
                {c.language && <span className="text-text-dim text-xs">({c.language})</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
