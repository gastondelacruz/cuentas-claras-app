import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { getAccountSummary } from '../api/accountSummaryApi';

export function useAccountSummary() {
  return useQuery({
    queryKey: queryKeys.account.summary(),
    queryFn: getAccountSummary,
  });
}
