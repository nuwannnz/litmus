import type { ReactElement } from 'react';
import { isFolder, type NoteNode } from '@litmus/domain';
import { Icon } from '@litmus/ui';

export interface NoteTreeProps {
  nodes: NoteNode[];
  activeNoteId: string | null;
  query: string;
  onSelectNote: (noteId: string) => void;
  onToggleFolder: (folderId: string) => void;
}

export function NoteTree({
  nodes,
  activeNoteId,
  query,
  onSelectNote,
  onToggleFolder,
}: NoteTreeProps) {
  const q = query.trim().toLowerCase();
  const branch = renderBranch(nodes, { activeNoteId, q, onSelectNote, onToggleFolder });

  return (
    <div className="tree" role="tree">
      {branch.length ? (
        branch
      ) : (
        <p className="muted tree-empty">No notes found.</p>
      )}
    </div>
  );
}

interface BranchContext {
  activeNoteId: string | null;
  q: string;
  onSelectNote: (noteId: string) => void;
  onToggleFolder: (folderId: string) => void;
}

/** A search hides folders whose name and whose whole subtree miss the query. */
function renderBranch(nodes: NoteNode[], ctx: BranchContext): ReactElement[] {
  const out: ReactElement[] = [];

  for (const node of nodes) {
    if (isFolder(node)) {
      const children = renderBranch(node.children, ctx);
      const selfMatches = node.name.toLowerCase().includes(ctx.q);
      if (ctx.q && !children.length && !selfMatches) continue;
      const expanded = node.open || Boolean(ctx.q);
      out.push(
        <div key={node.id} role="treeitem" aria-expanded={expanded}>
          <button
            type="button"
            className={`tree-row is-folder ${node.open ? 'is-open' : ''}`}
            onClick={() => ctx.onToggleFolder(node.id)}
          >
            <Icon name="right" size="sm" className="caret" />
            <Icon name="folder" size="sm" />
            <span>{node.name}</span>
          </button>
          {expanded && <div className="tree-children">{children}</div>}
        </div>,
      );
      continue;
    }

    if (ctx.q && !node.name.toLowerCase().includes(ctx.q)) continue;
    out.push(
      <button
        key={node.id}
        type="button"
        role="treeitem"
        aria-selected={ctx.activeNoteId === node.id}
        className={`tree-row ${ctx.activeNoteId === node.id ? 'is-active' : ''}`}
        onClick={() => ctx.onSelectNote(node.id)}
      >
        <span className="tree-indent" />
        <Icon name="file" size="sm" />
        <span>{node.name}</span>
      </button>,
    );
  }

  return out;
}
