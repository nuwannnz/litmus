import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  SEED_WEEK,
  buildWeek,
  formatWeekLabel,
  longDayName,
  pluralize,
  type CategoryName,
  type Task,
} from '@litmus/domain';
import { appPaths, useProjectLookup, useTask, useTasks, useWorkspaceDispatch } from '@litmus/core';
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

const matchesQuery = (task: Task, projectName: string | null, query: string): boolean => {
  const haystack = `${task.title} ${task.category} ${projectName ?? ''}`.toLowerCase();
  return haystack.includes(query);
};

export function WeekPage() {
  const dispatch = useWorkspaceDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const tasks = useTasks();
  const lookupProject = useProjectLookup();

  const [searchParams, setSearchParams] = useSearchParams();
  const openTaskId = searchParams.get('task');
  const openTask = useTask(openTaskId);

  const [weekOffset, setWeekOffset] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>(SEED_WEEK.todayIso);
  const [composerDay, setComposerDay] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const days = useMemo(
    () => buildWeek(SEED_WEEK.startIso, weekOffset, SEED_WEEK.todayIso),
    [weekOffset],
  );

  const projectName = useCallback(
    (task: Task) => lookupProject(task.projectId)?.name ?? null,
    [lookupProject],
  );

  // FR-35: the board shows exactly the tasks whose due date falls in this
  // week, whichever surface created them. Undated tasks belong elsewhere.
  const visible = useMemo(() => {
    const first = days[0]?.iso ?? '';
    const last = days[days.length - 1]?.iso ?? '';
    const inWeek = tasks.filter((t) => t.day !== null && t.day >= first && t.day <= last);
    const q = query.trim().toLowerCase();
    return q ? inWeek.filter((t) => matchesQuery(t, projectName(t), q)) : inWeek;
  }, [tasks, query, projectName, days]);

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
    : (days[3]?.iso ?? SEED_WEEK.todayIso);

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

  const createTask = (day: string) => (title: string, category: CategoryName) => {
    dispatch({ type: 'task/add', input: { title, day, category } });
    setComposerDay(null);
    toast('Task added', 'plus');
  };

  const moveTask = (taskId: string, day: string) => {
    setDraggingTaskId(null);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.day === day) return;
    dispatch({ type: 'task/move', id: taskId, day });
    toast(`Moved to ${longDayName(day)}`, 'arrow-right');
  };

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
                setSelectedDay(SEED_WEEK.todayIso);
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
              projectName={projectName}
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
