import {
  CATEGORIES,
  PEOPLE,
  PRIORITIES,
  categoryColor,
  type CategoryName,
  type Priority,
  type Project,
  type Task,
} from '@litmus/domain';
import { Avatar, Chip, Dot, Icon, type IconName } from '@litmus/ui';

interface MetaRowProps {
  icon: IconName;
  label: string;
  children: React.ReactNode;
}

function MetaRow({ icon, label, children }: MetaRowProps) {
  return (
    <div className="meta-row">
      <Icon name={icon} />
      <span className="k">{label}</span>
      <span className="v">{children}</span>
    </div>
  );
}

export interface TaskMetaListProps {
  task: Task;
  project: Project | null;
  projects: Project[];
  onPatch: (patch: Partial<Task>) => void;
}

export function TaskMetaList({ task, project, projects, onPatch }: TaskMetaListProps) {
  const assignee = PEOPLE[task.assignee];

  return (
    <div className="meta-list">
      <MetaRow icon="tag" label="Category">
        <Chip color={categoryColor(task.category)} dot>
          <select
            value={task.category}
            aria-label="Category"
            onChange={(e) => onPatch({ category: e.target.value as CategoryName })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Chip>
      </MetaRow>

      <MetaRow icon="folder" label="Project">
        <select
          value={task.projectId ?? ''}
          aria-label="Project"
          onChange={(e) => onPatch({ projectId: e.target.value || null })}
        >
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {project && <Dot color={project.color} />}
      </MetaRow>

      <MetaRow icon="calendar" label="Date">
        <input
          type="date"
          value={task.day}
          aria-label="Due date"
          onChange={(e) => e.target.value && onPatch({ day: e.target.value })}
        />
      </MetaRow>

      <MetaRow icon="clock" label="Time">
        {task.time || '—'}
        {task.timeEnd ? ` – ${task.timeEnd}` : ''}
      </MetaRow>

      <MetaRow icon="flag" label="Priority">
        <select
          value={task.priority}
          aria-label="Priority"
          onChange={(e) => onPatch({ priority: e.target.value as Priority })}
        >
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </MetaRow>

      <MetaRow icon="user" label="Assignee">
        <Avatar person={task.assignee} />
        {assignee.name}
      </MetaRow>
    </div>
  );
}
