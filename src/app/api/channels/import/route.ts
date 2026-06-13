import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { isValidStreamUrl, jsonError, jsonOk, sanitizeText } from "@/lib/middleware-helpers";
import { parseM3U } from "@/lib/m3u-parser";
import { generateSlug } from "@/lib/slugify";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try { await requireAdmin(req); } catch (r) { return r as Response; }
  const body = await req.json().catch(() => null);
  let text = typeof body?.m3u === "string" ? body.m3u : "";
  const url = typeof body?.url === "string" ? body.url : "";

  if (url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return jsonError("Invalid URL schema. Must start with http or https");
    }
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        return jsonError(`Failed to fetch M3U from URL: Status ${response.status} ${response.statusText}`);
      }
      text = await response.text();
    } catch (err) {
      console.error("Error fetching M3U from URL:", err);
      return jsonError(err instanceof Error ? err.message : "Failed to fetch M3U from the URL");
    }
  }

  if (!text) return jsonError("Provide m3u text or a URL");
  const parsed = parseM3U(text);
  const errors: string[] = [];
  const seen = new Set<string>();

  // Resolve categories dynamically if no default category is chosen
  const defaultCategoryId: string | null = body?.category_id || null;
  const defaultCountryId: string | null = body?.country_id || null;
  const catMap = new Map<string, string>();

  try {
    const { data: existingCats } = await supabaseAdmin.from("categories").select("id, name, slug");
    if (existingCats) {
      for (const c of existingCats) {
        catMap.set(c.slug, c.id);
        catMap.set(c.name.toLowerCase(), c.id);
      }
    }

    if (!defaultCategoryId) {
      const missingGroupNames = new Set<string>();
      for (const c of parsed) {
        if (!c.name || !c.streamUrl || !c.group) continue;
        const groupName = c.group.trim();
        if (!groupName) continue;
        const slug = generateSlug(groupName);
        if (slug && !catMap.has(slug) && !catMap.has(groupName.toLowerCase())) {
          missingGroupNames.add(groupName);
        }
      }

      if (missingGroupNames.size > 0) {
        const newCatsPayload = Array.from(missingGroupNames).map((name) => ({
          name,
          slug: generateSlug(name) || `cat-${Math.random().toString(36).slice(2, 8)}`,
          sort_order: 0,
        }));
        const { data: createdCats, error: createError } = await supabaseAdmin
          .from("categories")
          .insert(newCatsPayload)
          .select("id, name, slug");
        if (createError) {
          errors.push(`Category creation warning: ${createError.message}`);
        } else if (createdCats) {
          for (const c of createdCats) {
            catMap.set(c.slug, c.id);
            catMap.set(c.name.toLowerCase(), c.id);
          }
        }
      }
    }
  } catch (err) {
    errors.push(`Category matching error: ${err instanceof Error ? err.message : String(err)}`);
  }

  const rows = parsed
    .filter((c) => {
      if (!c.name || !c.streamUrl) { errors.push(`Skipped: missing name/url for "${c.name}"`); return false; }
      if (!isValidStreamUrl(c.streamUrl)) { errors.push(`Skipped: invalid url for "${c.name}"`); return false; }
      const base = generateSlug(c.name) || `ch-${Math.random().toString(36).slice(2, 8)}`;
      let slug = base; let i = 1;
      while (seen.has(slug)) { i += 1; slug = `${base}-${i}`; }
      seen.add(slug);
      c.slug = slug;
      return true;
    })
    .map((c) => {
      let categoryId = defaultCategoryId;
      if (!categoryId && c.group) {
        const groupName = c.group.trim();
        const slug = generateSlug(groupName);
        categoryId = catMap.get(slug) || catMap.get(groupName.toLowerCase()) || null;
      }
      return {
        name: sanitizeText(c.name, 200),
        slug: c.slug,
        stream_url: c.streamUrl,
        logo_url: c.logo || null,
        epg_id: c.epgId || null,
        language: c.tvgLanguage || null,
        category_id: categoryId,
        country_id: defaultCountryId,
        is_active: true,
      };
    });

  if (rows.length === 0) return jsonOk({ imported: 0, skipped: parsed.length, errors });

  let imported = 0;
  let skipped = 0;
  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { data, error } = await supabaseAdmin
      .from("channels")
      .upsert(chunk, { onConflict: "slug", ignoreDuplicates: false })
      .select("id");
    if (error) { errors.push(error.message); skipped += chunk.length; continue; }
    imported += data?.length || 0;
  }
  await supabaseAdmin.from("activity_logs").insert({ action: "channels.import", detail: `Imported ${imported} of ${rows.length}` });
  return jsonOk({ imported, skipped, errors: errors.slice(0, 50) });
}
