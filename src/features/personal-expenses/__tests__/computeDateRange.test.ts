import { computeDateRange } from '../utils/computeDateRange';

// Pin "today" to 2026-06-29 12:00 UTC (a Monday) for deterministic results
const MONDAY = new Date('2026-06-29T12:00:00.000Z');

describe('computeDateRange', () => {
  describe('day', () => {
    it('returns today as from and to', () => {
      const result = computeDateRange('day', MONDAY);
      expect(result.from).toBe('2026-06-29');
      expect(result.to).toBe('2026-06-29');
    });

    it('produces a rangeLabel with day and short month', () => {
      const result = computeDateRange('day', MONDAY);
      expect(result.rangeLabel).toBe('29 jun');
    });
  });

  describe('week (Monday–Sunday convention)', () => {
    it('returns the enclosing Mon–Sun window when called on a Monday', () => {
      const result = computeDateRange('week', MONDAY);
      expect(result.from).toBe('2026-06-29');
      expect(result.to).toBe('2026-07-05');
    });

    it('returns the same Mon–Sun window when called on a Wednesday of the same week', () => {
      const wednesday = new Date('2026-07-01T12:00:00.000Z');
      const result = computeDateRange('week', wednesday);
      expect(result.from).toBe('2026-06-29');
      expect(result.to).toBe('2026-07-05');
    });

    it('returns the previous Mon–Sun window when called on the preceding Sunday', () => {
      const sunday = new Date('2026-06-28T12:00:00.000Z');
      const result = computeDateRange('week', sunday);
      expect(result.from).toBe('2026-06-22');
      expect(result.to).toBe('2026-06-28');
    });

    it('produces a rangeLabel spanning month boundary', () => {
      const result = computeDateRange('week', MONDAY);
      expect(result.rangeLabel).toBe('29 jun – 5 jul');
    });

    it('produces a rangeLabel within the same month', () => {
      const sunday = new Date('2026-06-28T12:00:00.000Z');
      const result = computeDateRange('week', sunday);
      expect(result.rangeLabel).toBe('22 jun – 28 jun');
    });
  });

  describe('month', () => {
    it('returns the first and last day of the current month', () => {
      const result = computeDateRange('month', MONDAY);
      expect(result.from).toBe('2026-06-01');
      expect(result.to).toBe('2026-06-30');
    });

    it('produces a rangeLabel with short month name and year', () => {
      const result = computeDateRange('month', MONDAY);
      expect(result.rangeLabel).toBe('jun 2026');
    });
  });

  describe('year', () => {
    it('returns Jan 1 and Dec 31 of the current year', () => {
      const result = computeDateRange('year', MONDAY);
      expect(result.from).toBe('2026-01-01');
      expect(result.to).toBe('2026-12-31');
    });

    it('produces a rangeLabel with just the year', () => {
      const result = computeDateRange('year', MONDAY);
      expect(result.rangeLabel).toBe('2026');
    });
  });

  describe('period', () => {
    it('omits from and to', () => {
      const result = computeDateRange('period', MONDAY);
      expect(result.from).toBeUndefined();
      expect(result.to).toBeUndefined();
    });

    it('produces a rangeLabel of "Período"', () => {
      const result = computeDateRange('period', MONDAY);
      expect(result.rangeLabel).toBe('Período');
    });
  });
});
