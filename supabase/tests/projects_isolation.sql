-- S-2.10: RLS isolation for public.projects.
--
-- Full CRUD, each operation scoped by user_id = auth.uid(). Alice must get a
-- working lifecycle on her own row; Bob must see nothing of it, must not be
-- able to move it, and must not be able to create a row claiming Alice's
-- user_id (WITH CHECK).

create extension if not exists pgtap with schema extensions;

begin;
select plan(8);
set search_path = public, extensions;

select is(
  (select relrowsecurity from pg_class where oid = 'public.projects'::regclass),
  true,
  'projects has RLS enabled');

delete from auth.users where email in ('s210-alice@example.test', 's210-bob@example.test');
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 's210-alice@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 's210-bob@example.test');

-- Alice's session -----------------------------------------------------------
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
set local role authenticated;

select lives_ok(
  'insert into public.projects (id, user_id, name)'
  || ' values (''11111111-1111-4111-8111-111111111111'','
  || '''aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'', ''Project A'')',
  'alice can INSERT her own project');

select is(
  (select count(*) from public.projects),
  1::bigint,
  'alice can SELECT her own project');

-- Bob's session -------------------------------------------------------------
reset role;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', false);
set local role authenticated;

select is(
  (select count(*) from public.projects),
  0::bigint,
  'bob sees none of alice''s projects');

-- Both run without error and match no rows: USING filters the row out first.
update public.projects set name = 'Hijacked'
where id = '11111111-1111-4111-8111-111111111111';

delete from public.projects
where id = '11111111-1111-4111-8111-111111111111';

select throws_ok(
  'insert into public.projects (id, user_id, name)'
  || ' values (''22222222-2222-4222-8222-222222222222'','
  || '''aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'', ''Claimed'')',
  '42501',
  'new row violates row-level security policy for table "projects"',
  'bob cannot INSERT a project claiming alice''s user_id (WITH CHECK)');

-- Unaffected ground truth, read as superuser --------------------------------
reset role;

select is(
  (select name from public.projects where id = '11111111-1111-4111-8111-111111111111'),
  'Project A',
  'neither bob''s UPDATE nor his DELETE touched alice''s project');

-- Alice again: full ownership ----------------------------------------------
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
set local role authenticated;

update public.projects set name = 'Renamed';

select is(
  (select name from public.projects),
  'Renamed',
  'alice can UPDATE her own project');

delete from public.projects;

select is(
  (select count(*) from public.projects),
  0::bigint,
  'alice can DELETE her own project');

rollback;
