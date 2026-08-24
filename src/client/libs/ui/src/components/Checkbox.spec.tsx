import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './Checkbox';

/**
 * `Checkbox` is a `<button>` wearing `role="checkbox"`, so the accessible name
 * and `aria-checked` are the whole contract — a query by role is the only way
 * to prove it is reachable the way a native checkbox would be.
 */
describe('Checkbox', () => {
  it('exposes its label and checked state to assistive tech', () => {
    render(<Checkbox checked label="Complete task" onToggle={vi.fn()} />);

    expect(screen.getByRole('checkbox', { name: 'Complete task' })).toBeChecked();
  });

  it('renders unchecked when told to', () => {
    render(<Checkbox checked={false} label="Complete task" onToggle={vi.fn()} />);

    expect(screen.getByRole('checkbox', { name: 'Complete task' })).not.toBeChecked();
  });

  it('calls onToggle on click without bubbling to an enclosing card', async () => {
    const onToggle = vi.fn();
    const onCardClick = vi.fn();
    render(
      // Stands in for a task card, which opens the detail panel when clicked.
      <div onClick={onCardClick}>
        <Checkbox checked={false} label="Complete task" onToggle={onToggle} />
      </div>,
    );

    await userEvent.click(screen.getByRole('checkbox', { name: 'Complete task' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });
});
