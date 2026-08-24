import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

/**
 * The primitives carry no product logic, so these assertions cover the two
 * things a caller can get wrong by accident: the class string the CSS hangs
 * off, and the implicit `type` that would otherwise submit a form.
 */
describe('Button', () => {
  it('renders its children inside a real button element', () => {
    render(<Button>Add task</Button>);

    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument();
  });

  it('defaults to type="button", so it never submits a surrounding form', () => {
    render(<Button>Cancel</Button>);

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
  });

  it('composes the variant, size and block classes onto the base class', () => {
    render(
      <Button variant="primary" size="lg" block className="custom">
        Save
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      'btn',
      'btn--primary',
      'btn--lg',
      'btn--block',
      'custom',
    );
  });

  it('forwards the click to its handler', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Done</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('swallows clicks while disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Done
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
