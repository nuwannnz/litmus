import { useEffect, useRef, type FocusEvent, type MouseEvent } from 'react';
import { Checkbox, Icon } from '@litmus/ui';
import type { NoteBlock } from '../noteBody';

export interface NoteBlocksProps {
  blocks: NoteBlock[];
  onEditHtml: (blockIndex: number, html: string) => void;
  onToggleCheck: (blockIndex: number, itemIndex: number) => void;
  onOpenNote: (noteId: string) => void;
}

/**
 * Renders a parsed note body. Prose is editable HTML; checklists and callouts
 * are components so their controls stay interactive.
 */
export function NoteBlocks({ blocks, onEditHtml, onToggleCheck, onOpenNote }: NoteBlocksProps) {
  const followNoteLink = (e: MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-note]');
    if (!link) return;
    e.preventDefault();
    const noteId = link.dataset['note'];
    if (noteId) onOpenNote(noteId);
  };

  return (
    <div className="note-body note-blocks" onClick={followNoteLink}>
      {blocks.map((block, index) => {
        if (block.kind === 'html') {
          return (
            <HtmlBlock key={index} html={block.raw} onCommit={(html) => onEditHtml(index, html)} />
          );
        }
        if (block.kind === 'checklist') {
          return (
            <div key={index} className="checklist">
              {block.items.map((item, itemIndex) => (
                <div key={itemIndex} className={`note-check ${item.done ? 'is-done' : ''}`}>
                  <Checkbox
                    checked={item.done}
                    label={item.label}
                    onToggle={() => onToggleCheck(index, itemIndex)}
                  />
                  <span dangerouslySetInnerHTML={{ __html: item.label }} />
                </div>
              ))}
            </div>
          );
        }
        return (
          <div key={index} className="callout">
            <Icon name="bulb" />
            <div>
              <b dangerouslySetInnerHTML={{ __html: block.title }} />
              <p dangerouslySetInnerHTML={{ __html: block.body }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Editable prose. Left uncontrolled while focused so the caret holds still. */
function HtmlBlock({ html, onCommit }: { html: string; onCommit: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerHTML !== html) {
      el.innerHTML = html;
    }
  }, [html]);

  const commit = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.currentTarget.innerHTML;
    if (next !== html) onCommit(next);
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={commit}
    />
  );
}
