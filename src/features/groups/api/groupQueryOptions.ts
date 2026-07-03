import { queryOptions } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { getGroups } from './groupsApi';

export function groupsListQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.groups.all(),
    queryFn: getGroups,
  });
}
