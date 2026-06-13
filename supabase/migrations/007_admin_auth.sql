-- =========================================================================
-- Admin authentication via Supabase Auth + user_roles table
-- =========================================================================
-- Replaces the legacy `admins` table (which used a custom JWT + bcrypt flow).
-- Admins are now real Supabase Auth users with an `admin` row in user_roles.
--
-- BEFORE RUNNING THIS MIGRATION:
--   1. Edit the two variables at the bottom (admin_email, admin_password).
--   2. Use a strong password — it will be stored hashed in auth.users.
--   3. After deploy, change the password from the Supabase dashboard
--      (Authentication → Users) or by signing in and updating it.
-- =========================================================================

-- Required for crypt() / gen_salt() used to seed the admin password.
create extension if not exists pgcrypto;

-- 1. Role enum
do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception when duplicate_object then null;
end $$;

-- 2. user_roles table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- Users can read their own roles (used by the dashboard UI).
drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- 3. Security-definer role check (used by app code and RLS policies).
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated, service_role;

-- 4. Drop the legacy admins table — it is no longer used.
drop table if exists public.admins cascade;

-- =========================================================================
-- 5. Seed the initial admin account
-- =========================================================================
do $$
declare
  admin_email    text := 'atiqur.dev404@gmail.com';   -- <-- EDIT ME
  admin_password text := '@Ahmedsumon91'; -- <-- EDIT ME
  new_user_id    uuid;
begin
  -- Skip if a user with this email already exists.
  select id into new_user_id from auth.users where email = admin_email;

  if new_user_id is null then
    new_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', admin_email, 'email_verified', true),
      'email',
      new_user_id::text,
      now(), now(), now()
    );
  end if;

  -- Grant the admin role (idempotent thanks to the unique constraint).
  insert into public.user_roles (user_id, role)
  values (new_user_id, 'admin')
  on conflict (user_id, role) do nothing;
end $$;
