-- S-2.10: RLS isolation for public.categories.
--
-- Categories are global reference data: readable by every signed-in user,
-- writable by none. Every write path must be default-deny -- there is no
-- user_id to scope by, so no write policy can exist while Q7 is open. The anon
-- role is also asserted: grants were revoked before any policy was written, so
-- an unauthenticated caller is stopped at the grant gate.

create extension if not exists pgtap with schema extensions;

begin;
select plan(6);
set search_path = public, extensions;

select is(
  (select relrowsecurity from pg_class where oid = 'public.categories'::regclass),
  true,
  'categories has RLS enabled');

delete from auth.users where email = 's210-alice@example.test';
insert into auth.users (id, email)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 's210-alice@example.test');

-- Alice's session -----------------------------------------------------------
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
set local role authenticated;

select is(
  (select count(*) from public.categories),
  8::bigint,
  'an authenticated user sees the full seeded category list');

select throws_ok(
  'insert into public.categories (id, name, color, position)'
  || ' values (gen_random_uuid(), ''Nope'', ''lav'', 99)',
  '42501',
  'permission denied for table categories',
  'INSERT without a policy is denied (categories are migration-owned)');

select throws_ok(
  'update public.categories set name = ''Renamed''',
  '42501',
  'permission denied for table categories',
  'UPDATE without a policy is denied');

select throws_ok(
  'delete from public.categories',
  '42501',
  'permission denied for table categories',
  'DELETE without a policy is denied');

-- An anonymous caller never gets past the grant gate at all.
set local role anon;
select throws_ok(
  'select * from public.categories',
  '42501',
  'permission denied for table categories',
  'anon has no grants: stopped before RLS is even consulted');

rollback;
