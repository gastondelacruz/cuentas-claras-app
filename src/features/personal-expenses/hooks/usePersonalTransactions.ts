import { useQuery } from '@tanstack/react-query';

import { personalTransactionsListQueryOptions } from '../api/personalTransactionQueryOptions';
import type { PersonalTransactionListFilters } from '../types';

export function usePersonalTransactions(filters: PersonalTransactionListFilters) {
  const query = useQuery(personalTransactionsListQueryOptions(filters));

  return {
    transactions: query.data?.transactions ?? [],
    total: query.data?.total ?? 0,
    incomeTotal: query.data?.incomeTotal ?? 0,
    expenseTotal: query.data?.expenseTotal ?? 0,
    currency: query.data?.currency ?? 'ARS',
    hasFetchedTransactions: query.data !== undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
