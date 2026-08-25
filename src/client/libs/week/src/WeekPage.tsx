import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  buildWeek,
  formatWeekLabel,
  longDayName,
  pluralize,
  startOfWeek,
  toIso,
  uuidv7,
  type CategoryName,
  type Task,
} from '@litmus/domain';
import { appPaths, useTask as useWorkspaceTask } from '@litmus/core';
import {
  updateTask,
  useCategories,
  useInsertTask,
  useProjects as useApiProjects,
  useRefreshTasks,
  useSupabase,
  useWeekTasks,
  type TaskRow,
} from '@litmus/api';
import {
  Button,
  EmptyState,
  Icon,
  SearchInput,
  Stepper,
  View,
  ViewHeader,
  useHotkeys,
  useToast,
} from '@litmus/ui';
import { DayColumn } from './components/DayColumn';
import { DayPills } from './components/DayPills';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import './week.css';

/**
 * S-6.1 — the pattern-proving surface. The board's tasks come from TanStack
 * Query over Supabase (`useWeekTasks`, FR-9: due date inside one Monday→Sunday
 * range, soft-deletes excluded by the query itself), not from the workspace
 * reducer. The writes this surface drives — create and drag-to-move — go
 * through the API now too. Detail-panel editing still dispatches into the
 * prototype reducer until its stories land (S-7.x).
 */

/** Map a database row onto the card/column view model (§3.1 reconciliation is S-3.7's job). */
function toViewModel(row: TaskRow, categoryName: string | undefined): Task {
  return {
    id: row.id,
    title: row.title,
    day: row.due_date,
    category: (categoryName ?? 'Personal') as CategoryName,
    projectId: row.project_id,
    time: row.start_time ?? '',
    timeEnd: row.end_time ?? '',
    status: row.status,
    priority: 'Medium',
    assignee: 'NK',
    desc: row.description ?? '',
    noteIds: [],
    subtasks: [],
  };
}

const failureMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong — try again.';

