import { Icon } from '../icons';

export interface LinkedNoteProps {
  name: string;
  meta: string;
  onOpen: () => void;
}

export function LinkedNote({ name, meta, onOpen }: LinkedNoteProps) {
  return (
    <button type="button" className="linked-note" onClick={onOpen}>
      <Icon name="file" size="sm" />
      <span>
        <span className="t">{name}</span>
        <span className="s">{meta}</span>
      </span>
      <Icon name="out" size="sm" />
    </button>
  );
}
