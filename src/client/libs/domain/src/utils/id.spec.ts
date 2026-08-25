import { afterEach, describe, expect, it, vi } from 'vitest';

import { uuidv7 } from './id';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('uuidv7', () => {
  it('S-3.6: generated ids are RFC 9562 UUIDv7 — version nibble is 7', () => {
    for (let i = 0; i < 100; i += 1) {
      expect(uuidv7()).toMatch(/^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[\da-f]{4}-[\da-f]{12}$/);
    }
  });

  it('S-3.6: generated ids are RFC 9562 UUIDv7 — variant bits are 10xx', () => {
    for (let i = 0; i < 100; i += 1) {
      expect(parseInt(uuidv7()[19] ?? '', 16) & 0b1100).toBe(0b1000);
    }
  });

  it('S-3.6: the first 48 bits are the unix timestamp in milliseconds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-25T12:00:00Z'));
    const id = uuidv7();
    const tsBits = BigInt(`0x${id.slice(0, 8)}${id.slice(9, 13)}`);
    expect(tsBits).toBe(BigInt(Date.now()));
  });

  it('S-3.6: ids sort in creation order (time-ordered)', () => {
    const ids: string[] = [];
    for (let ms = 0; ms < 5; ms += 1) {
      vi.useFakeTimers();
      vi.setSystemTime(1_700_000_000_000 + ms);
      ids.push(uuidv7());
    }
    expect([...ids].sort()).toEqual(ids);
    for (let i = 1; i < ids.length; i += 1) {
      expect((ids[i - 1] ?? '') < (ids[i] ?? '')).toBe(true);
    }
  });

  it('does not repeat itself across a burst of creations', () => {
    const ids = new Set(Array.from({ length: 250 }, () => uuidv7()));
    expect(ids.size).toBe(250);
  });
});
