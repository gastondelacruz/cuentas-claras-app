import { create } from 'zustand';

import { GroupExpense } from '../../groups/types';

const EMPTY_EXPENSES: GroupExpense[] = [];

type ExpensesStore = {
  expensesByGroup: Record<string, GroupExpense[]>;
  addExpense: (groupId: string, expense: GroupExpense) => void;
  updateExpense: (groupId: string, expense: GroupExpense) => void;
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
  // Upsert by id: replace the matching expense in place, or prepend it when the
  // id is not yet tracked. Editing a seeded mock expense (which lives outside the
  // store) therefore creates a single store entry that overrides the mock.
  updateExpense: (groupId, expense) =>
    set((state) => {
      const current = state.expensesByGroup[groupId] ?? EMPTY_EXPENSES;
      const exists = current.some((item) => item.id === expense.id);
      const next = exists
        ? current.map((item) => (item.id === expense.id ? expense : item))
        : [expense, ...current];

      return {
        expensesByGroup: { ...state.expensesByGroup, [groupId]: next },
      };
    }),
  getExpensesForGroup: (groupId) => get().expensesByGroup[groupId] ?? EMPTY_EXPENSES,
  reset: () => set({ expensesByGroup: {} }),
}));
