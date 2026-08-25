-- S-2.9: seed data for the local database, ported from src/client/libs/domain/src/data/.
--
-- seed.sql runs after every `db reset` (config.toml [db.seed]) and never against
-- dev or production, so everything here is sample data by definition — unlike
-- the categories, which are schema-level reference data living in the core
-- migration precisely because they must exist everywhere.
--
-- Source of truth is the prototype's fixtures, not the design frames' prose:
--   SEED_PROJECTS       src/client/libs/domain/src/data/projects.ts   (p1…p6)
--   SEED_PROJECT_TASKS  src/client/libs/domain/src/data/projects.ts   (pt1…pt15)
--   SEED_TASKS          src/client/libs/domain/src/data/tasks.ts      (t1…t12, with subtasks)
-- Notes (noteIds) are not ported: notes is v2 in its entirety (core-schema
-- header) and there is no table to receive them yet.
--
-- Deliberate drops, each because the schema has no such column rather than by
-- oversight:
--   taskCount / done / progress / due   derived — they are the project_stats
--                                       view (FR-28), never stored counters
--   team / members / assignee           PRD §5 / architecture §3.3 exclude them
--   updated ('2h ago')                  relative strings; updated_at is owned by
--                                       the trigger (S-2.4), not seeded
--
-- Fidelity decisions worth stating:
--   * One tasks row per fixture task. FR-35 collapses the prototype's split
--     Task / ProjectTask model into one table; a week task that carries a
--     project_id (t1, t3, t5…) lands on both boards, which the old model could
--     not express.
--   * Times: clock times map to time ('2:00 PM' → 14:00). 'All day', 'Morning'
--     and 'Evening' carry no time of day in the fixture and stay null; 'Noon'
--     maps to 12:00.
--   * Project-task due dates ('Aug 15') are read against SEED_WEEK's year,
--     2026. Empty dues stay null.
--   * position is a fractional index (S-2.4). Fixtures have no drag order, so
--     rows take evenly spaced integers in fixture order — within a project for
--     project tasks, within a day for undated/project-less ones. A task that is
--     both gets its project-board position; the boards sort stably regardless.
--   * ids are fixed literals shaped as UUIDv7 (version nibble 7, variant 8),
--     allocated in ranges so a row's origin stays readable: 0x0001 the user,
--     0x01xx projects, 0x02xx week tasks, 0x03xx project tasks, 0x0401ss
--     subtasks (parent task and sibling number packed into the node field).
--     Stability matters twice over: the Playwright suite (S-12.6) asserts
--     against these rows, and pgTAP can reference them without re-seeding.
--
-- The signed-in user: local auth needs a real auth.users row to hang
-- public.users off (its INSERT policy deliberately does not exist — the
-- on_auth_user_created trigger creates the profile). Signing in locally is
-- therefore dev@litmus.test / password123, matching what S-4.x flows and the
-- Playwright suite will drive against.

-- pgTAP is test infrastructure: seed.sql only ever runs locally after `db reset`,
-- so installing the extension here keeps prod migrations clean while making every
-- suite in supabase/tests runnable on a fresh reset.
create extension if not exists pgtap with schema extensions;

-- ---------------------------------------------------------------------------
-- auth: the one local user (and the identity GoTrue matches on)
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '01990000-0000-7000-8000-000000000001',
  'authenticated',
  'authenticated',
  'dev@litmus.test',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "Nuwan"}'
);

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  '01990000-0000-7000-8000-000000000001',
  '01990000-0000-7000-8000-000000000001',
  '{"sub": "01990000-0000-7000-8000-000000000001", "email": "dev@litmus.test", "email_verified": true}',
  'email',
  now(), now(), now()
);

-- The profile row itself is not inserted here: the SECURITY DEFINER trigger
-- from the core migration fires on the auth.users insert above and creates it,
-- which is exactly the one code path that can.

