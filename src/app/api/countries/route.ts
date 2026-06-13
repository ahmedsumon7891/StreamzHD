import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("countries")
    .select("*, channels:channels(count)")
    .order("sort_order");
  if (error) return jsonError(error.message, 500);
  const out = (data || []).map((c: { channels: { count: number }[] } & Record<string, unknown>) => ({
    ...c, channel_count: c.channels?.[0]?.count ?? 0,
  }));
  return jsonOk({ countries: out });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.code) return jsonError("name and code required");
  const { data, error } = await supabaseAdmin.from("countries").insert({
    name: sanitizeText(body.name, 100),
    code: sanitizeText(body.code, 5).toUpperCase(),
    image_url: body.image_url || null,
    sort_order: parseInt(body.sort_order) || 0,
  }).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk({ country: data }, 201);
}
