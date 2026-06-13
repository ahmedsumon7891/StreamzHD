-- Enable RLS on all tables
alter table admins enable row level security;
alter table categories enable row level security;
alter table countries enable row level security;
alter table channels enable row level security;
alter table slider_images enable row level security;
alter table ad_networks enable row level security;
alter table advertisements enable row level security;
alter table epg_sources enable row level security;
alter table channel_views enable row level security;
alter table settings enable row level security;
alter table activity_logs enable row level security;
alter table media_library enable row level security;

-- Public read for visitor-facing tables
create policy "Public read categories" on categories for select using (true);
create policy "Public read countries" on countries for select using (true);
create policy "Public read channels" on channels for select using (is_active = true);
create policy "Public read sliders" on slider_images for select using (is_active = true);
create policy "Public read ads" on advertisements for select using (is_active = true);
create policy "Public read settings" on settings for select using (true);
create policy "Public read epg" on epg_sources for select using (is_active = true);
create policy "Public read media" on media_library for select using (true);

-- Admins table fully restricted; all writes happen with service role on the server.
create policy "No public access admins" on admins for all using (false);
