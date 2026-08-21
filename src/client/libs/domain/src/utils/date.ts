import type { WeekDay } from '../types';

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const at = <T>(list: readonly T[], index: number): T => list[index] as T;

export const toIso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parseIso = (s: string): Date => new Date(`${s}T00:00:00`);

export const addDays = (d: Date, n: number): Date => new Date(d.getTime() + n * 86_400_000);

export const longDayName = (iso: string): string => at(DAY_LONG, parseIso(iso).getDay());

/**
 * The seven days of the week `offset` weeks away from the seeded week.
 * `todayIso` is fixed seed data until the API supplies a real clock.
 */
export function buildWeek(startIso: string, offset: number, todayIso: string): WeekDay[] {
  const start = addDays(parseIso(startIso), offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    const iso = toIso(d);
    return {
      iso,
      name: at(DAY_SHORT, d.getDay()),
      long: `${at(DAY_LONG, d.getDay())}, ${at(MONTHS, d.getMonth())} ${d.getDate()}`,
      num: d.getDate(),
      isToday: iso === todayIso,
    };
  });
}

/** `Aug 10 – 16, 2026`, collapsing the month when both ends share one. */
export function formatWeekLabel(days: WeekDay[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return '';
  const a = parseIso(first.iso);
  const b = parseIso(last.iso);
  const left = `${at(MONTHS, a.getMonth())} ${a.getDate()}`;
  const right =
    a.getMonth() === b.getMonth() ? `${b.getDate()}` : `${at(MONTHS, b.getMonth())} ${b.getDate()}`;
  return `${left} – ${right}, ${b.getFullYear()}`;
}
