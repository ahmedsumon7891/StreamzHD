"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Send } from "lucide-react";
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
  const [telegramUrl, setTelegramUrl] = useState("https://t.me/streamzhd");

  // Sync with URL query on mount/navigation
  useEffect(() => {
    if (pathname === "/search") {
      const params = new URLSearchParams(window.location.search);
      setQ(params.get("q") || "");
    } else {
      setQ("");
    }
  }, [pathname]);

  // Load Telegram URL setting
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.telegram_url) {
          setTelegramUrl(d.settings.telegram_url);
        }
      })
      .catch(() => {});
  }, []);

  function handleSearchChange(val: string) {
    setQ(val);
    const trimmed = val.trim();
    if (pathname !== "/search") {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      const params = new URLSearchParams(window.location.search);
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }
  }

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
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full bg-card/60 border border-border/80 rounded-full pl-9 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:border-primary focus:bg-card focus:outline-none transition-all duration-200"
            />
          </div>
        </form>

        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0088cc] hover:bg-[#0077b5] text-white w-9 h-9 sm:w-auto sm:h-auto px-0 sm:px-4 py-0 sm:py-2 rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#0088cc]/25 shrink-0"
          aria-label="Join Telegram"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-4 sm:w-4 fill-white shrink-0">
            <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.578.192l-8.533 7.701-.332 4.966c.487 0 .702-.223.974-.485l2.338-2.27 4.862 3.592c.896.494 1.541.239 1.764-.83l3.19-15.022c.326-1.307-.5-1.9-.136-1.576z" />
          </svg>
          <span className="hidden sm:inline">Join Telegram</span>
        </a>
      </div>
    </header>
  );
}
