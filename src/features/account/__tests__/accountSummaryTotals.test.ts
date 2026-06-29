import { selectAccountSummaryTotals } from '../utils/accountSummaryTotals';

describe('selectAccountSummaryTotals', () => {
  it('selects ARS totals deterministically when multiple currencies are returned', () => {
    const result = selectAccountSummaryTotals({
      totalGroups: 2,
      totalExpenses: 3,
      totalsByCurrency: [
        { currency: 'USD', totalPaid: 100, totalOwed: 10, totalToReceive: 20 },
        { currency: 'ARS', totalPaid: 57660, totalOwed: 1200, totalToReceive: 28830 },
      ],
      activeSince: '2026-06-27T12:15:29.827Z',
    });

    expect(result).toEqual({
      currency: 'ARS',
      totalPaid: 57660,
      totalOwed: 1200,
      totalToReceive: 28830,
      netBalance: 27630,
    });
  });

  it('falls back to the first returned currency when ARS is absent', () => {
    const result = selectAccountSummaryTotals({
      totalGroups: 1,
      totalExpenses: 1,
      totalsByCurrency: [{ currency: 'USD', totalPaid: 100, totalOwed: 10, totalToReceive: 20 }],
      activeSince: '2026-06-27T12:15:29.827Z',
    });

    expect(result.currency).toBe('USD');
    expect(result.netBalance).toBe(10);
  });
});
