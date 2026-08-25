import { describe, expect, it } from 'vitest';

import {
  addDays,
  buildWeek,
  formatWeekLabel,
  longDayName,
  parseIso,
  startOfWeek,
  toIso,
} from './date';

/**
 * These helpers deliberately work in *local* calendar time: a day column is a
 * day where the user is, not where the server is. Every assertion below is
 * therefore written to hold in any timezone.
 */
describe('toIso', () => {
  it('zero-pads single-digit months and days', () => {
    expect(toIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('reads local calendar fields, so a late-evening date never rolls forward', () => {
    // `toISOString()` would report 2026-08-11 anywhere east of UTC.
    expect(toIso(new Date(2026, 7, 10, 23, 59, 59))).toBe('2026-08-10');
  });

  it('reads local calendar fields, so an early-morning date never rolls back', () => {
    // `toISOString()` would report 2026-08-09 anywhere west of UTC.
    expect(toIso(new Date(2026, 7, 10, 0, 0, 0))).toBe('2026-08-10');
  });

  it('keeps the leap day', () => {
    expect(toIso(new Date(2024, 1, 29))).toBe('2024-02-29');
  });
});

describe('parseIso', () => {
  it('anchors the date at local midnight', () => {
    const d = parseIso('2026-08-10');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(10);
    expect(d.getHours()).toBe(0);
  });

  it('round-trips through toIso, including across a leap day', () => {
    for (const iso of ['2024-02-29', '2026-01-01', '2026-12-31', '2026-08-10']) {
      expect(toIso(parseIso(iso))).toBe(iso);
    }
  });
});

describe('addDays', () => {
  it('steps forward across a month boundary', () => {
    expect(toIso(addDays(parseIso('2026-01-31'), 1))).toBe('2026-02-01');
  });

  it('steps forward across a year boundary', () => {
    expect(toIso(addDays(parseIso('2026-12-31'), 1))).toBe('2027-01-01');
  });

  it('steps backward, skipping the leap day in a common year', () => {
    expect(toIso(addDays(parseIso('2026-03-01'), -1))).toBe('2026-02-28');
  });

  it('steps backward onto the leap day in a leap year', () => {
    expect(toIso(addDays(parseIso('2024-03-01'), -1))).toBe('2024-02-29');
  });

  it('returns a new Date and leaves the input untouched', () => {
    const original = parseIso('2026-08-10');
    const moved = addDays(original, 3);
    expect(moved).not.toBe(original);
    expect(toIso(original)).toBe('2026-08-10');
    expect(toIso(moved)).toBe('2026-08-13');
  });
});

describe('longDayName', () => {
  it('names the weekday for an ISO date', () => {
    expect(longDayName('2026-08-10')).toBe('Monday');
    expect(longDayName('2026-08-16')).toBe('Sunday');
  });
});

describe('buildWeek', () => {
  const { startIso, todayIso } = { startIso: '2026-08-10', todayIso: '2026-08-13' };

  it('FR-9: renders seven consecutive columns in Mon–Sun order', () => {
    const week = buildWeek(startIso, 0, todayIso);
    expect(week.map((d) => d.iso)).toEqual([
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-15',
      '2026-08-16',
    ]);
    expect(week.map((d) => d.name)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('FR-9: labels each column with its date number and long name', () => {
    const [first] = buildWeek(startIso, 0, todayIso);
    expect(first?.num).toBe(10);
    expect(first?.long).toBe('Monday, Aug 10');
  });

  it('FR-9: marks exactly the current day as today', () => {
    const week = buildWeek(startIso, 0, todayIso);
    expect(week.filter((d) => d.isToday).map((d) => d.iso)).toEqual(['2026-08-13']);
  });

  it('FR-9: marks no day as today when the current date falls outside the week', () => {
    const week = buildWeek(startIso, 0, '2026-09-01');
    expect(week.some((d) => d.isToday)).toBe(false);
  });

  it('FR-10: a positive offset steps forward exactly one week per unit', () => {
    expect(buildWeek(startIso, 1, todayIso)[0]?.iso).toBe('2026-08-17');
    expect(buildWeek(startIso, 2, todayIso)[0]?.iso).toBe('2026-08-24');
  });

  it('FR-10: a negative offset steps back exactly one week per unit', () => {
    expect(buildWeek(startIso, -1, todayIso)[0]?.iso).toBe('2026-08-03');
    expect(buildWeek(startIso, -2, todayIso)[0]?.iso).toBe('2026-07-27');
  });

  it('FR-10: stepping away and back returns the same week', () => {
    expect(buildWeek(startIso, 0, todayIso)).toEqual(
      buildWeek(toIso(addDays(parseIso(startIso), 7)), -1, todayIso),
    );
  });

  it('FR-9: spans a month boundary without skipping a day', () => {
    const week = buildWeek('2026-08-31', 0, todayIso);
    expect(week.map((d) => d.iso)).toEqual([
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
      '2026-09-06',
    ]);
  });

  it('FR-9: spans a year boundary without skipping a day', () => {
    const week = buildWeek('2026-12-28', 0, todayIso);
    expect(week.map((d) => d.iso)).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
  });
});

describe('startOfWeek', () => {
  it('FR-9: returns the Monday of the week containing the date', () => {
    expect(startOfWeek('2026-08-10')).toBe('2026-08-10'); // a Monday maps to itself
    expect(startOfWeek('2026-08-13')).toBe('2026-08-10');
    expect(startOfWeek('2026-08-16')).toBe('2026-08-10'); // Sunday stays in its own week
  });

  it('FR-9: wraps a Sunday back to the previous Monday', () => {
    expect(startOfWeek('2026-08-16')).not.toBe('2026-08-17');
    expect(startOfWeek('2026-11-01')).toBe('2026-10-26');
  });

  it('FR-9: spans month and year boundaries', () => {
    expect(startOfWeek('2026-09-01')).toBe('2026-08-31');
    expect(startOfWeek('2027-01-01')).toBe('2026-12-28');
  });
});

describe('formatWeekLabel', () => {
  const label = (startIso: string) => formatWeekLabel(buildWeek(startIso, 0, ''));

  it('FR-9: collapses the month when both ends share one', () => {
    expect(label('2026-08-10')).toBe('Aug 10 – 16, 2026');
  });

  it('FR-9: names both months when the week spans two', () => {
    expect(label('2026-08-31')).toBe('Aug 31 – Sep 6, 2026');
  });

  it('FR-9: reports the closing year when the week spans two', () => {
    expect(label('2026-12-28')).toBe('Dec 28 – Jan 3, 2027');
  });

  it('returns an empty label for an empty week rather than throwing', () => {
    expect(formatWeekLabel([])).toBe('');
  });

  it('handles a single-day range', () => {
    const [only] = buildWeek('2026-08-10', 0, '');
    expect(formatWeekLabel(only ? [only] : [])).toBe('Aug 10 – 10, 2026');
  });
});