-- ---------------------------------------------------------------------------
-- projects — SEED_PROJECTS, in declared order
-- ---------------------------------------------------------------------------
insert into public.projects (id, user_id, name, color, description, about, status, priority, due_date, position, created_at) values
  ('01990000-0000-7000-8000-000000000101', '01990000-0000-7000-8000-000000000001',
    'Design System', 'mint',
    'Component library, tokens, and documentation for the pastel UI kit.',
    'A unified pastel design system powering the weekly planner across web and mobile — tokens, components, and usage docs.',
    'active', 'high', '2026-08-30', 1, '2026-07-28'),
  ('01990000-0000-7000-8000-000000000102', '01990000-0000-7000-8000-000000000001',
    'Mobile App', 'blue',
    'iOS and Android build of the weekly planner with offline sync.',
    'Native clients that stay in sync with the web workspace, including an offline-first task queue.',
    'active', 'high', '2026-09-12', 2, '2026-06-02'),
  ('01990000-0000-7000-8000-000000000103', '01990000-0000-7000-8000-000000000001',
    'Q3 Marketing', 'peach',
    'Launch newsletter, social campaign, and landing page refresh.',
    'Everything shipping for the Q3 push: newsletter, social, and the refreshed landing page.',
    'active', 'medium', '2026-09-30', 3, '2026-07-01'),
  ('01990000-0000-7000-8000-000000000104', '01990000-0000-7000-8000-000000000001',
    'Product Launch', 'lav',
    'Coordinate release across design, engineering, and marketing teams.',
    'The cross-functional plan for launch week — comms, release gates, and day-one support.',
    'active', 'high', '2026-10-05', 4, '2026-05-19'),
  ('01990000-0000-7000-8000-000000000105', '01990000-0000-7000-8000-000000000001',
    'User Research', 'pink',
    'Interviews, surveys, and usability testing for the onboarding flow.',
    'Discovery work feeding the onboarding redesign: interviews, surveys, and usability sessions.',
    'active', 'medium', '2026-08-29', 5, '2026-07-14'),
  ('01990000-0000-7000-8000-000000000106', '01990000-0000-7000-8000-000000000001',
    'Website Redesign', 'yellow',
    'Marketing site rebuild with refreshed brand and CMS migration.',
    'Rebuilding litmus.so on the new brand, with a CMS migration and a faster publishing flow.',
    'active', 'low', '2026-11-01', 6, '2026-06-21');

