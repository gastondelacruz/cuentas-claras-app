import type { AccountSummaryCurrencyTotalsDto, AccountSummaryDto } from '../schemas/accountSummarySchema';

export type SelectedAccountSummaryTotals = {
  currency: string;
  totalPaid: number;
  totalOwed: number;
  totalToReceive: number;
  netBalance: number;
};

const DEFAULT_CURRENCY = 'ARS';

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function getPreferredCurrencyTotals(totals: AccountSummaryCurrencyTotalsDto[]): AccountSummaryCurrencyTotalsDto | undefined {
  return totals.find((item) => item.currency === DEFAULT_CURRENCY) ?? totals[0];
}

export function selectAccountSummaryTotals(summary: AccountSummaryDto | undefined): SelectedAccountSummaryTotals {
  const totals = getPreferredCurrencyTotals(summary?.totalsByCurrency ?? []);
  const totalToReceive = roundToCents(totals?.totalToReceive ?? 0);
  const totalOwed = roundToCents(totals?.totalOwed ?? 0);

  return {
    currency: totals?.currency ?? DEFAULT_CURRENCY,
    totalPaid: roundToCents(totals?.totalPaid ?? 0),
    totalOwed,
    totalToReceive,
    netBalance: roundToCents(totalToReceive - totalOwed),
  };
}
