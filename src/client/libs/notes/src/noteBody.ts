/**
 * Note bodies are HTML with two shorthand blocks the editor renders as real
 * components: `[[checklist]]` lists and `<div data-callout>` boxes. Every block
 * keeps its exact source text so the body round-trips through an edit untouched.
 */

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export type NoteBlock =
  | { kind: 'html'; raw: string }
  | { kind: 'checklist'; raw: string; items: ChecklistItem[] }
  | { kind: 'callout'; raw: string; title: string; body: string };

const CHECKLIST = /\[\[checklist\]\]\n([\s\S]*?)\n\[\[\/checklist\]\]/g;
const CALLOUT = /<div data-callout><b>([\s\S]*?)<\/b><p>([\s\S]*?)<\/p><\/div>/g;
const BLOCK = new RegExp(`${CHECKLIST.source}|${CALLOUT.source}`, 'g');
const CHECK_LINE = /^- \[([ x])\] (.*)$/;

function parseChecklist(inner: string): ChecklistItem[] {
  return inner
    .split('\n')
    .map((line) => CHECK_LINE.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ done: m[1] === 'x', label: m[2] ?? '' }));
}

const serializeChecklist = (items: ChecklistItem[]): string =>
  `[[checklist]]\n${items.map((i) => `- [${i.done ? 'x' : ' '}] ${i.label}`).join('\n')}\n[[/checklist]]`;

export function parseNoteBody(body: string): NoteBlock[] {
  const blocks: NoteBlock[] = [];
  let cursor = 0;

  const pushHtml = (raw: string) => {
    if (raw.trim()) blocks.push({ kind: 'html', raw });
  };

  BLOCK.lastIndex = 0;
  for (let match = BLOCK.exec(body); match; match = BLOCK.exec(body)) {
    pushHtml(body.slice(cursor, match.index));
    const [raw, checklistInner, calloutTitle, calloutBody] = match;
    if (checklistInner !== undefined) {
      blocks.push({ kind: 'checklist', raw, items: parseChecklist(checklistInner) });
    } else {
      blocks.push({
        kind: 'callout',
        raw,
        title: calloutTitle ?? '',
        body: calloutBody ?? '',
      });
    }
    cursor = match.index + raw.length;
  }
  pushHtml(body.slice(cursor));

  return blocks;
}

export const serializeNoteBody = (blocks: NoteBlock[]): string =>
  blocks.map((b) => b.raw).join('\n');

/** Replaces one block's source, returning the rebuilt body. */
export function replaceBlock(blocks: NoteBlock[], index: number, raw: string): string {
  return serializeNoteBody(blocks.map((block, i) => (i === index ? { ...block, raw } : block)));
}

/** Flips one checklist item and returns the rebuilt body. */
export function toggleChecklistItem(
  blocks: NoteBlock[],
  blockIndex: number,
  itemIndex: number,
): string {
  const block = blocks[blockIndex];
  if (!block || block.kind !== 'checklist') return serializeNoteBody(blocks);
  const items = block.items.map((item, i) => (i === itemIndex ? { ...item, done: !item.done } : item));
  return replaceBlock(blocks, blockIndex, serializeChecklist(items));
}
