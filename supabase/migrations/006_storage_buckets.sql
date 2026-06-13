-- Create public buckets if they do not exist
insert into storage.buckets (id, name, public)
values 
  ('logos', 'logos', true),
  ('sliders', 'sliders', true),
  ('categories', 'categories', true),
  ('countries', 'countries', true),
  ('media', 'media', true)
on conflict (id) do nothing;

-- Enable public read access to objects in these buckets
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Allow public read access' and tablename = 'objects' and schemaname = 'storage'
  ) then
    create policy "Allow public read access"
    on storage.objects for select
    to public
    using (bucket_id in ('logos', 'sliders', 'categories', 'countries', 'media'));
  end if;
end $$;

-- Allow admin (service_role) full write access
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Allow admin write access' and tablename = 'objects' and schemaname = 'storage'
  ) then
    create policy "Allow admin write access"
    on storage.objects for all
    to service_role
    using (bucket_id in ('logos', 'sliders', 'categories', 'countries', 'media'))
    with check (bucket_id in ('logos', 'sliders', 'categories', 'countries', 'media'));
  end if;
end $$;
