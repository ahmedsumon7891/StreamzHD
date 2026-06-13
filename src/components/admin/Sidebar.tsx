"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  LayoutDashboard, Radio, Image as ImageIcon, Layers, Globe, Megaphone, FolderOpen,
  Calendar, Settings, LogOut, Upload, PlusCircle,
} from "lucide-react";

const NAV: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/channels", label: "Channels", icon: Radio },
  { href: "/admin/dashboard/channels/add", label: "Add Channel", icon: PlusCircle },
  { href: "/admin/dashboard/channels/import", label: "M3U Import", icon: Upload },
  { href: "/admin/dashboard/slider", label: "Hero Slider", icon: ImageIcon },
  { href: "/admin/dashboard/categories", label: "Categories", icon: Layers },
  { href: "/admin/dashboard/countries", label: "Countries", icon: Globe },
  { href: "/admin/dashboard/advertisements", label: "Advertisements", icon: Megaphone },
  { href: "/admin/dashboard/media", label: "Media Library", icon: FolderOpen },
  { href: "/admin/dashboard/epg", label: "EPG Sources", icon: Calendar },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await supabaseBrowser.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-border min-h-screen flex flex-col">
      <div className="p-5 border-b border-border"><Logo size="sm" /></div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active ? "bg-primary text-white font-semibold" : "text-text-muted hover:text-white hover:bg-card"
              }`}>
              <Icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-error hover:bg-card transition">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </aside>
  );
}
