import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { getPersonalTransactionsSummary } from '../api/personalTransactionsApi';
import type { PersonalTransactionSummaryFilters } from '../types';

export function usePersonalTransactionsSummary(filters: PersonalTransactionSummaryFilters) {
  const query = useQuery({
    queryKey: queryKeys.personalTransactions.summary(filters),
    queryFn: () => getPersonalTransactionsSummary(filters),
  });

  return {
    summary: query.data,
    hasFetchedSummary: query.data !== undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
