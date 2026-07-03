import { queryOptions } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import type { PersonalTransactionListFilters, PersonalTransactionSummaryFilters } from '../types';
import { getPersonalTransactions, getPersonalTransactionsSummary } from './personalTransactionsApi';

export const DEFAULT_PERSONAL_TRANSACTION_LIMIT = 20;

export function personalTransactionsListQueryOptions(filters: PersonalTransactionListFilters) {
  return queryOptions({
    queryKey: queryKeys.personalTransactions.list(filters),
    queryFn: () =>
      getPersonalTransactions({
        ...filters,
        limit: DEFAULT_PERSONAL_TRANSACTION_LIMIT,
      }),
  });
}

export function personalTransactionsSummaryQueryOptions(filters: PersonalTransactionSummaryFilters) {
  return queryOptions({
    queryKey: queryKeys.personalTransactions.summary(filters),
    queryFn: () => getPersonalTransactionsSummary(filters),
  });
}
