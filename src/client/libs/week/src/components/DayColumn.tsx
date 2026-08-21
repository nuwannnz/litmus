import type { CategoryName, Task, WeekDay } from '@litmus/domain';
import { CountPill, useDropTarget } from '@litmus/ui';
import { WEEK_TASK_DND } from '../constants';
import { WeekTaskCard } from './WeekTaskCard';
import { AddTaskButton, TaskComposer } from './TaskComposer';

export interface DayColumnProps {
  day: WeekDay;
  tasks: Task[];
  selectedDay: string;
  openTaskId: string | null;
  draggingTaskId: string | null;
  composing: boolean;
  projectName: (task: Task) => string | null;
  onOpenTask: (taskId: string) => void;
  onDropTask: (taskId: string, day: string) => void;
  onStartComposing: () => void;
  onCancelComposing: () => void;
  onCreateTask: (title: string, category: CategoryName) => void;
  onDragStateChange: (taskId: string | null) => void;
}

export function DayColumn({
  day,
  tasks,
  selectedDay,
  openTaskId,
  draggingTaskId,
  composing,
  projectName,
  onOpenTask,
  onDropTask,
  onStartComposing,
  onCancelComposing,
  onCreateTask,
  onDragStateChange,
}: DayColumnProps) {
  const { isOver, dropProps } = useDropTarget({
    accept: WEEK_TASK_DND,
    onDrop: (taskId) => onDropTask(taskId, day.iso),
  });

  const className = [
    'day',
    day.isToday ? 'is-today' : '',
    day.iso === selectedDay ? 'is-selected' : '',
    isOver ? 'is-over' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={className} aria-label={day.long}>
      <header className="day-head">
        <span className="day-name">{day.name}</span>
        <span className="day-num">{day.num}</span>
        <CountPill count={tasks.length} />
      </header>
      <div className="day-list" {...dropProps}>
        {tasks.map((task) => (
          <WeekTaskCard
            key={task.id}
            task={task}
            projectName={projectName(task)}
            selected={openTaskId === task.id}
            dragging={draggingTaskId === task.id}
            onOpen={() => onOpenTask(task.id)}
            onDragStateChange={onDragStateChange}
          />
        ))}
        {composing ? (
          <TaskComposer onCreate={onCreateTask} onCancel={onCancelComposing} />
        ) : (
          <AddTaskButton onClick={onStartComposing} />
        )}
      </div>
    </section>
  );
}
