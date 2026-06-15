-- ============================================================================
-- VaidIQ — 00001_init.sql
-- Tenant-core schema + bulletproof multi-tenant Row-Level Security.
--
-- Design notes:
--   * Every tenant-scoped row carries `tenant_id -> clinics.id` (ON DELETE CASCADE).
--   * Tenant resolution goes through get_auth_tenant_id(), a SECURITY DEFINER
--     function. Running as the (RLS-bypassing) definer is what prevents the
--     classic "policy on users queries users -> infinite recursion" deadlock.
--   * INSERT/UPDATE policies always pair USING with WITH CHECK so a row can
--     never be written or moved into a tenant the caller doesn't belong to.
--   * Sign-up (first clinic + Owner) is impossible to express with row policies
--     alone (a brand-new auth user has no tenant yet), so it is handled by the
--     SECURITY DEFINER bootstrap_clinic() RPC — the only sanctioned write path
--     into clinics/users for a new account.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- Enums ----------------------------------------------------------------------
create type user_role as enum ('Owner', 'Doctor', 'Receptionist', 'Accountant');

-- Tables ---------------------------------------------------------------------

-- Tenant core. One row per clinic; `id` is the tenant_id every other table points at.
create table clinics (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  subscription_plan text not null default 'Starter',
  created_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

-- Application profile for an authenticated user, 1:1 with auth.users.
-- `tenant_id` binds the user to exactly one clinic.
create table users (
  id           uuid primary key references auth.users (id) on delete cascade,
  tenant_id    uuid not null references clinics (id) on delete cascade,
  role         user_role not null,
  full_name    text not null,
  phone_number text,
  created_at   timestamptz not null default now()
);
create index users_tenant_id_idx on users (tenant_id);

create table patients (
  id         uuid primary key default uuid_generate_v4(),
  tenant_id  uuid not null references clinics (id) on delete cascade,
  abha_id    text,
  first_name text not null,
  last_name  text,
  phone      text,
  dob        date,
  tags       text[] not null default '{}',
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index patients_tenant_id_idx on patients (tenant_id);

-- ============================================================================
-- Tenant resolution — the recursion-proof core.
-- SECURITY DEFINER + a pinned search_path means this runs as the table owner,
-- which bypasses RLS on `users`. Without this, the users RLS policy below would
-- call this function which selects from users which re-triggers the policy ...
-- ============================================================================
create or replace function public.get_auth_tenant_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select tenant_id from public.users where id = auth.uid();
$$;

revoke execute on function public.get_auth_tenant_id() from public;
grant execute on function public.get_auth_tenant_id() to authenticated;

-- ============================================================================
-- Sign-up bootstrap. Creates the clinic and its Owner profile atomically for
-- the currently authenticated user. Enforces "one bootstrap per account".
-- ============================================================================
create or replace function public.bootstrap_clinic(
  clinic_name     text,
  owner_full_name text,
  owner_phone     text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_clinic_id uuid;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED: must be authenticated to bootstrap a clinic';
  end if;

  if exists (select 1 from public.users where id = v_uid) then
    raise exception 'ALREADY_ONBOARDED: this account already belongs to a clinic';
  end if;

  insert into public.clinics (name)
  values (clinic_name)
  returning id into v_clinic_id;

  insert into public.users (id, tenant_id, role, full_name, phone_number)
  values (v_uid, v_clinic_id, 'Owner', owner_full_name, owner_phone);

  return v_clinic_id;
end;
$$;

revoke execute on function public.bootstrap_clinic(text, text, text) from public;
grant execute on function public.bootstrap_clinic(text, text, text) to authenticated;

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table clinics  enable row level security;
alter table users    enable row level security;
alter table patients enable row level security;

-- clinics: members read & update their own clinic. No direct INSERT (use
-- bootstrap_clinic) and no DELETE (soft-delete via deleted_at).
create policy clinics_select on clinics
  for select to authenticated
  using (id = get_auth_tenant_id());

create policy clinics_update on clinics
  for update to authenticated
  using (id = get_auth_tenant_id())
  with check (id = get_auth_tenant_id());

-- users: see co-workers in the same clinic; may only update *self*.
create policy users_select on users
  for select to authenticated
  using (tenant_id = get_auth_tenant_id());

create policy users_update on users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Anti-privilege-escalation: even on their own row, a user may only edit profile
-- fields. role / tenant_id / id are immutable from the client and only change
-- through SECURITY DEFINER RPCs (bootstrap_clinic, future staff-management RPCs).
revoke update on users from authenticated;
grant  update (full_name, phone_number) on users to authenticated;

-- patients: full tenant-scoped CRUD except hard delete (soft-delete via deleted_at).
create policy patients_select on patients
  for select to authenticated
  using (tenant_id = get_auth_tenant_id());

create policy patients_insert on patients
  for insert to authenticated
  with check (tenant_id = get_auth_tenant_id());

create policy patients_update on patients
  for update to authenticated
  using (tenant_id = get_auth_tenant_id())
  with check (tenant_id = get_auth_tenant_id());
