"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Newspaper, Film, Search } from "lucide-react";

const BOTTOM_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/category/sports", label: "Sports", icon: Trophy },
  { href: "/category/news", label: "News", icon: Newspaper },
  { href: "/category/movies", label: "Movies", icon: Film },
  { href: "/search", label: "Search", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-t border-border flex items-center justify-around h-16 px-2 pb-safe md:hidden shadow-lg shadow-black/80">
      {BOTTOM_NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 ${
              active ? "text-primary scale-105" : "text-text-muted hover:text-text"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : "stroke-[2]"}`} />
            <span className="text-[10px] font-medium mt-1 tracking-wide">{item.label}</span>
            {active && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
