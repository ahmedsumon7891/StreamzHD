import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  if (!slug) return jsonError("Slug is required", 400);

  const { data, error } = await supabaseAdmin
    .from("channels")
    .select("stream_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return jsonError("Channel stream not found", 404);
  }

  return jsonOk({ streamUrl: data.stream_url });
}