-- ---------------------------------------------------------------------------
-- tasks — SEED_TASKS (the week board) then SEED_PROJECT_TASKS (the kanban
-- boards), one table under FR-35. category_id resolves through categories.name
-- rather than repeating the core migration's literal ids here: the names are
-- what the fixtures carry, and the join keeps this file honest about that.
-- ---------------------------------------------------------------------------
insert into public.tasks (id, user_id, title, status, project_id, due_date, category_id, priority, description, start_time, end_time, position) values
  -- t1
  ('01990000-0000-7000-8000-000000000201', '01990000-0000-7000-8000-000000000001',
    'Finalize onboarding flow wireframes', 'progress',
    '01990000-0000-7000-8000-000000000101', '2026-08-10',
    (select id from public.categories where name = 'Design'), 'high',
    'Wireframe the five-step onboarding, including the empty week state and the first-project nudge.',
    '14:00', '15:30', 1),
  -- t2
  ('01990000-0000-7000-8000-000000000202', '01990000-0000-7000-8000-000000000001',
    'Weekly sync with product team', 'todo',
    null, '2026-08-10',
    (select id from public.categories where name = 'Meeting'), 'medium',
    'Standing Monday sync — review last week''s ship list and lock this week''s priorities.',
    '10:00', '10:45', 1),
  -- t3
  ('01990000-0000-7000-8000-000000000203', '01990000-0000-7000-8000-000000000001',
    'Set up authentication endpoints', 'progress',
    '01990000-0000-7000-8000-000000000102', '2026-08-11',
    (select id from public.categories where name = 'Dev'), 'high',
    'Sign-in, sign-up, refresh, and password reset endpoints behind the new session service.',
    null, null, 2),
  -- t4
  ('01990000-0000-7000-8000-000000000204', '01990000-0000-7000-8000-000000000001',
    'Review competitor pricing pages', 'todo',
    null, '2026-08-11',
    (select id from public.categories where name = 'Research'), 'low',
    'Pull apart how five comparable tools frame their free tier and annual discount.',
    '16:30', '17:30', 2),
  -- t5
  ('01990000-0000-7000-8000-000000000205', '01990000-0000-7000-8000-000000000001',
    'Draft newsletter for launch week', 'progress',
    '01990000-0000-7000-8000-000000000103', '2026-08-12',
    (select id from public.categories where name = 'Marketing'), 'medium',
    'Three-section newsletter: what shipped, what''s next, and the invite to the live demo.',
    '11:00', '12:30', 1),
  -- t6
  ('01990000-0000-7000-8000-000000000206', '01990000-0000-7000-8000-000000000001',
    'Polish empty states & illustrations', 'progress',
    '01990000-0000-7000-8000-000000000101', '2026-08-13',
    (select id from public.categories where name = 'Design'), 'high',
    'Refine the illustrations for empty dashboard, search, and inbox states. Keep the pastel palette consistent and export at 2x for retina displays.',
    '09:30', '11:00', 3),
  -- t7
  ('01990000-0000-7000-8000-000000000207', '01990000-0000-7000-8000-000000000001',
    'Fix drag-and-drop card bug', 'todo',
    '01990000-0000-7000-8000-000000000102', '2026-08-13',
    (select id from public.categories where name = 'Dev'), 'high',
    'Cards dropped on the last column snap back when the board is horizontally scrolled.',
    '13:00', '14:00', 4),
  -- t8
  ('01990000-0000-7000-8000-000000000208', '01990000-0000-7000-8000-000000000001',
    'Dentist appointment', 'todo',
    null, '2026-08-13',
    (select id from public.categories where name = 'Personal'), 'low',
    null,
    '17:15', '18:00', 3),
  -- t9
  ('01990000-0000-7000-8000-000000000209', '01990000-0000-7000-8000-000000000001',
    'Sprint retro & planning', 'todo',
    '01990000-0000-7000-8000-000000000104', '2026-08-14',
    (select id from public.categories where name = 'Meeting'), 'medium',
    'Close out sprint 14 and shape the launch-week sprint.',
    '15:00', '16:30', 1),
  -- t10
  ('01990000-0000-7000-8000-000000000210', '01990000-0000-7000-8000-000000000001',
    'Schedule social posts', 'progress',
    '01990000-0000-7000-8000-000000000103', '2026-08-14',
    (select id from public.categories where name = 'Marketing'), 'low',
    'Queue the launch-week thread and two teaser posts.',
    '12:00', '13:00', 2),
  -- t11
  ('01990000-0000-7000-8000-000000000211', '01990000-0000-7000-8000-000000000001',
    'Grocery run & meal prep', 'todo',
    null, '2026-08-15',
    (select id from public.categories where name = 'Personal'), 'low',
    null,
    null, null, 4),
  -- t12
  ('01990000-0000-7000-8000-000000000212', '01990000-0000-7000-8000-000000000001',
    'Read design systems article', 'todo',
    null, '2026-08-16',
    (select id from public.categories where name = 'Research'), 'low',
    'The long piece on token naming that Alex shared in #design.',
    null, null, 5),
  -- pt1…pt15 — SEED_PROJECT_TASKS. Dues read against SEED_WEEK's 2026;
  -- empty dues stay null and FR-39 is satisfied through project_id alone.
  ('01990000-0000-7000-8000-000000000301', '01990000-0000-7000-8000-000000000001',
    'Define spacing scale tokens', 'todo',
    '01990000-0000-7000-8000-000000000101', '2026-08-15',
    (select id from public.categories where name = 'Design'), null,
    null, null, null, 4),
  ('01990000-0000-7000-8000-000000000302', '01990000-0000-7000-8000-000000000001',
    'Audit color contrast ratios', 'todo',
    '01990000-0000-7000-8000-000000000101', null,
    (select id from public.categories where name = 'QA'), null,
    null, null, null, 5),
  ('01990000-0000-7000-8000-000000000303', '01990000-0000-7000-8000-000000000001',
    'Design elevation & shadows', 'todo',
    '01990000-0000-7000-8000-000000000101', '2026-08-18',
    (select id from public.categories where name = 'Design'), null,
    null, null, null, 6),
  ('01990000-0000-7000-8000-000000000304', '01990000-0000-7000-8000-000000000001',
    'Build Button component', 'progress',
    '01990000-0000-7000-8000-000000000101', '2026-08-13',
    (select id from public.categories where name = 'Dev'), null,
    null, null, null, 7),
  ('01990000-0000-7000-8000-000000000305', '01990000-0000-7000-8000-000000000001',
    'Document form patterns', 'progress',
    '01990000-0000-7000-8000-000000000101', null,
    (select id from public.categories where name = 'Docs'), null,
    null, null, null, 8),
  ('01990000-0000-7000-8000-000000000306', '01990000-0000-7000-8000-000000000001',
    'Set up component library', 'done',
    '01990000-0000-7000-8000-000000000101', null,
    (select id from public.categories where name = 'Design'), null,
    null, null, null, 9),
  ('01990000-0000-7000-8000-000000000307', '01990000-0000-7000-8000-000000000001',
    'Define type ramp', 'done',
    '01990000-0000-7000-8000-000000000101', null,
    (select id from public.categories where name = 'Design'), null,
    null, null, null, 10),
  ('01990000-0000-7000-8000-000000000308', '01990000-0000-7000-8000-000000000001',
    'Offline sync queue', 'progress',
    '01990000-0000-7000-8000-000000000102', '2026-08-20',
    (select id from public.categories where name = 'Dev'), null,
    null, null, null, 1),
  ('01990000-0000-7000-8000-000000000309', '01990000-0000-7000-8000-000000000001',
    'Push notification setup', 'todo',
    '01990000-0000-7000-8000-000000000102', null,
    (select id from public.categories where name = 'Dev'), null,
    null, null, null, 2),
  ('01990000-0000-7000-8000-000000000310', '01990000-0000-7000-8000-000000000001',
    'Design phone day view', 'done',
    '01990000-0000-7000-8000-000000000102', null,
    (select id from public.categories where name = 'Design'), null,
    null, null, null, 3),
  ('01990000-0000-7000-8000-000000000311', '01990000-0000-7000-8000-000000000001',
    'Write launch newsletter', 'progress',
    '01990000-0000-7000-8000-000000000103', '2026-08-18',
    (select id from public.categories where name = 'Marketing'), null,
    null, null, null, 3),
  ('01990000-0000-7000-8000-000000000312', '01990000-0000-7000-8000-000000000001',
    'Refresh landing hero', 'done',
    '01990000-0000-7000-8000-000000000103', null,
    (select id from public.categories where name = 'Design'), null,
    null, null, null, 4),
  ('01990000-0000-7000-8000-000000000313', '01990000-0000-7000-8000-000000000001',
    'Lock release checklist', 'todo',
    '01990000-0000-7000-8000-000000000104', '2026-08-25',
    (select id from public.categories where name = 'Docs'), null,
    null, null, null, 2),
  ('01990000-0000-7000-8000-000000000314', '01990000-0000-7000-8000-000000000001',
    'Recruit five participants', 'progress',
    '01990000-0000-7000-8000-000000000105', '2026-08-19',
    (select id from public.categories where name = 'Research'), null,
    null, null, null, 1),
  ('01990000-0000-7000-8000-000000000315', '01990000-0000-7000-8000-000000000001',
    'Migrate blog to new CMS', 'todo',
    '01990000-0000-7000-8000-000000000106', '2026-09-02',
    (select id from public.categories where name = 'Dev'), null,
    null, null, null, 1);

