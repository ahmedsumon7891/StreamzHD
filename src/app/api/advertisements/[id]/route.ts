import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid body");
  const patch: Record<string, unknown> = {};
  if ("network_id" in body) patch.network_id = body.network_id || null;
  if ("position" in body) patch.position = sanitizeText(body.position, 100);
  if ("script_html" in body) patch.script_html = body.script_html || null;
  if ("device_target" in body && ["all", "mobile", "desktop"].includes(body.device_target)) patch.device_target = body.device_target;
  if ("is_active" in body) patch.is_active = !!body.is_active;
  if ("schedule_start" in body) patch.schedule_start = body.schedule_start || null;
  if ("schedule_end" in body) patch.schedule_end = body.schedule_end || null;
  const { data, error } = await supabaseAdmin.from("advertisements").update(patch).eq("id", id).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk({ ad: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const { id } = await params;
  const { error } = await supabaseAdmin.from("advertisements").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
