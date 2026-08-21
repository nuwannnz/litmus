import { useCallback, useRef, useState, type DragEvent } from 'react';

export interface DropTargetOptions {
  /** dataTransfer type, so a Week card cannot be dropped on a Project column. */
  accept: string;
  onDrop: (payload: string) => void;
  disabled?: boolean;
}

export interface DropTargetResult {
  isOver: boolean;
  dropProps: {
    onDragOver: (e: DragEvent<HTMLElement>) => void;
    onDragEnter: (e: DragEvent<HTMLElement>) => void;
    onDragLeave: (e: DragEvent<HTMLElement>) => void;
    onDrop: (e: DragEvent<HTMLElement>) => void;
  };
}

/**
 * Native HTML5 drop zone. Enter/leave are counted because they also fire for
 * every child element the pointer crosses.
 */
export function useDropTarget({ accept, onDrop, disabled = false }: DropTargetOptions): DropTargetResult {
  const [isOver, setIsOver] = useState(false);
  const depth = useRef(0);

  const carriesPayload = (e: DragEvent<HTMLElement>) =>
    e.dataTransfer.types.includes(accept);

  const onDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (disabled || !carriesPayload(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    [disabled, accept],
  );

  const onDragEnter = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (disabled || !carriesPayload(e)) return;
      e.preventDefault();
      depth.current += 1;
      setIsOver(true);
    },
    [disabled, accept],
  );

  const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    if (disabled || !carriesPayload(e)) return;
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setIsOver(false);
  }, [disabled, accept]);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (disabled || !carriesPayload(e)) return;
      e.preventDefault();
      depth.current = 0;
      setIsOver(false);
      const payload = e.dataTransfer.getData(accept);
      if (payload) onDrop(payload);
    },
    [disabled, accept, onDrop],
  );

  return {
    isOver,
    dropProps: { onDragOver, onDragEnter, onDragLeave, onDrop: handleDrop },
  };
}
