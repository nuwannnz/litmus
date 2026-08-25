export * from './client';
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database.types';
export type { TaskRow, ProjectRow, SubtaskRow, CategoryRow } from './rows';

// Query layer (S-3.4): provider, client defaults, key scheme, read hooks.
export { ApiProvider, useSupabase, type ApiProviderProps } from './query/ApiProvider';
export { createQueryClient } from './query/queryClient';
export { taskKeys, projectKeys, categoryKeys } from './query/keys';
export { fetchTasks, fetchProjects, fetchWeekTasks, fetchCategories } from './query/queries';
export {
  useTasks,
  useTask,
  useProjects,
  useProject,
  useWeekTasks,
  useCategories,
  useInsertTask,
  useRefreshTasks,
} from './query/hooks';

// Mutation layer (S-3.5): partial-only updates (FR-8).
export { updateTask, updateProject, type TaskPatch, type ProjectPatch } from './mutations';
