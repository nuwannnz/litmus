-- S-2.10: RLS isolation for public.subtasks.
--
-- Subtasks carry no user_id; ownership derives through the parent task. The
-- isolation proof therefore has three edges the other tables do not:
--   * Bob cannot reach Alice's subtask through her task (all four operations),
--   * Bob cannot attach a new subtask to Alice's task (INSERT WITH CHECK),
--   * Bob cannot re-parent his OWN subtask onto Alice's task (UPDATE WITH CHECK).

create extension if not exists pgtap with schema extensions;

begin;
select plan(11);
set search_path = public, extensions;

select is(
  (select relrowsecurity from pg_class where oid = 'public.subtasks'::regclass),
  true,
  'subtasks has RLS enabled');

delete from auth.users where email in ('s210-alice@example.test', 's210-bob@example.test');
insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 's210-alice@example.test'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 's210-bob@example.test');

-- Parent tasks exist before any client session: ownership is what the policies
-- read, not something under test here.
insert into public.tasks (id, user_id, title, due_date) values
  ('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Task A', current_date),
  ('44444444-4444-4444-8444-444444444444', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Task B', current_date);

-- Alice's session -----------------------------------------------------------
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
set local role authenticated;

select lives_ok(
  'insert into public.subtasks (id, task_id, label)'
  || ' values (''11111111-1111-4111-8111-111111111111'','
  || '''33333333-3333-4333-8333-333333333333'', ''step one'')',
  'alice can INSERT a subtask under her own task');

select is(
  (select count(*) from public.subtasks),
  1::bigint,
  'alice can SELECT her own subtask');

-- Bob's session -------------------------------------------------------------
reset role;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', false);
set local role authenticated;

select is(
  (select count(*) from public.subtasks),
  0::bigint,
  'bob sees none of alice''s subtasks');

-- Both run without error and match no rows: the EXISTS in USING finds no task
-- owned by Bob behind Alice's subtask.
update public.subtasks set done = true
where id = '11111111-1111-4111-8111-111111111111';

delete from public.subtasks
where id = '11111111-1111-4111-8111-111111111111';

select throws_ok(
  'insert into public.subtasks (id, task_id, label)'
  || ' values (''55555555-5555-4555-8555-555555555555'','
  || '''33333333-3333-4333-8333-333333333333'', ''intrusion'')',
  '42501',
  'new row violates row-level security policy for table "subtasks"',
  'bob cannot INSERT a subtask onto alice''s task (WITH CHECK via parent)');

select lives_ok(
  'insert into public.subtasks (id, task_id, label)'
  || ' values (''66666666-6666-4666-8666-666666666666'','
  || '''44444444-4444-4444-8444-444444444444'', ''step B'')',
  'bob can INSERT a subtask under his own task');

-- Re-parenting bob's own subtask onto alice's task must fail the WITH CHECK.
select throws_ok(
  'update public.subtasks set task_id = ''33333333-3333-4333-8333-333333333333'''
  || ' where id = ''66666666-6666-4666-8666-666666666666''',
  '42501',
  'new row violates row-level security policy for table "subtasks"',
  'bob cannot re-parent his subtask onto alice''s task (WITH CHECK)');

-- Unaffected ground truth, read as superuser --------------------------------
reset role;

select is(
  (select done from public.subtasks where id = '11111111-1111-4111-8111-111111111111'),
  false,
  'neither bob''s UPDATE nor his DELETE touched alice''s subtask');

select is(
  (select count(*) from public.subtasks where task_id = '33333333-3333-4333-8333-333333333333'),
  1::bigint,
  'bob did not attach anything to alice''s task');

-- Alice again: full ownership ----------------------------------------------
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
set local role authenticated;

update public.subtasks set done = true;

select is(
  (select done from public.subtasks),
  true,
  'alice can UPDATE her own subtask');

delete from public.subtasks;

select is(
  (select count(*) from public.subtasks),
  0::bigint,
  'alice can DELETE her own subtask');

rollback;
