import { useExpensesStore } from '../../expenses/store/expensesStore';
import { GroupExpense, GroupListItem } from '../types';
import { useGroups } from './useGroups';

type UseGroupsListResult = {
  groups: GroupListItem[];
  netBalance: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

function roundToCents(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Net balance of a group from the current user's perspective: what others owe
 * you (`lent`) minus what you owe (`share`). Positive means you are owed money.
 */
function computeGroupBalance(expenses: GroupExpense[]): number {
  return expenses.reduce((total, expense) => {
    if (expense.userRelation.type === 'lent') {
      return total + expense.userRelation.amount;
    }

    if (expense.userRelation.type === 'share') {
      return total - expense.userRelation.amount;
    }

    return total;
  }, 0);
}

/**
 * Returns the list of groups and the net balance for the groups tab.
 *
 * Groups are fetched from the API via React Query. Balance is derived from
 * local expenses (not yet fetched from the server). Category, members, and
 * status are defaulted until the API returns them in the list endpoint.
 */
export function useGroupsList(): UseGroupsListResult {
  const { data, isLoading, isError, error } = useGroups();
  const expensesByGroup = useExpensesStore((state) => state.expensesByGroup);

  const groups: GroupListItem[] = (data?.data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    category: 'OTHER',
    status: { type: 'recent' },
    members: [],
    extraMembersCount: 0,
    balance: roundToCents(computeGroupBalance(expensesByGroup[item.id] ?? [])),
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
