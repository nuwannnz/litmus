import { PEOPLE, type Note, type Project } from '@litmus/domain';
import { Avatar, CapsLabel, DashedButton, Dot, LinkedNote } from '@litmus/ui';

export interface ProjectSidebarProps {
  project: Project;
  notes: (Note | null)[];
  onOpenNote: (noteId: string) => void;
  onLinkNote: () => void;
}

export function ProjectSidebar({ project, notes, onOpenNote, onLinkNote }: ProjectSidebarProps) {
  const linked = notes.filter((n): n is Note => n !== null);

  return (
    <aside className="detail-side">
      <div className="side-card">
        <CapsLabel>About</CapsLabel>
        <p>{project.about}</p>
      </div>

      <div className="side-card">
        <CapsLabel>Details</CapsLabel>
        <div className="kv">
          <span className="k">Status</span>
          <span className="v">{project.status}</span>
        </div>
        <div className="kv">
          <span className="k">Priority</span>
          <span className="v">{project.priority}</span>
        </div>
        <div className="kv">
          <span className="k">Colour</span>
          <span className="v">
            <Dot color={project.color} /> {project.color}
          </span>
        </div>
        <div className="kv">
          <span className="k">Due date</span>
          <span className="v">{project.dueDate}</span>
        </div>
        <div className="kv">
          <span className="k">Created</span>
          <span className="v">{project.created}</span>
        </div>
      </div>

      <div className="side-card">
        <CapsLabel>Members · {project.members.length}</CapsLabel>
        {project.members.map((id) => (
          <div key={id} className="member">
            <Avatar person={id} />
            <span>
              <span className="n">{PEOPLE[id].name}</span>
              <span className="r">{PEOPLE[id].role}</span>
            </span>
          </div>
        ))}
        <DashedButton style={{ marginTop: 10 }}>Invite member</DashedButton>
      </div>

      <div className="side-card">
        <CapsLabel>Linked notes · {linked.length}</CapsLabel>
        {linked.length ? (
          linked.map((note) => (
            <LinkedNote
              key={note.id}
              name={note.name}
              meta={note.edited}
              onOpen={() => onOpenNote(note.id)}
            />
          ))
        ) : (
          <p className="muted" style={{ fontSize: 12.5 }}>
            No notes linked yet.
          </p>
        )}
        <DashedButton style={{ marginTop: 10 }} onClick={onLinkNote}>
          Link a note
        </DashedButton>
      </div>
    </aside>
  );
}
