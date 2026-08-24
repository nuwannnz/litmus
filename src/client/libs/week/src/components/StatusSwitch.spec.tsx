import { STATUS_LABELS } from '@litmus/domain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StatusSwitch } from './StatusSwitch';

/**
 * A feature-lib test as well as a `StatusSwitch` test: it renders a component
 * that reaches across to `@litmus/domain` for its labels, which is what proves
 * the shared config resolves the `@litmus/*` aliases from source under jsdom.
 */
describe('StatusSwitch', () => {
  it('offers one button per status, labelled from the domain constants', () => {
    render(<StatusSwitch value="todo" onChange={vi.fn()} />);

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      STATUS_LABELS.todo,
      STATUS_LABELS.progress,
      STATUS_LABELS.done,
    ]);
  });

  it('marks only the current status as pressed', () => {
    render(<StatusSwitch value="progress" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: STATUS_LABELS.progress })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: STATUS_LABELS.todo })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reports the chosen status to its parent', async () => {
    const onChange = vi.fn();
    render(<StatusSwitch value="todo" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: STATUS_LABELS.done }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('done');
  });
});
