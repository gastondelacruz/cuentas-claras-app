export type PersonalTransactionType = 'expense' | 'income';

export type PersonalTransactionRange = 'day' | 'week' | 'month' | 'year' | 'period';

export type PersonalTransactionCategory = string;

export type PersonalTransactionListFilters = {
  type: PersonalTransactionType;
  range: PersonalTransactionRange;
  from?: string;
  to?: string;
};

export type PersonalTransactionSummaryFilters = {
  range: PersonalTransactionRange;
  from?: string;
  to?: string;
};

export type PersonalTransactionQueryOptions = PersonalTransactionListFilters & {
  cursor?: string;
  limit?: number;
};

export type PersonalTransactionListItem = {
  id: string;
  type: PersonalTransactionType;
  category: string;
  amount: number;
  currency: string;
  occurredAt: string;
};

export type PersonalTransactionChartSegment = {
  color: string;
  dasharray: string;
  dashoffset?: string;
};
