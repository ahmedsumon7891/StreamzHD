import type { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
  const out: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];

  try {
    const [{ data: channels }, { data: cats }, { data: countries }] = await Promise.all([
      supabasePublic.from("channels").select("slug, updated_at").eq("is_active", true).limit(50000),
      supabasePublic.from("categories").select("slug"),
      supabasePublic.from("countries").select("code"),
    ]);
    for (const c of channels || []) {
      out.push({ url: `${base}/watch/${c.slug}`, lastModified: c.updated_at, changeFrequency: "daily" });
    }
    for (const c of cats || []) {
      out.push({ url: `${base}/category/${c.slug}`, changeFrequency: "weekly" });
    }
    for (const c of countries || []) {
      out.push({ url: `${base}/country/${c.code}`, changeFrequency: "weekly" });
    }
  } catch {
    // Supabase not configured at build time — fall back to base entries.
  }

  return out;
}
