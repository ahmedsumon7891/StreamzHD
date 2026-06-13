import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChannelGrid } from "@/components/home/ChannelGrid";
import type { Channel, Category } from "@/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabasePublic.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (!data) return { title: "Category not found" };
  const title = `${data.name} Channels — Live HD Streaming`;
  const description = `Watch ${data.name} channels live in HD. Free streaming on StreamZ HD.`;
  return { title, description, alternates: { canonical: `/category/${slug}` },
    openGraph: { title, description }, twitter: { card: "summary", title, description } };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: cat } = await supabasePublic.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (!cat) notFound();
  const { data: channels } = await supabasePublic
    .from("channels")
    .select("*, category:categories(name,slug), country:countries(name,code)")
    .eq("category_id", (cat as Category).id)
    .eq("is_active", true)
    .order("sort_order")
    .limit(200);
  return (
    <>
      <Header />
      <main className="py-10 space-y-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-display font-bold">{cat.name}</h1>
          <p className="text-text-muted mt-2">{(channels?.length || 0)} channels available</p>
        </div>
        <ChannelGrid channels={(channels as Channel[]) || []} />
      </main>
      <Footer />
    </>
  );
}
