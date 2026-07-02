export type PersonalTransactionType = 'expense' | 'income';

export type PersonalTransactionRange = 'day' | 'week' | 'month' | 'year' | 'period';

export type PersonalTransactionCategory = string;

export type PersonalTransactionListFilters = {
  type: PersonalTransactionType;
  range: PersonalTransactionRange;
  from?: string;
  to?: string;
};

export type PersonalTransactionQueryOptions = PersonalTransactionListFilters & {
  cursor?: string;
  limit?: number;
};
