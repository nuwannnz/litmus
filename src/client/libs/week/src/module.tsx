import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  appPaths,
  useRegisterCommands,
  useTasks,
  type AppModule,
  type Command,
} from '@litmus/core';
import { WeekPage } from './WeekPage';

/** Publishes "Go to Week" plus one command per task on the board. */
function WeekCommands() {
  const navigate = useNavigate();
  const tasks = useTasks();

  const commands = useMemo<Command[]>(
    () => [
      {
        id: 'week:goto',
        group: 'Go to',
        label: 'Week',
        icon: 'calendar',
        run: () => navigate(appPaths.week),
      },
      ...tasks.map<Command>((task) => ({
        id: `week:task:${task.id}`,
        group: 'Tasks',
        label: task.title,
        icon: 'checkbox',
        hint: task.time,
        run: () => navigate(appPaths.task(task.id)),
      })),
    ],
    [navigate, tasks],
  );

  useRegisterCommands('week', commands);
  return null;
}

export const weekModule: AppModule = {
  id: 'week',
  label: 'Week',
  icon: 'calendar',
  path: 'week',
  routes: [{ index: true, element: <WeekPage /> }],
  Bridge: WeekCommands,
};
