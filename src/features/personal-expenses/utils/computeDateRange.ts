import type { PersonalTransactionRange } from '../types';

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

/** Returns an ISO date string (YYYY-MM-DD) from a Date using UTC fields. */
function toISODate(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Returns a short display label like "5 jul" using UTC fields. */
function shortDay(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS_ES[d.getUTCMonth()]}`;
}

export type DateRangeResult = {
  from?: string;
  to?: string;
  rangeLabel: string;
};

/**
 * Computes `from`, `to` (ISO date strings), and a Spanish `rangeLabel` for a
 * given PersonalTransactionRange.
 *
 * All date arithmetic is performed in UTC to guarantee deterministic results
 * regardless of the host timezone.
 *
 * @param range - The range type to compute.
 * @param now   - Reference point in time (defaults to `new Date()`). Inject in
 *                tests via `jest.useFakeTimers` or by passing an explicit Date.
 */
export function computeDateRange(
  range: PersonalTransactionRange,
  now: Date = new Date(),
): DateRangeResult {
  switch (range) {
    case 'day': {
      const iso = toISODate(now);
      return { from: iso, to: iso, rangeLabel: shortDay(now) };
    }

    case 'week': {
      // Convention: Monday–Sunday
      const utcDay = now.getUTCDay(); // 0=Sun, 1=Mon, …, 6=Sat
      const mondayOffset = utcDay === 0 ? -6 : 1 - utcDay;

      const monday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset),
      );
      const sunday = new Date(
        Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6),
      );

      return {
        from: toISODate(monday),
        to: toISODate(sunday),
        rangeLabel: `${shortDay(monday)} – ${shortDay(sunday)}`,
      };
    }

    case 'month': {
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const first = new Date(Date.UTC(year, month, 1));
      // Day 0 of next month = last day of this month
      const last = new Date(Date.UTC(year, month + 1, 0));

      return {
        from: toISODate(first),
        to: toISODate(last),
        rangeLabel: `${MONTHS_ES[month]} ${year}`,
      };
    }

    case 'year': {
      const year = now.getUTCFullYear();
      const first = new Date(Date.UTC(year, 0, 1));
      const last = new Date(Date.UTC(year, 11, 31));

      return {
        from: toISODate(first),
        to: toISODate(last),
        rangeLabel: `${year}`,
      };
    }

    case 'period': {
      return { rangeLabel: 'Período' };
    }
  }
}
