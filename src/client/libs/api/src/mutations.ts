import type { LitmusSupabaseClient } from './client';
import type { ProjectRow, TaskRow } from './rows';

/**
 * The mutation surface (S-3.5, realising FR-8): update functions that accept
 * **only partials** and send only the changed fields.
 *
 * Why the shape is strict: per-field last-write-wins comes for free from
 * PostgREST's patch-shaped `.update()` — two devices editing different columns
 * both survive, and the same field resolves to last-write-to-arrive
 * (architecture §4.2). That guarantee dies the moment a caller writes a whole
 * row back from form state, so these types make that impossible: every column
 * outside the user-editable set is declared `never`, which turns "pass the
 * whole `TaskRow`" into a compile error rather than a review comment.
 *
 * Deliberately absent, per §4.2: no field-level timestamps, no vector clocks,
 * no CRDT.
 */

export type TaskPatch = Partial<
  Pick<
    TaskRow,
    | 'title'
    | 'description'
    | 'due_date'
    | 'start_time'
    | 'end_time'
    | 'status'
    | 'priority'
    | 'project_id'
    | 'category_id'
    | 'position'
  >
> & {
  /** Identity, ownership and audit columns are never client-writable. */
  id?: never;
  user_id?: never;
  created_at?: never;
  updated_at?: never;
  deleted_at?: never;
  search_vector?: never;
};

export type ProjectPatch = Partial<
  Pick<
    ProjectRow,
    'name' | 'color' | 'description' | 'about' | 'status' | 'priority' | 'due_date' | 'position'
  >
> & {
  /** Identity, ownership and audit columns are never client-writable. */
  id?: never;
  user_id?: never;
  created_at?: never;
  updated_at?: never;
  deleted_at?: never;
  search_vector?: never;
};

function assertNonEmpty(table: string, patch: Record<string, unknown>): void {
  if (Object.keys(patch).length === 0) {
    throw new Error(`Refusing an empty ${table} patch — send only the changed fields.`);
  }
}

/** Patch one task's changed fields only (FR-8). RLS scopes it to the owner. */
export async function updateTask(
  client: LitmusSupabaseClient,
  id: string,
  patch: TaskPatch,
): Promise<void> {
  assertNonEmpty('task', patch);
  const { error } = await client.from('tasks').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Patch one project's changed fields only (FR-8). RLS scopes it to the owner. */
export async function updateProject(
  client: LitmusSupabaseClient,
  id: string,
  patch: ProjectPatch,
): Promise<void> {
  assertNonEmpty('project', patch);
  const { error } = await client.from('projects').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}
