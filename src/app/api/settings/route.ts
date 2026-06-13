import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("settings").select("*");
  if (error) return jsonError(error.message, 500);
  const map: Record<string, string | null> = {};
  for (const r of data || []) map[r.key] = r.value;
  return jsonOk({ settings: map });
}

export async function PUT(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("Invalid body");
  const rows = Object.entries(body).map(([k, v]) => ({
    key: sanitizeText(k, 100), value: v == null ? null : String(v), updated_at: new Date().toISOString(),
  }));
  const { error } = await supabaseAdmin.from("settings").upsert(rows, { onConflict: "key" });
  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
