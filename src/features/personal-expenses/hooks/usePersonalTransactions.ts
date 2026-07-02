import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { getPersonalTransactions } from '../api/personalTransactionsApi';
import type { PersonalTransactionListFilters } from '../types';

const DEFAULT_PERSONAL_TRANSACTION_LIMIT = 20;

export function usePersonalTransactions(filters: PersonalTransactionListFilters) {
  const query = useQuery({
    queryKey: queryKeys.personalTransactions.list(filters),
    queryFn: () =>
      getPersonalTransactions({
        ...filters,
        limit: DEFAULT_PERSONAL_TRANSACTION_LIMIT,
      }),
  });

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
