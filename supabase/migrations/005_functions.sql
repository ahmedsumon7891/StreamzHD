create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger channels_updated_at
  before update on channels
  for each row execute function update_updated_at();

create or replace function increment_channel_view(channel_slug text)
returns void as $$
declare
  ch_id uuid;
begin
  select id into ch_id from channels where slug = channel_slug;
  if ch_id is not null then
    update channels set view_count = view_count + 1 where id = ch_id;
    insert into channel_views (channel_id, viewed_at, count)
    values (ch_id, current_date, 1)
    on conflict do nothing;
  end if;
end;
$$ language plpgsql security definer;
