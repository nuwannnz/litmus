import type { LitmusSupabaseClient } from '../client';
import type { CategoryRow, ProjectRow, TaskRow } from '../rows';

/**
 * The fetchers behind the read hooks — plain async functions taking the
 * client explicitly, so they are usable outside React (the reconnect drain,
 * tests) and mockable without rendering anything.
 *
 * Every query relies on RLS for scoping to the signed-in user — no `user_id`
 * filter is written, ever (architecture §4.1). Soft-deleted rows are excluded
 * here; tombstones only surface through `changes_since` on reconnect (§4.3).
 */

/** The full non-deleted task list. */
export async function fetchTasks(client: LitmusSupabaseClient): Promise<TaskRow[]> {
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .is('deleted_at', null)
    .order('created_at');
  if (error) throw error;
  return data;
}

/**
 * The Week Board slice (FR-9, S-6.1): tasks whose `due_date` falls inside one
 * Monday→Sunday range. The bounds are inclusive ISO dates computed by the
 * caller — the query stays a pure function of them.
 */
export async function fetchWeekTasks(
  client: LitmusSupabaseClient,
  range: { from: string; to: string },
): Promise<TaskRow[]> {
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .is('deleted_at', null)
    .gte('due_date', range.from)
    .lte('due_date', range.to)
    .order('created_at');
  if (error) throw error;
  return data;
}

/** The global category reference data (FR-37) — readable by every signed-in user. */
export async function fetchCategories(client: LitmusSupabaseClient): Promise<CategoryRow[]> {
  const { data, error } = await client.from('categories').select('*').order('position');
  if (error) throw error;
  return data;
}

/** The full non-deleted project list. */
export async function fetchProjects(client: LitmusSupabaseClient): Promise<ProjectRow[]> {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('created_at');
  if (error) throw error;
  return data;
}
