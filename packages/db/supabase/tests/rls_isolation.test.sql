-- ============================================================================
-- VaidIQ — RLS tenant-isolation test harness
--
-- ⚠️  LOCAL / CI VERIFICATION ONLY — run against an EPHEMERAL vanilla Postgres.
--     It stubs Supabase objects (auth schema, auth.uid(), anon/authenticated
--     roles) and OVERRIDES auth.uid(). NEVER run this against a live Supabase
--     database — it would clobber real auth objects.
--
-- Usage (after applying migrations/00001_init.sql to a throwaway DB):
--     psql "$DB_URL" -f tests/rls_isolation.test.sql
-- A clean run ends with NOTICE "ALL RLS ISOLATION TESTS PASSED". Any failed
-- invariant aborts with an exception.
--
-- NOTE: the auth stub below must be applied BEFORE the migration (the migration
-- references auth.users / auth.uid). The Node runner does exactly that ordering.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Seed: two auth users (Supabase Auth would create these on sign-up).
-- ---------------------------------------------------------------------------
reset role;
insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Onboarding: each user bootstraps their own clinic (as the authenticated role).
-- ---------------------------------------------------------------------------
set role authenticated;

set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select public.bootstrap_clinic('Clinic A', 'Owner A', '+910000000001');
insert into patients (tenant_id, first_name, abha_id, tags)
  values (get_auth_tenant_id(), 'Asha', '12-3456-7890-1234', array['vip']);

set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select public.bootstrap_clinic('Clinic B', 'Owner B', '+910000000002');
insert into patients (tenant_id, first_name)
  values (get_auth_tenant_id(), 'Bhem');

-- Capture both tenant ids into session GUCs (as superuser, bypassing RLS) so the
-- "attacker" context below can *attempt* cross-tenant access by raw id.
reset role;
select set_config('test.a_tenant', (select id::text from clinics where name = 'Clinic A'), false);
select set_config('test.b_tenant', (select id::text from clinics where name = 'Clinic B'), false);

-- ===========================================================================
-- ASSERTIONS — all evaluated as user A (authenticated)
-- ===========================================================================
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

-- 1) get_auth_tenant_id() resolves under RLS WITHOUT recursing, and matches A.
do $$
begin
  if get_auth_tenant_id() is null then
    raise exception 'FAIL[1]: get_auth_tenant_id() is null for user A';
  end if;
  if get_auth_tenant_id() <> current_setting('test.a_tenant')::uuid then
    raise exception 'FAIL[1]: get_auth_tenant_id() != Clinic A';
  end if;
end $$;

-- 2) Tenant isolation on reads: A sees only its own clinic / users / patients.
do $$
declare cnt int;
begin
  select count(*) into cnt from clinics;
  if cnt <> 1 then raise exception 'FAIL[2]: A sees % clinics (expected 1)', cnt; end if;

  select count(*) into cnt from users;
  if cnt <> 1 then raise exception 'FAIL[2]: A sees % users (expected 1)', cnt; end if;

  select count(*) into cnt from patients;
  if cnt <> 1 then raise exception 'FAIL[2]: A sees % patients (expected 1)', cnt; end if;

  select count(*) into cnt from clinics where id = current_setting('test.b_tenant')::uuid;
  if cnt <> 0 then raise exception 'FAIL[2]: A can SEE Clinic B (isolation breach)'; end if;
end $$;

-- 3) WITH CHECK blocks inserting a patient into someone else's tenant.
do $$
begin
  insert into patients (tenant_id, first_name)
    values (current_setting('test.b_tenant')::uuid, 'Mallory');
  raise exception 'FAIL[3]: cross-tenant patient INSERT was allowed';
exception when insufficient_privilege then
  null; -- expected: "new row violates row-level security policy"
end $$;

-- 4) USING blocks updating another tenant's rows (0 rows affected, no leak).
do $$
declare affected int;
begin
  with upd as (
    update patients set first_name = 'hacked'
    where tenant_id = current_setting('test.b_tenant')::uuid
    returning 1
  )
  select count(*) into affected from upd;
  if affected <> 0 then
    raise exception 'FAIL[4]: A updated % of B''s patients (isolation breach)', affected;
  end if;
end $$;

-- 5) Anti-privilege-escalation: A cannot change its own role (column-level grant).
do $$
begin
  update users set role = 'Doctor'
    where id = current_setting('request.jwt.claim.sub')::uuid;
  raise exception 'FAIL[5]: user A escalated its own role';
exception when insufficient_privilege then
  null; -- expected: permission denied for column "role"
end $$;

-- 6) ...but A CAN edit its own allowed profile fields.
update users set full_name = 'Owner A (edited)'
  where id = current_setting('request.jwt.claim.sub')::uuid;
do $$
declare nm text;
begin
  select full_name into nm from users
    where id = current_setting('request.jwt.claim.sub')::uuid;
  if nm <> 'Owner A (edited)' then
    raise exception 'FAIL[6]: profile self-update did not persist';
  end if;
end $$;

-- 7) bootstrap_clinic is one-shot per account.
do $$
begin
  perform public.bootstrap_clinic('Clinic A2', 'Owner A again');
  raise exception 'FAIL[7]: second bootstrap_clinic call was allowed';
exception
  when sqlstate 'P0001' then
    if sqlerrm not like '%ALREADY_ONBOARDED%' then raise; end if; -- expected guard
end $$;

-- 8) Unauthenticated (anon) sees nothing — policies are scoped to `authenticated`.
reset role;
set role anon;
do $$
declare cnt int;
begin
  select count(*) into cnt from clinics;
  if cnt <> 0 then raise exception 'FAIL[8]: anon can see % clinics', cnt; end if;
exception when insufficient_privilege then
  null; -- also acceptable: anon has no table grant at all
end $$;
reset role;

do $$ begin raise notice 'ALL RLS ISOLATION TESTS PASSED'; end $$;
