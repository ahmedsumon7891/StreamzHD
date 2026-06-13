import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/middleware-helpers";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const ALLOWED_BUCKETS = new Set(["logos", "sliders", "categories", "countries", "media"]);

export async function GET(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const { data, error } = await supabaseAdmin.from("media_library").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) return jsonError(error.message, 500);
  return jsonOk({ media: data });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const form = await req.formData().catch(() => null);
  if (!form) return jsonError("Invalid form data");
  const file = form.get("file") as File | null;
  const bucket = String(form.get("bucket") || "media");
  if (!file) return jsonError("file required");
  if (!ALLOWED_BUCKETS.has(bucket)) return jsonError("Invalid bucket");
  if (!ALLOWED.has(file.type)) return jsonError("Unsupported file type");
  if (file.size > 5 * 1024 * 1024) return jsonError("File too large (max 5MB)");

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabaseAdmin.storage.from(bucket).upload(filename, buffer, {
    contentType: file.type, upsert: false,
  });
  if (upErr) return jsonError(upErr.message, 500);
  const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename);

  const { data, error } = await supabaseAdmin.from("media_library").insert({
    filename, url: pub.publicUrl, bucket, size_bytes: file.size, mime_type: file.type,
  }).select().single();
  if (error) return jsonError(error.message, 500);
  return jsonOk({ media: data }, 201);
}

export async function DELETE(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return jsonError("id required");
  const { data: m } = await supabaseAdmin.from("media_library").select("*").eq("id", id).maybeSingle();
  if (!m) return jsonError("Not found", 404);
  await supabaseAdmin.storage.from(m.bucket).remove([m.filename]);
  await supabaseAdmin.from("media_library").delete().eq("id", id);
  return jsonOk({ success: true });
}
