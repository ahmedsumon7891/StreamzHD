-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ADMINS
create table admins (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- CATEGORIES
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- COUNTRIES
create table countries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- CHANNELS
create table channels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  stream_url text not null,
  logo_url text,
  category_id uuid references categories(id) on delete set null,
  country_id uuid references countries(id) on delete set null,
  language text,
  description text,
  tags text[],
  is_featured boolean default false,
  is_active boolean default true,
  view_count bigint default 0,
  sort_order int default 0,
  epg_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SLIDER IMAGES
create table slider_images (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_url text not null,
  button_text text,
  button_link text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- AD NETWORKS
create table ad_networks (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ADVERTISEMENTS
create table advertisements (
  id uuid primary key default uuid_generate_v4(),
  network_id uuid references ad_networks(id) on delete cascade,
  position text not null,
  script_html text,
  device_target text default 'all',
  is_active boolean default true,
  schedule_start timestamptz,
  schedule_end timestamptz,
  created_at timestamptz default now()
);

-- EPG SOURCES
create table epg_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  url text not null,
  is_active boolean default true,
  last_fetched timestamptz,
  created_at timestamptz default now()
);

-- CHANNEL VIEWS (daily aggregated)
create table channel_views (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid references channels(id) on delete cascade,
  viewed_at date default current_date,
  count bigint default 1
);

-- SETTINGS
create table settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- ACTIVITY LOGS
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  detail text,
  created_at timestamptz default now()
);

-- MEDIA LIBRARY
create table media_library (
  id uuid primary key default uuid_generate_v4(),
  filename text not null,
  url text not null,
  bucket text not null,
  size_bytes bigint,
  mime_type text,
  created_at timestamptz default now()
);
