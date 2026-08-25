export * from './client';
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database.types';
export type { TaskRow, ProjectRow, SubtaskRow } from './rows';

// Query layer (S-3.4): provider, client defaults, key scheme, read hooks.
export { ApiProvider, useSupabase, type ApiProviderProps } from './query/ApiProvider';
export { createQueryClient } from './query/queryClient';
export { taskKeys, projectKeys } from './query/keys';
export { fetchTasks, fetchProjects } from './query/queries';
export { useTasks, useTask, useProjects, useProject } from './query/hooks';

// Mutation layer (S-3.5): partial-only updates (FR-8).
export { updateTask, updateProject, type TaskPatch, type ProjectPatch } from './mutations';
