import type { Project } from '@litmus/domain';
import { AvatarStack, CardOverflow, Icon, Progress } from '@litmus/ui';

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button type="button" className="project-card" data-color={project.color} onClick={onOpen}>
      <div className="project-head">
        <span className="project-icon">
          <Icon name="folder" size="lg" />
        </span>
        <span className="project-head-text">
          <span className="project-name">{project.name}</span>
          <span className="project-count">{project.taskCount} tasks</span>
        </span>
        <CardOverflow />
      </div>
      <p className="project-desc">{project.desc}</p>
      <div>
        <div className="progress-row">
          <span>Progress</span>
          <b>{project.progress}%</b>
        </div>
        <Progress value={project.progress} />
      </div>
      <div className="project-foot">
        <span className="row gap-6">
          <Icon name="calendar" size="sm" /> {project.due} due this week
        </span>
        <AvatarStack people={project.team} />
      </div>
    </button>
  );
}
