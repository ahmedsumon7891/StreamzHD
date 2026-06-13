export interface Channel {
  id: string;
  name: string;
  slug: string;
  stream_url: string;
  logo_url: string | null;
  category_id: string | null;
  country_id: string | null;
  language: string | null;
  description: string | null;
  tags: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  sort_order: number;
  epg_id: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  country?: Country | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  channel_count?: number;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  channel_count?: number;
}

export interface SliderImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface AdNetwork {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Advertisement {
  id: string;
  network_id: string | null;
  position: string;
  script_html: string | null;
  device_target: "all" | "mobile" | "desktop";
  is_active: boolean;
  schedule_start: string | null;
  schedule_end: string | null;
  created_at: string;
}

export interface EpgSource {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  last_fetched: string | null;
  created_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  bucket: string;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string | null;
  updated_at: string;
}

export interface ParsedM3UChannel {
  name: string;
  logo: string;
  group: string;
  epgId: string;
  streamUrl: string;
  slug: string;
  tvgLanguage?: string;
  country?: string;
}

export interface AdminTokenPayload {
  email: string;
  iat?: number;
  exp?: number;
}
