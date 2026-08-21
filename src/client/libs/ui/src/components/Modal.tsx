import { useEffect, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './IconButton';

export interface ScrimProps {
  onDismiss: () => void;
  /** Pin the panel to the top of the viewport, as the command palette does. */
  alignTop?: boolean;
  children: ReactNode;
}

/** Full-screen dim layer. Closes on Escape and on a click outside the panel. */
export function Scrim({ onDismiss, alignTop = false, children }: ScrimProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onDismiss();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return createPortal(
    <div
      className="scrim"
      style={alignTop ? { alignItems: 'flex-start' } : undefined}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

export interface ModalProps {
  title: string;
  onClose: () => void;
  wide?: boolean;
  footer?: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

export function Modal({ title, onClose, wide = false, footer, onSubmit, children }: ModalProps) {
  const body = (
    <>
      <header className="modal-head">
        <h2>{title}</h2>
        <IconButton icon="x" label="Close" onClick={onClose} />
      </header>
      <div className="modal-body">{children}</div>
      {footer && <footer className="modal-foot">{footer}</footer>}
    </>
  );

  const className = ['modal', wide ? 'modal--wide' : ''].filter(Boolean).join(' ');

  return (
    <Scrim onDismiss={onClose}>
      {onSubmit ? (
        <form className={className} role="dialog" aria-label={title} onSubmit={onSubmit}>
          {body}
        </form>
      ) : (
        <div className={className} role="dialog" aria-label={title}>
          {body}
        </div>
      )}
    </Scrim>
  );
}
