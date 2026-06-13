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
  if ("name" in body) patch.name = sanitizeText(body.name, 100);
  if ("slug" in body) patch.slug = sanitizeText(body.slug, 100);
  if ("image_url" in body) patch.image_url = body.image_url || null;
  if ("sort_order" in body) patch.sort_order = parseInt(body.sort_order) || 0;
  const { data, error } = await supabaseAdmin.from("categories").update(patch).eq("id", id).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk({ category: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const { id } = await params;
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
