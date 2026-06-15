-- ============================================================================
-- LOCAL Supabase stub — provides the bits of Supabase a vanilla Postgres lacks,
-- so migrations/00001_init.sql can be applied and RLS exercised off-platform.
--
-- ⚠️  Apply this to an EPHEMERAL test database ONLY, BEFORE the migration.
--     On real Supabase these objects already exist — do not run this there.
-- ============================================================================

create schema if not exists auth;

-- Minimal stand-in for auth.users (real table has many more columns; the FK in
-- public.users only needs the primary key).
create table if not exists auth.users (id uuid primary key);

-- Stand-in for Supabase's auth.uid(): reads the JWT subject from a session GUC.
-- The test harness sets `request.jwt.claim.sub` to simulate a logged-in user.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- Supabase's two PostgREST roles.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
end $$;

grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;

-- Mirror Supabase's default-privilege setup: tables created next (by the
-- migration, run as this same superuser) are granted to `authenticated`. The
-- migration then *narrows* this on the users table via column-level grants.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
