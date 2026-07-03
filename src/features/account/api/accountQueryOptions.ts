import { queryOptions } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { getAccountSummary } from './accountSummaryApi';

export function accountSummaryQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.account.summary(),
    queryFn: getAccountSummary,
  });
}
