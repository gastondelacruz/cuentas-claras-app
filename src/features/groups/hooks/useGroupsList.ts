import { GroupListItem } from '../types';
import { groupsListMock, groupsNetBalanceMock } from '../mocks/groupsList.mock';

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
  return {
    groups: groupsListMock,
    netBalance: groupsNetBalanceMock,
    isLoading: false,
  };
}
