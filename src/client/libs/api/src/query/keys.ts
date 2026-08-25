/**
 * The query-key scheme — the whole of it, written down rather than inferred,
 * because every future `invalidateQueries` call depends on staying consistent
 * with it (S-3.4).
 *
 * The rules:
 *
 * 1. Every key is a readonly tuple whose **first element names the table**.
 *    Nothing else ever appears in slot zero, so scoping an invalidation to one
 *    table is always `queryKey: taskKeys.all`.
 * 2. A list key is a **prefix of everything derived from it**. Invalidating
 *    `taskKeys.all` refetches the full list, the week slice and every
 *    project-filtered slice; there is no case where a narrower invalidation is
 *    required for correctness.
 * 3. Variable segments come last, most selective last of all, and objects are
 *    used for multi-part params so key order inside the object never matters.
 * 4. Keys are built only through these factories — hand-rolled arrays in hooks
 *    or components are how invalidation bugs happen.
 */

/** Everything about tasks. Prefix of every task key below. */
export const taskKeys = {
  /** The full non-deleted task list. */
  all: ['tasks'] as const,
  /** The Week Board slice (FR-9) — tasks due within one Monday→Sunday range. */
  week: (range: { from: string; to: string }) => ['tasks', 'week', range] as const,
  /** Tasks belonging to one project — the Project Board slice. */
  byProject: (projectId: string) => ['tasks', 'project', projectId] as const,
};

/** Everything about projects. Prefix of every project key below. */
export const projectKeys = {
  /** The full non-deleted project list. */
  all: ['projects'] as const,
  /** One project by id. */
  detail: (id: string) => ['projects', id] as const,
};
