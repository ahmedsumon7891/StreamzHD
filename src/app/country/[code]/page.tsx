import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChannelGrid } from "@/components/home/ChannelGrid";
import type { Channel, Country } from "@/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const { data } = await supabasePublic.from("countries").select("*").eq("code", code.toUpperCase()).maybeSingle();
  if (!data) return { title: "Country not found" };
  const title = `${data.name} Channels — Live HD Streaming`;
  const description = `Watch live channels from ${data.name} in HD. Free streaming on StreamZ HD.`;
  return {
    title, description, alternates: { canonical: `/country/${code}` },
    openGraph: { title, description }, twitter: { card: "summary", title, description }
  };
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data: country } = await supabasePublic.from("countries").select("*").eq("code", code.toUpperCase()).maybeSingle();
  if (!country) notFound();
  const { data: channels } = await supabasePublic
    .from("channels")
    .select("*, category:categories(name,slug), country:countries(name,code)")
    .eq("country_id", (country as Country).id)
    .eq("is_active", true)
    .order("sort_order")
    .limit(200);
  return (
    <>
      <Header />
      <main className="py-10 space-y-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-display font-bold">{country.name}</h1>
          <p className="text-text-muted mt-2">{(channels?.length || 0)} channels from {country.code}</p>
        </div>
        <ChannelGrid channels={(channels as Channel[]) || []} />
      </main>
      <Footer />
    </>
  );
}