export function WeekPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const supabase = useSupabase();
  const refreshTasks = useRefreshTasks();

  // The board runs on the real clock — no more fixed seed dates.
  const todayIso = toIso(new Date());
  const [searchParams, setSearchParams] = useSearchParams();
  const openTaskId = searchParams.get('task');

  const [weekOffset, setWeekOffset] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>(todayIso);
  const [composerDay, setComposerDay] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const days = useMemo(
    () => buildWeek(startOfWeek(todayIso), weekOffset, todayIso),
    [todayIso, weekOffset],
  );
  const range = useMemo(
    () => ({ from: days[0]?.iso ?? '', to: days[days.length - 1]?.iso ?? '' }),
    [days],
  );

  // Real data: the week slice plus the reference data the cards render.
  const rows = useWeekTasks(range);
  const categories = useCategories();
  const projects = useApiProjects();
  const insertTask = useInsertTask();

  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const projectNameById = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  // FR-35: a task appears in exactly one column, solely by its due date.
  // Undated rows cannot be in the slice at all — the query filtered on due_date.
  const visible = useMemo(() => {
    const mapped = rows.map((row) => toViewModel(row, categoryNameById.get(row.category_id ?? '')));
    const q = query.trim().toLowerCase();
    if (!q) return mapped;
    return mapped.filter((t) => {
      const haystack = `${t.title} ${t.category} ${projectNameById.get(t.projectId ?? '') ?? ''}`;
      return haystack.toLowerCase().includes(q);
    });
  }, [rows, categoryNameById, projectNameById, query]);

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>(days.map((d) => [d.iso, []]));
    for (const task of visible) if (task.day) map.get(task.day)?.push(task);
    return map;
  }, [days, visible]);

  const weekTaskCount = useMemo(
    () => days.reduce((n, d) => n + (byDay.get(d.iso)?.length ?? 0), 0),
    [days, byDay],
  );

  // Keep the phone day picker pointed at a day that exists in this week.
  const activeDay = days.some((d) => d.iso === selectedDay)
    ? selectedDay
    : (days[3]?.iso ?? todayIso);

  const openTaskById = useCallback(
    (taskId: string | null) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          if (taskId) next.set('task', taskId);
          else next.delete('task');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const startComposing = useCallback(() => {
    const today = days.find((d) => d.isToday) ?? days[0];
    if (today) setComposerDay(today.iso);
  }, [days]);

  const createTask = (day: string) => async (title: string, category: CategoryName) => {
    try {
      await insertTask.mutateAsync({
        id: uuidv7(),
        title,
        due_date: day,
        category_id: categories.find((c) => c.name === category)?.id ?? null,
      });
      setComposerDay(null);
      toast('Task added', 'plus');
    } catch (error) {
      toast(failureMessage(error), 'plus');
    }
  };

  const moveTask = async (taskId: string, day: string) => {
    setDraggingTaskId(null);
    const row = rows.find((r) => r.id === taskId);
    if (!row || row.due_date === day) return;
    try {
      await updateTask(supabase, taskId, { due_date: day });
      await refreshTasks();
      toast(`Moved to ${longDayName(day)}`, 'arrow-right');
    } catch (error) {
      toast(failureMessage(error), 'arrow-right');
    }
  };

  // The panel opens off the server row; its edits stay prototype-only for now.
  const openWorkspaceTask = useWorkspaceTask(openTaskId);
  const openRow = openTaskId ? (rows.find((r) => r.id === openTaskId) ?? null) : null;
  const openTask = openRow
    ? toViewModel(openRow, categoryNameById.get(openRow.category_id ?? ''))
    : openWorkspaceTask;

  useHotkeys({
    arrowleft: () => setWeekOffset((o) => o - 1),
    arrowright: () => setWeekOffset((o) => o + 1),
    n: startComposing,
    escape: () => {
      // A modal or the palette owns Escape while it is open.
      if (document.querySelector('.scrim')) return;
      if (composerDay) setComposerDay(null);
      else if (openTaskId) openTaskById(null);
    },
  });

  const isEmptyWeek = weekTaskCount === 0;

  return (
    <View className={`week-view ${openTask ? 'panel-open' : ''}`}>
      <ViewHeader
        title="My Week"
        sub={`${formatWeekLabel(days)} · ${pluralize(weekTaskCount, 'task')}`}
        tools={
          <>
            <SearchInput
              className="desktop-only"
              value={query}
              onChange={setQuery}
              placeholder="Search tasks"
            />
            <Stepper
              prevLabel="Previous week"
              nextLabel="Next week"
              onPrev={() => setWeekOffset((o) => o - 1)}
              onNext={() => setWeekOffset((o) => o + 1)}
            />
            <Button
              onClick={() => {
                setWeekOffset(0);
                setSelectedDay(todayIso);
              }}
            >
              <Icon name="calendar" size="sm" /> Today
            </Button>
            <Button variant="primary" onClick={startComposing}>
              <Icon name="plus" size="sm" /> New Task
            </Button>
          </>
        }
      />

      <DayPills days={days} selected={activeDay} onSelect={setSelectedDay} />

      {isEmptyWeek && query.trim() ? (
        <EmptyState
          icon="search"
          title="No matches"
          body={`Nothing on this week matches “${query.trim()}”.`}
        />
      ) : (
        <div className="board">
          {days.map((day) => (
            <DayColumn
              key={day.iso}
              day={day}
              tasks={byDay.get(day.iso) ?? []}
              selectedDay={activeDay}
              openTaskId={openTaskId}
              draggingTaskId={draggingTaskId}
              composing={composerDay === day.iso}
              projectName={(task: Task) => projectNameById.get(task.projectId ?? '') ?? null}
              onOpenTask={openTaskById}
              onDropTask={moveTask}
              onStartComposing={() => setComposerDay(day.iso)}
              onCancelComposing={() => setComposerDay(null)}
              onCreateTask={createTask(day.iso)}
              onDragStateChange={setDraggingTaskId}
            />
          ))}
        </div>
      )}

      {openTask && (
        <TaskDetailPanel
          task={openTask}
          onClose={() => openTaskById(null)}
          onOpenNote={(noteId) => navigate(appPaths.note(noteId))}
        />
      )}
    </View>
  );
}