-- ---------------------------------------------------------------------------
-- subtasks — the subs() helper output, done flags verbatim. Position is the
-- sibling's 1-based index in the fixture; ids pack parent task and sibling
-- number into the node field (0x0401tt ss).
-- ---------------------------------------------------------------------------
insert into public.subtasks (id, task_id, label, done, position) values
  -- t1 ×5
  ('01990000-0000-7000-8000-000000040101', '01990000-0000-7000-8000-000000000201', 'Map the current flow',              true,  1),
  ('01990000-0000-7000-8000-000000040102', '01990000-0000-7000-8000-000000000201', 'Sketch step 1–3',                   true,  2),
  ('01990000-0000-7000-8000-000000040103', '01990000-0000-7000-8000-000000000201', 'Sketch step 4–5',                   false, 3),
  ('01990000-0000-7000-8000-000000040104', '01990000-0000-7000-8000-000000000201', 'Review with Alex',                  false, 4),
  ('01990000-0000-7000-8000-000000040105', '01990000-0000-7000-8000-000000000201', 'Hand off to build',                 false, 5),
  -- t2 ×3
  ('01990000-0000-7000-8000-000000040201', '01990000-0000-7000-8000-000000000202', 'Prep agenda',                       false, 1),
  ('01990000-0000-7000-8000-000000040202', '01990000-0000-7000-8000-000000000202', 'Share notes',                       false, 2),
  ('01990000-0000-7000-8000-000000040203', '01990000-0000-7000-8000-000000000202', 'File follow-ups',                   false, 3),
  -- t3 ×8
  ('01990000-0000-7000-8000-000000040301', '01990000-0000-7000-8000-000000000203', 'Scaffold routes',                   true,  1),
  ('01990000-0000-7000-8000-000000040302', '01990000-0000-7000-8000-000000000203', 'Session storage',                   true,  2),
  ('01990000-0000-7000-8000-000000040303', '01990000-0000-7000-8000-000000000203', 'Password reset',                    true,  3),
  ('01990000-0000-7000-8000-000000040304', '01990000-0000-7000-8000-000000000203', 'Rate limiting',                     true,  4),
  ('01990000-0000-7000-8000-000000040305', '01990000-0000-7000-8000-000000000203', 'OAuth: Google',                     false, 5),
  ('01990000-0000-7000-8000-000000040306', '01990000-0000-7000-8000-000000000203', 'OAuth: Apple',                      false, 6),
  ('01990000-0000-7000-8000-000000040307', '01990000-0000-7000-8000-000000000203', 'Integration tests',                 false, 7),
  ('01990000-0000-7000-8000-000000040308', '01990000-0000-7000-8000-000000000203', 'Docs',                              false, 8),
  -- t4 ×2
  ('01990000-0000-7000-8000-000000040401', '01990000-0000-7000-8000-000000000204', 'Collect screenshots',               true,  1),
  ('01990000-0000-7000-8000-000000040402', '01990000-0000-7000-8000-000000000204', 'Write the summary',                 false, 2),
  -- t5 ×6
  ('01990000-0000-7000-8000-000000040501', '01990000-0000-7000-8000-000000000205', 'Outline sections',                  true,  1),
  ('01990000-0000-7000-8000-000000040502', '01990000-0000-7000-8000-000000000205', 'Draft copy',                        true,  2),
  ('01990000-0000-7000-8000-000000040503', '01990000-0000-7000-8000-000000000205', 'Pick screenshots',                  true,  3),
  ('01990000-0000-7000-8000-000000040504', '01990000-0000-7000-8000-000000000205', 'Internal review',                   false, 4),
  ('01990000-0000-7000-8000-000000040505', '01990000-0000-7000-8000-000000000205', 'Schedule send',                     false, 5),
  ('01990000-0000-7000-8000-000000040506', '01990000-0000-7000-8000-000000000205', 'Prep follow-up',                    false, 6),
  -- t6 ×4
  ('01990000-0000-7000-8000-000000040601', '01990000-0000-7000-8000-000000000206', 'Audit current empty state screens', true,  1),
  ('01990000-0000-7000-8000-000000040602', '01990000-0000-7000-8000-000000000206', 'Sketch three illustration concepts', false, 2),
  ('01990000-0000-7000-8000-000000040603', '01990000-0000-7000-8000-000000000206', 'Design final illustrations in pastel', false, 3),
  ('01990000-0000-7000-8000-000000040604', '01990000-0000-7000-8000-000000000206', 'Export assets at 2x',               false, 4),
  -- t7 ×2
  ('01990000-0000-7000-8000-000000040701', '01990000-0000-7000-8000-000000000207', 'Reproduce on iPad',                 false, 1),
  ('01990000-0000-7000-8000-000000040702', '01990000-0000-7000-8000-000000000207', 'Fix drop target maths',             false, 2),
  -- t8 ×1
  ('01990000-0000-7000-8000-000000040801', '01990000-0000-7000-8000-000000000208', 'Leave by 4:45',                     false, 1),
  -- t9 ×4
  ('01990000-0000-7000-8000-000000040901', '01990000-0000-7000-8000-000000000209', 'Collect retro notes',               false, 1),
  ('01990000-0000-7000-8000-000000040902', '01990000-0000-7000-8000-000000000209', 'Groom the backlog',                 false, 2),
  ('01990000-0000-7000-8000-000000040903', '01990000-0000-7000-8000-000000000209', 'Set sprint goal',                   false, 3),
  ('01990000-0000-7000-8000-000000040904', '01990000-0000-7000-8000-000000000209', 'Book the room',                     false, 4),
  -- t10 ×3
  ('01990000-0000-7000-8000-000000041001', '01990000-0000-7000-8000-000000000210', 'Write the thread',                  true,  1),
  ('01990000-0000-7000-8000-000000041002', '01990000-0000-7000-8000-000000000210', 'Design the cards',                  true,  2),
  ('01990000-0000-7000-8000-000000041003', '01990000-0000-7000-8000-000000000210', 'Queue in Buffer',                   false, 3),
  -- t11 ×1
  ('01990000-0000-7000-8000-000000041101', '01990000-0000-7000-8000-000000000211', 'Write the list',                    false, 1),
  -- t12 ×1
  ('01990000-0000-7000-8000-000000041201', '01990000-0000-7000-8000-000000000212', 'Read and highlight',                false, 1);
