import { recentExpensesMock } from '../../groups/mocks/groupDetail.mock';
import { GroupExpense } from '../../groups/types';
import { useExpensesStore } from '../store/expensesStore';

/**
 * Resolves the expense being edited for a given group, if any.
 *
 * Store entries win over seeded mocks (an edited mock is upserted into the
 * store under the same id). Seeded mock expenses are still resolvable so they
 * can be edited even though they do not originate from the store.
 */
export function useExpenseToEdit(groupId?: string, expenseId?: string): GroupExpense | undefined {
  const storedExpense = useExpensesStore((state) => {
    if (!groupId || !expenseId) {
      return undefined;
    }

    return state.expensesByGroup[groupId]?.find((expense) => expense.id === expenseId);
  });

  if (!expenseId) {
    return undefined;
  }

  if (storedExpense) {
    return storedExpense;
  }

  return recentExpensesMock.find((expense) => expense.id === expenseId);
}
