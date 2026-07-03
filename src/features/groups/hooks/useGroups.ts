import { useQuery } from '@tanstack/react-query';

import { groupsListQueryOptions } from '../api/groupQueryOptions';

export function useGroups() {
  return useQuery(groupsListQueryOptions());
}
