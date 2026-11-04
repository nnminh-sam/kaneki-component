/* Small local-time date helpers (no external date library). */

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Adds months, clamping the day to the target month's length (Jan 31 + 1 = Feb 28/29). */
export const addMonths = (d: Date, n: number) => {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), daysInMonth(target)));
};

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Stable `YYYY-M-D` key for a local date. */
export const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** Clamps a date into [min, max] (day precision). */
export const clampDate = (d: Date, min?: Date | null, max?: Date | null) => {
  if (min && d < startOfDay(min)) return startOfDay(min);
  if (max && d > startOfDay(max)) return startOfDay(max);
  return d;
};

/** Column (0..6) of a date in a week that starts on `weekStartsOn`. */
export const weekdayIndex = (d: Date, weekStartsOn: number) => (d.getDay() - weekStartsOn + 7) % 7;

/** Weeks (rows of 7 dates) covering the month, including leading/trailing days. */
export function getMonthWeeks(month: Date, weekStartsOn: number): Date[][] {
  const first = startOfMonth(month);
  const start = addDays(first, -weekdayIndex(first, weekStartsOn));
  const total = weekdayIndex(first, weekStartsOn) + daysInMonth(first);
  const rows = Math.ceil(total / 7);
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => addDays(start, r * 7 + c))
  );
}
