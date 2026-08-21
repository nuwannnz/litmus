import { useEffect, useRef } from 'react';

export type Hotkeys = Record<string, (e: KeyboardEvent) => void>;

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
};

/**
 * Binds document-level shortcuts. Keys are matched case-insensitively and
 * prefixed with `mod+` for ⌘/Ctrl. Bare keys are ignored while typing.
 */
export function useHotkeys(keys: Hotkeys, enabled = true) {
  const ref = useRef(keys);
  ref.current = keys;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const combo = `${mod ? 'mod+' : ''}${e.key.toLowerCase()}`;
      const handler = ref.current[combo];
      if (!handler) return;
      if (!mod && e.key !== 'Escape' && isTypingTarget(e.target)) return;
      handler(e);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
