import { afterEach, describe, expect, it, vi } from 'vitest';

import { uid } from './id';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('uid', () => {
  it('keeps the caller prefix verbatim at the front', () => {
    expect(uid('t-')).toMatch(/^t-/);
    expect(uid('note-')).toMatch(/^note-/);
    expect(uid('p')).toMatch(/^p/);
  });

  it('appends at most six lowercase base-36 characters', () => {
    for (let i = 0; i < 100; i += 1) {
      expect(uid('t-').slice(2)).toMatch(/^[0-9a-z]{0,6}$/);
    }
  });

  it('tolerates an empty prefix', () => {
    expect(uid('')).toMatch(/^[0-9a-z]{0,6}$/);
  });

  it('does not repeat itself across a burst of creations', () => {
    const ids = new Set(Array.from({ length: 250 }, () => uid('t-')));
    expect(ids.size).toBe(250);
  });

  it('draws its suffix from Math.random', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(uid('t-')).toBe('t-i'); // (0.5).toString(36) === '0.i'
    expect(random).toHaveBeenCalledTimes(1);
  });

  // Documented weakness, not a desired behaviour: the suffix is whatever base-36
  // digits Math.random happens to produce, so it is *up to* six characters and
  // can be empty. Ids are client-side and optimistic today (the API will own
  // them), but tighten this before they are ever persisted.
  it('degenerates to the bare prefix when Math.random returns exactly 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(uid('t-')).toBe('t-');
  });
});
