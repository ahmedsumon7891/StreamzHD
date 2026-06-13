import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function GET() {
  const [ads, networks] = await Promise.all([
    supabaseAdmin.from("advertisements").select("*, network:ad_networks(name)").order("created_at", { ascending: false }),
    supabaseAdmin.from("ad_networks").select("*").order("name"),
  ]);
  if (ads.error) return jsonError(ads.error.message, 500);
  return jsonOk({ ads: ads.data, networks: networks.data || [] });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const body = await req.json().catch(() => null);
  if (!body?.position) return jsonError("position required");
  const { data, error } = await supabaseAdmin.from("advertisements").insert({
    network_id: body.network_id || null,
    position: sanitizeText(body.position, 100),
    script_html: body.script_html || null,
    device_target: ["all", "mobile", "desktop"].includes(body.device_target) ? body.device_target : "all",
    is_active: body.is_active !== false,
    schedule_start: body.schedule_start || null,
    schedule_end: body.schedule_end || null,
  }).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk({ ad: data }, 201);
}
