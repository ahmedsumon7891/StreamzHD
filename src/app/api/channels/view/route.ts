import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { clientIp, jsonError, jsonOk, rateLimit, rateLimitResponse } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  // Max 30 view-increments per IP per minute — blocks trivial inflation.
  if (!rateLimit(`view:${ip}`, 30, 60_000)) return rateLimitResponse(60);

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim().slice(0, 200) : "";
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return jsonError("Invalid slug");

  const { error } = await supabaseAdmin.rpc("increment_channel_view", { channel_slug: slug });
  if (error) return jsonError(error.message, 500);
  return jsonOk({ ok: true });
}
