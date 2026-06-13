import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/middleware-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [totalQ, activeQ, inactiveQ, featuredQ, viewsAggQ, viewsTodayQ, viewsWeekQ, viewsMonthQ, topChannelsQ, topCatsQ, topCountriesQ] = await Promise.all([
    supabaseAdmin.from("channels").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("channels").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("channels").select("id", { count: "exact", head: true }).eq("is_active", false),
    supabaseAdmin.from("channels").select("id", { count: "exact", head: true }).eq("is_featured", true),
    supabaseAdmin.from("channels").select("view_count"),
    supabaseAdmin.from("channel_views").select("count").gte("viewed_at", today),
    supabaseAdmin.from("channel_views").select("count").gte("viewed_at", weekAgo),
    supabaseAdmin.from("channel_views").select("count").gte("viewed_at", monthAgo),
    supabaseAdmin.from("channels").select("*").order("view_count", { ascending: false }).limit(10),
    supabaseAdmin.from("categories").select("*, channels:channels(count)").order("sort_order").limit(20),
    supabaseAdmin.from("countries").select("*, channels:channels(count)").order("sort_order").limit(20),
  ]);

  if (totalQ.error) return jsonError(totalQ.error.message, 500);

  const sum = (rows: { count?: number; view_count?: number }[] | null, k: "count" | "view_count") =>
    (rows || []).reduce((a, b) => a + (Number(b[k]) || 0), 0);

  const topCategories = ((topCatsQ.data as { id: string; name: string; slug: string; channels: { count: number }[] }[]) || [])
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug, channel_count: c.channels?.[0]?.count ?? 0 }))
    .sort((a, b) => b.channel_count - a.channel_count).slice(0, 5);
  const topCountries = ((topCountriesQ.data as { id: string; name: string; code: string; channels: { count: number }[] }[]) || [])
    .map((c) => ({ id: c.id, name: c.name, code: c.code, channel_count: c.channels?.[0]?.count ?? 0 }))
    .sort((a, b) => b.channel_count - a.channel_count).slice(0, 5);

  return jsonOk({
    totalChannels: totalQ.count || 0,
    activeChannels: activeQ.count || 0,
    inactiveChannels: inactiveQ.count || 0,
    featuredChannels: featuredQ.count || 0,
    totalViews: sum(viewsAggQ.data, "view_count"),
    viewsToday: sum(viewsTodayQ.data, "count"),
    viewsThisWeek: sum(viewsWeekQ.data, "count"),
    viewsThisMonth: sum(viewsMonthQ.data, "count"),
    topChannels: topChannelsQ.data || [],
    topCategories,
    topCountries,
  });
}
