import { useQuery } from '@tanstack/react-query';

import { accountSummaryQueryOptions } from '../api/accountQueryOptions';

export function useAccountSummary() {
  return useQuery(accountSummaryQueryOptions());
}
