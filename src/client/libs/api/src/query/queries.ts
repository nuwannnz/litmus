import type { LitmusSupabaseClient } from '../client';
import type { ProjectRow, TaskRow } from '../rows';

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
