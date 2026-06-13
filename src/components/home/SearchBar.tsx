"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className="relative max-w-2xl mx-auto"
    >
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-text-dim" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
        placeholder="Search channels, tags, languages..."
        className="w-full bg-card border border-border rounded-full pl-14 pr-6 py-4 text-base focus:border-primary focus:outline-none"
      />
    </form>
  );
}
