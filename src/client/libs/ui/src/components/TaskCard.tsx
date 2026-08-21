import type { DragEvent, ReactNode } from 'react';
import { categoryColor, type CategoryName } from '@litmus/domain';
import { Chip } from './Chip';
import { Icon } from '../icons';

export interface TaskCardProps {
  title: string;
  category: CategoryName;
  done?: boolean;
  selected?: boolean;
  dragging?: boolean;
  /** Project name shown under the title, when the task belongs to one. */
  projectName?: string | null;
  /** Right-hand side of the card foot: times, counts, an avatar. */
  meta?: ReactNode;
  /** Top-right slot, usually the overflow affordance. */
  trailing?: ReactNode;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLElement>) => void;
}

/**
 * The pastel task card. Shared by the Week board and the Project board — the
 * Week variant is clickable, the Project variant is only draggable.
 */
export function TaskCard({
  title,
  category,
  done = false,
  selected = false,
  dragging = false,
  projectName,
  meta,
  trailing,
  onClick,
  draggable = false,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const className = [
    'task',
    done ? 'is-done' : '',
    selected ? 'is-selected' : '',
    dragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <div className="task-top">
        <span className="task-title">{title}</span>
        {trailing}
      </div>
      {projectName && (
        <span className="task-project">
          <Icon name="folder" size="sm" />
          {projectName}
        </span>
      )}
      <div className="task-foot">
        <Chip color={categoryColor(category)} dot>
          {category}
        </Chip>
        {meta && <span className="task-meta">{meta}</span>}
      </div>
    </>
  );

  const dragProps = { draggable, onDragStart, onDragEnd };

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} {...dragProps}>
        {content}
      </button>
    );
  }

  return (
    <div className={className} {...dragProps}>
      {content}
    </div>
  );
}

/** The faint overflow dots in the top-right of a card. */
export function CardOverflow() {
  return (
    <span className="muted" style={{ opacity: 0.5 }} aria-hidden="true">
      <Icon name="more" size="sm" />
    </span>
  );
}
