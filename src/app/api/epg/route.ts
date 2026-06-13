import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("epg_sources").select("*").order("created_at", { ascending: false });
  if (error) return jsonError(error.message, 500);
  return jsonOk({ sources: data });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.url) return jsonError("name and url required");
  const { data, error } = await supabaseAdmin.from("epg_sources").insert({
    name: sanitizeText(body.name, 200),
    url: body.url,
    is_active: body.is_active !== false,
  }).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk({ source: data }, 201);
}

export async function DELETE(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return jsonError("id required");
  const { error } = await supabaseAdmin.from("epg_sources").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
