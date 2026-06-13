-- Default settings
insert into settings (key, value) values
  ('site_name', 'StreamZ HD'),
  ('site_description', 'Premium IPTV Streaming Platform'),
  ('maintenance_mode', 'false'),
  ('channels_per_page', '24'),
  ('player_autoplay', 'true'),
  ('show_epg', 'false');

-- Default categories
insert into categories (name, slug, sort_order) values
  ('Sports', 'sports', 1),
  ('News', 'news', 2),
  ('Movies', 'movies', 3),
  ('Entertainment', 'entertainment', 4),
  ('Kids', 'kids', 5),
  ('Music', 'music', 6),
  ('Documentary', 'documentary', 7),
  ('Religion', 'religion', 8),
  ('Lifestyle', 'lifestyle', 9);

-- Default countries
insert into countries (name, code, sort_order) values
  ('United Kingdom', 'GB', 1),
  ('United States', 'US', 2),
  ('Albania', 'AL', 3),
  ('France', 'FR', 4),
  ('Germany', 'DE', 5),
  ('Italy', 'IT', 6),
  ('Spain', 'ES', 7),
  ('Turkey', 'TR', 8),
  ('Arabic', 'AR', 9),
  ('India', 'IN', 10);

-- Default ad networks
insert into ad_networks (name, is_active) values
  ('Adsterra', false),
  ('Monetag', false),
  ('HilltopAds', false),
  ('PropellerAds', false),
  ('Custom', false);
