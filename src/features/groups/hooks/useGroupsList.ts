import { GroupListItem } from '../types';
import { selectAccountSummaryTotals } from '../../account/utils/accountSummaryTotals';
import { useAccountSummary } from '../../account/hooks/useAccountSummary';
import { roundToCents } from '../utils/balanceContract';
import { useGroups } from './useGroups';

type GroupBalanceSource = {
  id: string;
  name: string;
  description?: string | null;
  currentUserBalance?: number | null;
};

function resolveGroupBalance(group: GroupBalanceSource): number {
  return roundToCents(group.currentUserBalance ?? 0);
}

type UseGroupsListResult = {
  groups: GroupListItem[];
  netBalance: number;
  owedToYou: number;
  youOwe: number;
  currency: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

/**
 * Returns the list of groups and the net balance for the groups tab.
 *
 * Groups are fetched from the API via React Query and use the documented
 * `currentUserBalance` field from GET /groups as the source of truth for each
 * card balance.
 */
export function useGroupsList(): UseGroupsListResult {
  const { data, isLoading, isError, error } = useGroups();
  const {
    data: accountSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useAccountSummary();

  // The documented API contract is `{ data: Group[] }`.
  // A raw array is still tolerated defensively so older/cached payloads don't crash the screen.
  const groupItems = Array.isArray(data)
    ? (data as GroupBalanceSource[])
    : Array.isArray(data?.data)
      ? (data.data as GroupBalanceSource[])
      : [];

  const groups: GroupListItem[] = groupItems.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    category: 'OTHER',
    status: { type: 'recent' },
    members: [],
    extraMembersCount: 0,
    balance: resolveGroupBalance(item),
  }));

  const selectedTotals = selectAccountSummaryTotals(accountSummary);

  return {
    groups,
    netBalance: selectedTotals.netBalance,
    owedToYou: selectedTotals.totalToReceive,
    youOwe: selectedTotals.totalOwed,
    currency: selectedTotals.currency,
    isLoading: isLoading || isSummaryLoading,
    isError: isError || isSummaryError,
    error: error ?? (summaryError as Error | null),
  };
}
