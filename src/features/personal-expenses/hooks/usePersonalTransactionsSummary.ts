import { useQuery } from '@tanstack/react-query';

import { personalTransactionsSummaryQueryOptions } from '../api/personalTransactionQueryOptions';
import type { PersonalTransactionSummaryFilters } from '../types';

export function usePersonalTransactionsSummary(filters: PersonalTransactionSummaryFilters) {
  const query = useQuery(personalTransactionsSummaryQueryOptions(filters));

  return {
    summary: query.data,
    hasFetchedSummary: query.data !== undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
