import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { isValidStreamUrl, jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";
import { uniqueSlug } from "@/lib/slugify";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(parseInt(sp.get("limit") || "50"), 500);
  const offset = parseInt(sp.get("offset") || "0");
  const search = sp.get("q") || "";
  const onlyInactive = sp.get("inactive") === "1";

  let q = supabaseAdmin
    .from("channels")
    .select("*, category:categories(name,slug), country:countries(name,code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (search) q = q.ilike("name", `%${search}%`);
  if (onlyInactive) q = q.eq("is_active", false);

  const { data, count, error } = await q;
  if (error) return jsonError(error.message, 500);
  return jsonOk({ channels: data, total: count || 0 });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.stream_url) return jsonError("name and stream_url required");
  if (!isValidStreamUrl(body.stream_url)) return jsonError("Invalid stream_url");

  const name = sanitizeText(body.name, 200);
  const slug = await uniqueSlug(name, supabaseAdmin);

  const row = {
    name,
    slug,
    stream_url: body.stream_url,
    logo_url: body.logo_url || null,
    category_id: body.category_id || null,
    country_id: body.country_id || null,
    language: sanitizeText(body.language, 50) || null,
    description: sanitizeText(body.description, 5000) || null,
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 30) : null,
    is_featured: !!body.is_featured,
    is_active: body.is_active !== false,
    epg_id: body.epg_id || null,
    sort_order: parseInt(body.sort_order) || 0,
  };

  const { data, error } = await supabaseAdmin.from("channels").insert(row).select().single();
  if (error) return jsonError(error.message, 500);
  await supabaseAdmin.from("activity_logs").insert({ action: "channel.create", detail: name });
  return jsonOk({ channel: data }, 201);
}
