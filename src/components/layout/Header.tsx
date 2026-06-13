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
  const [open, setOpen] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center gap-6">
        <Logo />
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
        <form onSubmit={submit} className="flex-1 max-w-xl ml-auto hidden sm:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search channels, tags, languages..."
              className="w-full bg-card border border-border rounded-full pl-11 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </form>
        <Link href="/search" aria-label="Favorites" className="hidden sm:flex h-10 w-10 rounded-full items-center justify-center hover:bg-card transition">
          <Heart className="h-5 w-5 text-text-muted" />
        </Link>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border px-4 py-4 space-y-3">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block py-2 text-text-muted hover:text-primary" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <form onSubmit={submit}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full bg-card border border-border rounded-full px-4 py-2 text-sm"
            />
          </form>
        </div>
      )}
    </header>
  );
}
