import { GroupListItem } from '../types';
import { roundToCents } from '../utils/balanceContract';
import { useGroups } from './useGroups';

type UseGroupsListResult = {
  groups: GroupListItem[];
  netBalance: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

/**
 * Returns the list of groups and the net balance for the groups tab.
 *
 * Groups are fetched from the API via React Query. The per-group balance is
 * taken directly from `currentUserBalance` on each list item returned by the
 * server, so no local expense store is needed.
 */
export function useGroupsList(): UseGroupsListResult {
  const { data, isLoading, isError, error } = useGroups();

  const groups: GroupListItem[] = (data?.data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    category: 'OTHER',
    status: { type: 'recent' },
    members: [],
    extraMembersCount: 0,
    balance: roundToCents(item.currentUserBalance ?? 0),
  }));

  const netBalance = roundToCents(groups.reduce((total, group) => total + group.balance, 0));

  return {
    groups,
    netBalance,
    isLoading,
    isError,
    error,
  };
}
