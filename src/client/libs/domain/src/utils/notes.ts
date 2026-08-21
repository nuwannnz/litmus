import type { Note, NoteFolder, NoteNode } from '../types';

export const isFolder = (node: NoteNode): node is NoteFolder => node.type === 'folder';
export const isNote = (node: NoteNode): node is Note => node.type === 'note';

export function walkNotes(nodes: NoteNode[], visit: (node: NoteNode) => void): void {
  for (const node of nodes) {
    visit(node);
    if (isFolder(node)) walkNotes(node.children, visit);
  }
}

export function findNode(nodes: NoteNode[], id: string): NoteNode | null {
  let hit: NoteNode | null = null;
  walkNotes(nodes, (n) => {
    if (n.id === id) hit = n;
  });
  return hit;
}

export function findNote(nodes: NoteNode[], id: string): Note | null {
  const node = findNode(nodes, id);
  return node && isNote(node) ? node : null;
}

export function flattenNotes(nodes: NoteNode[]): Note[] {
  const out: Note[] = [];
  walkNotes(nodes, (n) => {
    if (isNote(n)) out.push(n);
  });
  return out;
}

/** Ids of every folder on the path from the roots down to `id`, exclusive. */
export function ancestorFolderIds(nodes: NoteNode[], id: string): string[] {
  const path: string[] = [];
  const search = (list: NoteNode[], trail: string[]): boolean => {
    for (const node of list) {
      if (node.id === id) {
        path.push(...trail);
        return true;
      }
      if (isFolder(node) && search(node.children, [...trail, node.id])) return true;
    }
    return false;
  };
  search(nodes, []);
  return path;
}

/** Returns a new tree with `id` replaced by `update(node)`. */
export function mapNode(
  nodes: NoteNode[],
  id: string,
  update: (node: NoteNode) => NoteNode,
): NoteNode[] {
  return nodes.map((node) => {
    if (node.id === id) return update(node);
    if (isFolder(node)) return { ...node, children: mapNode(node.children, id, update) };
    return node;
  });
}

/** Returns a new tree with every folder in `ids` opened. */
export function openFolders(nodes: NoteNode[], ids: string[]): NoteNode[] {
  if (ids.length === 0) return nodes;
  return nodes.map((node) => {
    if (!isFolder(node)) return node;
    const children = openFolders(node.children, ids);
    const open = node.open || ids.includes(node.id);
    return open === node.open && children === node.children ? node : { ...node, open, children };
  });
}
