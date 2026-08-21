import type { DragEvent } from 'react';
import type { Task } from '@litmus/domain';
import { CardOverflow, Icon, TaskCard } from '@litmus/ui';
import { WEEK_TASK_DND } from '../constants';

export interface WeekTaskCardProps {
  task: Task;
  projectName: string | null;
  selected: boolean;
  dragging: boolean;
  onOpen: () => void;
  onDragStateChange: (taskId: string | null) => void;
}

export function WeekTaskCard({
  task,
  projectName,
  selected,
  dragging,
  onOpen,
  onDragStateChange,
}: WeekTaskCardProps) {
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;

  const onDragStart = (e: DragEvent<HTMLElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(WEEK_TASK_DND, task.id);
    onDragStateChange(task.id);
  };

  return (
    <TaskCard
      title={task.title}
      category={task.category}
      done={task.status === 'done'}
      selected={selected}
      dragging={dragging}
      projectName={projectName}
      trailing={<CardOverflow />}
      onClick={onOpen}
      draggable
      onDragStart={onDragStart}
      onDragEnd={() => onDragStateChange(null)}
      meta={
        <>
          {task.time && (
            <span>
              <Icon name="clock" size="sm" />
              {task.time}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span>
              <Icon name="checkbox" size="sm" />
              {doneSubtasks}/{task.subtasks.length}
            </span>
          )}
        </>
      }
    />
  );
}
