import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchBar } from "@/components/home/SearchBar";
import { ChannelGrid } from "@/components/home/ChannelGrid";
import type { Channel } from "@/types";

export const metadata: Metadata = {
  title: "Search Channels",
  description: "Search live IPTV channels by name, language, country or tag on StreamZ HD.",
  alternates: { canonical: "/search" },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string; sort?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  let query = supabasePublic
    .from("channels")
    .select("*, category:categories(name,slug), country:countries(name,code)")
    .eq("is_active", true)
    .limit(120);
  if (q) query = query.or(`name.ilike.%${q}%,language.ilike.%${q}%,description.ilike.%${q}%`);
  if (sp.filter === "featured") query = query.eq("is_featured", true);
  if (sp.sort === "popular") query = query.order("view_count", { ascending: false });
  else if (sp.sort === "new") query = query.order("created_at", { ascending: false });
  else query = query.order("sort_order");

  const { data } = await query;
  const channels = (data as Channel[]) || [];

  return (
    <>
      <Header />
      <main className="py-10 space-y-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 space-y-6">
          <h1 className="text-4xl font-display font-bold text-center">Search</h1>
          <SearchBar initial={q} />
          <p className="text-center text-sm text-text-muted">
            {q ? <>Results for <span className="text-white font-semibold">&quot;{q}&quot;</span> — {channels.length} channels</> : `${channels.length} channels`}
          </p>
        </div>
        <ChannelGrid channels={channels} />
      </main>
      <Footer />
    </>
  );
}
