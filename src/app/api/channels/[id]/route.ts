import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { isValidStreamUrl, jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("channels")
    .select("*, category:categories(*), country:countries(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("Not found", 404);
  return jsonOk({ channel: data });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid body");
  if (body.stream_url && !isValidStreamUrl(body.stream_url)) return jsonError("Invalid stream_url");

  const patch: Record<string, unknown> = {};
  for (const k of ["name", "stream_url", "logo_url", "category_id", "country_id", "language", "description", "epg_id"]) {
    if (k in body) patch[k] = typeof body[k] === "string" ? sanitizeText(body[k], 5000) : body[k];
  }
  if ("tags" in body) patch.tags = Array.isArray(body.tags) ? body.tags : null;
  if ("is_featured" in body) patch.is_featured = !!body.is_featured;
  if ("is_active" in body) patch.is_active = !!body.is_active;
  if ("sort_order" in body) patch.sort_order = parseInt(body.sort_order) || 0;

  const { data, error } = await supabaseAdmin.from("channels").update(patch).eq("id", id).select().single();
  if (error) return jsonError(error.message, 500);
  await supabaseAdmin.from("activity_logs").insert({ action: "channel.update", detail: data.name });
  return jsonOk({ channel: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const { id } = await params;
  const { error } = await supabaseAdmin.from("channels").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  await supabaseAdmin.from("activity_logs").insert({ action: "channel.delete", detail: id });
  return jsonOk({ success: true });
}
