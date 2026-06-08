import { useGroupsStore, getGroupsNetBalance } from '../store/groupsStore';
import { GroupListItem } from '../types';

type UseGroupsListResult = {
  groups: GroupListItem[];
  netBalance: number;
  isLoading: boolean;
};

/**
 * Returns the list of groups and the net balance for the groups tab.
 *
 * Shaped like a TanStack Query hook so swapping the mock for a real
 * `useQuery({ queryKey: ['groups'], ... })` call later does not touch the UI.
 */
export function useGroupsList(): UseGroupsListResult {
  const groups = useGroupsStore((state) => state.groups);

  return {
    groups,
    netBalance: getGroupsNetBalance(groups),
    isLoading: false,
  };
}
