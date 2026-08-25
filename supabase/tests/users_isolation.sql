-- S-2.10: RLS isolation for public.users.
--
-- One identity must see and change exactly its own profile row, and the two
-- deliberately unpoliced operations (INSERT, DELETE -- owned by the signup
-- trigger and by auth-level deletion) must stay default-deny.
--
-- Sessions are simulated the way PostgREST presents them: the `authenticated`
-- role plus a JWT sub claim, which is all auth.uid() reads.

create extension if not exists pgtap with schema extensions;

begin;
select plan(8);
set search_path = public, extensions;

select is(
  (select relrowsecurity from pg_class where oid = 'public.users'::regclass),
  true,
  'users has RLS enabled');

delete from auth.users where email in ('s210-alice@example.test', 's210-bob@example.test');

-- Two signups; the SECURITY DEFINER trigger creates one profile each.
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 's210-alice@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 's210-bob@example.test');

select is(
  (select count(*) from public.users
   where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),
  2::bigint,
  'signup trigger created one profile per identity');

-- Bob's session -------------------------------------------------------------
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', false);
set local role authenticated;

select is(
  (select count(*) from public.users where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  0::bigint,
  'bob cannot SELECT alice''s profile');

select is(
  (select display_name from public.users
   where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  's210-bob',
  'bob can SELECT his own profile');

-- Runs without error and matches no rows: USING filters alice's row out first.
update public.users set display_name = 'Hijacked'
where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

update public.users set display_name = 'Bobby'
where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

-- No INSERT policy exists (the signup trigger owns creation): default deny.
select throws_ok(
  'insert into public.users (id)'
  || ' values (''cccccccc-cccc-4ccc-8ccc-cccccccccccc'')',
  '42501',
  'permission denied for table users',
  'INSERT without a policy is denied (profile creation belongs to the trigger)');

-- No DELETE policy exists either: removal cascades from auth.users only.
select throws_ok(
  'delete from public.users where id = ''aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa''',
  '42501',
  'permission denied for table users',
  'DELETE without a policy is denied');

-- Unaffected ground truth, read as superuser --------------------------------
reset role;

select is(
  (select display_name from public.users
   where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  's210-alice',
  'bob''s UPDATE never touched alice''s profile');

select is(
  (select display_name from public.users
   where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  'Bobby',
  'bob can UPDATE his own profile');

rollback;
