import type { Project } from '@litmus/domain';
import { AvatarStack, Dot, Progress } from '@litmus/ui';

export interface ProjectTableProps {
  projects: Project[];
  onOpen: (projectId: string) => void;
}

export function ProjectTable({ projects, onOpen }: ProjectTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Progress</th>
            <th>Tasks</th>
            <th>Due</th>
            <th>Team</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} onClick={() => onOpen(project.id)}>
              <td>
                <span className="cell-name">
                  <Dot color={project.color} />
                  <span>
                    <b>{project.name}</b>
                    <small>Updated {project.updated}</small>
                  </span>
                </span>
              </td>
              <td>
                <div className="row gap-10">
                  <Progress value={project.progress} color={project.color} style={{ flex: 1 }} />
                  <b style={{ fontSize: 12 }}>{project.progress}%</b>
                </div>
              </td>
              <td className="muted">{project.taskCount} tasks</td>
              <td className="muted">{project.due} due</td>
              <td>
                <AvatarStack people={project.team} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
