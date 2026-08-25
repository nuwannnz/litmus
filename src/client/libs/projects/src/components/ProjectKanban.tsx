import type { DragEvent } from 'react';
import {
  STATUSES,
  STATUS_LABELS,
  formatShortDate,
  type Task,
  type TaskStatus,
} from '@litmus/domain';
import { Avatar, CountPill, Icon, TaskCard, useDropTarget } from '@litmus/ui';
import { PROJECT_TASK_DND } from '../constants';

export interface ProjectKanbanProps {
  tasks: Task[];
  draggingId: string | null;
  onDragStateChange: (taskId: string | null) => void;
  onMove: (taskId: string, status: TaskStatus) => void;
}

export function ProjectKanban({
  tasks,
  draggingId,
  onDragStateChange,
  onMove,
}: ProjectKanbanProps) {
  return (
    <div className="kanban">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status)}
          draggingId={draggingId}
          onDragStateChange={onDragStateChange}
          onMove={onMove}
        />
      ))}
    </div>
  );
}

interface KanbanColumnProps extends Omit<ProjectKanbanProps, 'tasks'> {
  status: TaskStatus;
  tasks: Task[];
}

function KanbanColumn({ status, tasks, draggingId, onDragStateChange, onMove }: KanbanColumnProps) {
  const { isOver, dropProps } = useDropTarget({
    accept: PROJECT_TASK_DND,
    onDrop: (taskId) => onMove(taskId, status),
  });

  return (
    <div
      className={`kanban-col ${isOver ? 'is-over' : ''}`}
      aria-label={STATUS_LABELS[status]}
      {...dropProps}
    >
      <div className="group-head">
        {STATUS_LABELS[status]}
        <CountPill count={tasks.length} />
      </div>
      <div className="kanban-list">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            dragging={draggingId === task.id}
            onDragStateChange={onDragStateChange}
          />
        ))}
      </div>
    </div>
  );
}

interface KanbanCardProps {
  task: Task;
  dragging: boolean;
  onDragStateChange: (taskId: string | null) => void;
}

function KanbanCard({ task, dragging, onDragStateChange }: KanbanCardProps) {
  const onDragStart = (e: DragEvent<HTMLElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(PROJECT_TASK_DND, task.id);
    onDragStateChange(task.id);
  };

  return (
    <TaskCard
      title={task.title}
      category={task.category}
      dragging={dragging}
      draggable
      onDragStart={onDragStart}
      onDragEnd={() => onDragStateChange(null)}
      meta={
        <>
          {task.day && (
            <span>
              <Icon name="calendar" size="sm" />
              {formatShortDate(task.day)}
            </span>
          )}
          <Avatar person={task.assignee} />
        </>
      }
    />
  );
}
