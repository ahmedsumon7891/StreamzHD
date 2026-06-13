import Link from "next/link";
import { Tv } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <Link href="/" className="flex items-center gap-2 group" aria-label="StreamZ HD home">
      <span className={`${dim} rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition`}>
        <Tv className="text-white" strokeWidth={2.4} />
      </span>
      <span className={`${text} font-display font-bold tracking-tight flex items-baseline gap-1.5`}>
        StreamZ
        <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">HD</span>
      </span>
    </Link>
  );
}
