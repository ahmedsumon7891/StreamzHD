"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";

const NAV = [
  { href: "/", label: "Browse" },
  { href: "/search", label: "Search" },
  { href: "/category/sports", label: "Sports" },
  { href: "/category/news", label: "News" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-6">
        <Logo size="sm" />
        
        <nav className="hidden md:flex items-center gap-8 ml-6">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`${
                  active ? "text-primary font-bold" : "text-text-muted hover:text-primary"
                } font-medium transition`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submit} className="flex-1 max-w-xs sm:max-w-md ml-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-dim" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full bg-card/60 border border-border/80 rounded-full pl-9 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-primary focus:bg-card focus:outline-none transition-all duration-200"
            />
          </div>
        </form>

        <Link href="/search" aria-label="Favorites" className="hidden sm:flex h-10 w-10 rounded-full items-center justify-center hover:bg-card transition">
          <Heart className="h-5 w-5 text-text-muted" />
        </Link>
      </div>
    </header>
  );
}
