import { create } from 'zustand';

import { GroupExpense } from '../../groups/types';

const EMPTY_EXPENSES: GroupExpense[] = [];

type ExpensesStore = {
  expensesByGroup: Record<string, GroupExpense[]>;
  addExpense: (groupId: string, expense: GroupExpense) => void;
  getExpensesForGroup: (groupId: string) => GroupExpense[];
  reset: () => void;
};

export const useExpensesStore = create<ExpensesStore>()((set, get) => ({
  expensesByGroup: {},
  addExpense: (groupId, expense) =>
    set((state) => ({
      expensesByGroup: {
        ...state.expensesByGroup,
        [groupId]: [expense, ...(state.expensesByGroup[groupId] ?? EMPTY_EXPENSES)],
      },
    })),
  getExpensesForGroup: (groupId) => get().expensesByGroup[groupId] ?? EMPTY_EXPENSES,
  reset: () => set({ expensesByGroup: {} }),
}));
