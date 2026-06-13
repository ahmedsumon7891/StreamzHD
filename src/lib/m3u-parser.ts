import { generateSlug } from "./slugify";
import type { ParsedM3UChannel } from "@/types";

const EXTINF_RE = /#EXTINF:-?\d+(?:\.\d+)?\s*(.*?),(.*)$/i;
const ATTR_RE = /([a-zA-Z0-9_-]+)="([^"]*)"/g;

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(raw)) !== null) {
    out[m[1].toLowerCase()] = m[2];
  }
  return out;
}

export function parseM3U(text: string): ParsedM3UChannel[] {
  const lines = text.split(/\r?\n/);
  const channels: ParsedM3UChannel[] = [];
  let pending: { name: string; logo: string; group: string; epgId: string; lang: string } | null =
    null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#EXTM3U")) continue;

    if (line.startsWith("#EXTINF")) {
      const m = line.match(EXTINF_RE);
      if (!m) {
        pending = null;
        continue;
      }
      const attrs = parseAttrs(m[1] || "");
      const name = (attrs["tvg-name"] || m[2] || "").trim();
      pending = {
        name,
        logo: attrs["tvg-logo"] || "",
        group: attrs["group-title"] || "",
        epgId: attrs["tvg-id"] || "",
        lang: attrs["tvg-language"] || "",
      };
      continue;
    }

    if (line.startsWith("#")) continue;

    if (pending && (line.startsWith("http://") || line.startsWith("https://"))) {
      channels.push({
        name: pending.name,
        logo: pending.logo,
        group: pending.group,
        epgId: pending.epgId,
        streamUrl: line,
        slug: generateSlug(pending.name),
        tvgLanguage: pending.lang || undefined,
      });
      pending = null;
    }
  }
  return channels;
}

export function toM3U(
  channels: Array<{
    name: string;
    stream_url: string;
    logo_url?: string | null;
    epg_id?: string | null;
    category?: { name: string } | null;
    language?: string | null;
  }>,
): string {
  const lines = ["#EXTM3U"];
  for (const c of channels) {
    const attrs: string[] = [];
    if (c.epg_id) attrs.push(`tvg-id="${escapeAttr(c.epg_id)}"`);
    attrs.push(`tvg-name="${escapeAttr(c.name)}"`);
    if (c.logo_url) attrs.push(`tvg-logo="${escapeAttr(c.logo_url)}"`);
    if (c.category?.name) attrs.push(`group-title="${escapeAttr(c.category.name)}"`);
    if (c.language) attrs.push(`tvg-language="${escapeAttr(c.language)}"`);
    lines.push(`#EXTINF:-1 ${attrs.join(" ")},${c.name}`);
    lines.push(c.stream_url);
  }
  return lines.join("\n");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "'");
}
