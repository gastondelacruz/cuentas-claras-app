import { queryClient } from '../../../shared/api/queryClient';
import { isEnhancedInitialLoadingEnabled } from '../../../shared/feature-flags/initialLoadingFlags';
import type { PersonalTransactionListFilters, PersonalTransactionType } from '../types';
import {
  personalTransactionsListQueryOptions,
  personalTransactionsSummaryQueryOptions,
} from './personalTransactionQueryOptions';

export function prefetchAlternatePersonalTransactions(filters: PersonalTransactionListFilters) {
  if (!isEnhancedInitialLoadingEnabled()) return;

  const alternateType: PersonalTransactionType = filters.type === 'expense' ? 'income' : 'expense';
  const alternateFilters = { ...filters, type: alternateType };
  const summaryFilters = {
    range: filters.range,
    from: filters.from,
    to: filters.to,
  };

  void queryClient.prefetchQuery(personalTransactionsListQueryOptions(alternateFilters));
  void queryClient.prefetchQuery(personalTransactionsSummaryQueryOptions(summaryFilters));
}
