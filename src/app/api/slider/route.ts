import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("slider_images").select("*").order("sort_order");
  if (error) return jsonError(error.message, 500);
  return jsonOk({ slides: data });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.image_url) return jsonError("title and image_url required");
  const { data, error } = await supabaseAdmin.from("slider_images").insert({
    title: sanitizeText(body.title, 200),
    description: sanitizeText(body.description, 1000) || null,
    image_url: body.image_url,
    button_text: sanitizeText(body.button_text, 50) || null,
    button_link: sanitizeText(body.button_link, 500) || null,
    is_active: body.is_active !== false,
    sort_order: parseInt(body.sort_order) || 0,
  }).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk({ slide: data }, 201);
}
