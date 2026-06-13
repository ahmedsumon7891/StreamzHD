import slugifyLib from "slugify";
import type { SupabaseClient } from "@supabase/supabase-js";

export function generateSlug(name: string): string {
  return slugifyLib(name, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug(
  name: string,
  supabase: SupabaseClient,
  table = "channels",
  excludeId?: string,
): Promise<string> {
  const base = generateSlug(name) || "item";
  let candidate = base;
  let i = 1;
  // Try up to 100 variants
  while (i < 100) {
    let query = supabase.from(table).select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;
    i += 1;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}
