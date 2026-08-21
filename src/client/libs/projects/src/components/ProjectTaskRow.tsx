import { PEOPLE, categoryColor, type ProjectTask } from '@litmus/domain';
import { Avatar, Checkbox, Chip, Icon } from '@litmus/ui';

export interface ProjectTaskRowProps {
  task: ProjectTask;
  onToggle: () => void;
}

export function ProjectTaskRow({ task, onToggle }: ProjectTaskRowProps) {
  return (
    <div className={`ptask ${task.status === 'done' ? 'is-done' : ''}`}>
      <Checkbox checked={task.status === 'done'} label={task.title} onToggle={onToggle} />
      <span className="t">{task.title}</span>
      <Chip color={categoryColor(task.category)} dot>
        {task.category}
      </Chip>
      {task.due && (
        <Chip plain>
          <Icon name="calendar" size="sm" /> {task.due}
        </Chip>
      )}
      <Avatar person={PEOPLE[task.assignee].id} />
    </div>
  );
}
