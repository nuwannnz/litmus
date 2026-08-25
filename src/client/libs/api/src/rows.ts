import type { Database } from './database.types';

/**
 * Row aliases over the generated schema — the shapes `libs/api`'s read hooks
 * hand back today.
 *
 * These are deliberately the **database** rows, not yet `@litmus/domain`'s
 * prototype types: reconciling the two (the reducer's seed-shaped fields that
 * have no column, and vice versa) is S-6.1/S-3.7's job, one surface at a time.
 * Until then callers of these hooks work against the schema, which §7.1 makes
 * the contract anyway.
 */
export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type SubtaskRow = Database['public']['Tables']['subtasks']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
