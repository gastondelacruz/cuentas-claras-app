import { useExpensesStore } from '../../expenses/store/expensesStore';
import { useGroupsStore } from '../store/groupsStore';
import { GroupExpense, GroupListItem } from '../types';

type UseGroupsListResult = {
  groups: GroupListItem[];
  netBalance: number;
  isLoading: boolean;
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
 * Each group's balance is derived from its real expenses (not the static stored
 * field), so the net total, the per-group cards and the owed/owe filters all
 * reflect the actual state. Shaped like a TanStack Query hook so swapping the
 * store for a real `useQuery({ queryKey: ['groups'], ... })` call later does not
 * touch the UI.
 */
export function useGroupsList(): UseGroupsListResult {
  const storedGroups = useGroupsStore((state) => state.groups);
  const expensesByGroup = useExpensesStore((state) => state.expensesByGroup);

  const groups = storedGroups.map((group) => ({
    ...group,
    balance: roundToCents(computeGroupBalance(expensesByGroup[group.id] ?? [])),
  }));

  const netBalance = roundToCents(groups.reduce((total, group) => total + group.balance, 0));

  return {
    groups,
    netBalance,
    isLoading: false,
  };
}
