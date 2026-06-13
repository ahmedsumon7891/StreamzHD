import type { Channel } from "@/types";
import { ChannelCard } from "./ChannelCard";

export function ChannelGrid({ title, channels, viewAllHref }: { title?: string; channels: Channel[]; viewAllHref?: string }) {
  if (!channels.length) return null;
  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6">
      {title && (
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">{title}</h2>
          {viewAllHref && (
            <a href={viewAllHref} className="text-sm text-primary hover:underline">View all →</a>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {channels.map((c) => <ChannelCard key={c.id} channel={c} />)}
      </div>
    </section>
  );
}
