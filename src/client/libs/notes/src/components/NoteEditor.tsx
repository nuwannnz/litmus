import { useMemo, useRef } from 'react';
import type { Note, Project } from '@litmus/domain';
import { Chip, Editable, Icon, IconButton, Tag } from '@litmus/ui';
import { parseNoteBody, replaceBlock, toggleChecklistItem } from '../noteBody';
import { NoteBlocks } from './NoteBlocks';
import { FormatBar } from './FormatBar';

export interface NoteEditorProps {
  note: Note;
  project: Project | null;
  onRename: (name: string) => void;
  onChangeBody: (body: string) => void;
  onOpenProject: (projectId: string) => void;
  onOpenNote: (noteId: string) => void;
  onBackToList: () => void;
  onLink: () => void;
}

export function NoteEditor({
  note,
  project,
  onRename,
  onChangeBody,
  onOpenProject,
  onOpenNote,
  onBackToList,
  onLink,
}: NoteEditorProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const blocks = useMemo(() => parseNoteBody(note.body), [note.body]);

  return (
    <div className="editor">
      <div className="editor-bar">
        <IconButton
          icon="left"
          label="Back to note list"
          className="mobile-only"
          onClick={onBackToList}
        />
        <div className="crumbs">
          {project && (
            <>
              <button type="button" onClick={() => onOpenProject(project.id)}>
                {project.name}
              </button>
              <span>/</span>
            </>
          )}
          <b>{note.name}</b>
        </div>
        <span className="muted edited">{note.edited}</span>
        <IconButton icon="star" label="Favourite" />
        <IconButton icon="more" label="More actions" />
      </div>

      <div className="editor-scroll">
        <article className="doc" ref={scopeRef}>
          <Editable
            as="h1"
            value={note.name}
            singleLine
            placeholder="Note title"
            onCommit={onRename}
          />

          <div className="doc-meta">
            {project && (
              <>
                <span className="muted">Part of</span>
                <Chip color={project.color} dot>
                  {project.name}
                </Chip>
              </>
            )}
            {note.task && (
              <>
                <span className="muted">·</span>
                <Chip color="lav">
                  <Icon name="checkbox" size="sm" />
                  {note.task}
                </Chip>
              </>
            )}
            <button type="button" className="chip chip--plain link-chip" onClick={onLink}>
              <Icon name="plus" size="sm" /> {project ? 'Link' : 'Link project or task'}
            </button>
          </div>

          <div className="doc-tags">
            {note.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            <span>· {note.updated}</span>
          </div>

          <NoteBlocks
            blocks={blocks}
            onEditHtml={(index, html) => onChangeBody(replaceBlock(blocks, index, html))}
            onToggleCheck={(blockIndex, itemIndex) =>
              onChangeBody(toggleChecklistItem(blocks, blockIndex, itemIndex))
            }
            onOpenNote={onOpenNote}
          />
        </article>
      </div>

      <FormatBar scopeRef={scopeRef} />
    </div>
  );
}
