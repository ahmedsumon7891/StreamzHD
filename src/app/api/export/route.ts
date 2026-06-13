import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/middleware-helpers";
import { toM3U } from "@/lib/m3u-parser";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const format = (req.nextUrl.searchParams.get("format") || "json").toLowerCase();

  const { data, error } = await supabaseAdmin
    .from("channels")
    .select("*, category:categories(name), country:countries(name,code)")
    .eq("is_active", true)
    .order("name");
  if (error) return jsonError(error.message, 500);

  if (format === "m3u") {
    const text = toM3U(data || []);
    return new Response(text, {
      headers: {
        "Content-Type": "application/x-mpegurl",
        "Content-Disposition": 'attachment; filename="streamz-hd.m3u"',
      },
    });
  }

  return new Response(JSON.stringify({ channels: data }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="streamz-hd.json"',
    },
  });
}
