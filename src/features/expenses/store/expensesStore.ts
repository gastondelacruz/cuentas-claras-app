import { create } from 'zustand';

import { GroupExpense } from '../../groups/types';

const EMPTY_EXPENSES: GroupExpense[] = [];
const EMPTY_IDS: string[] = [];

type ExpensesStore = {
  expensesByGroup: Record<string, GroupExpense[]>;
  // Tombstones: ids of expenses the user deleted. Needed because seeded mock
  // expenses live outside the store, so the mock layer must know which ones to
  // hide even though they were never tracked here.
  deletedExpenseIdsByGroup: Record<string, string[]>;
  addExpense: (groupId: string, expense: GroupExpense) => void;
  updateExpense: (groupId: string, expense: GroupExpense) => void;
  deleteExpense: (groupId: string, expenseId: string) => void;
  deleteGroupExpenses: (groupId: string) => void;
  getExpensesForGroup: (groupId: string) => GroupExpense[];
  getDeletedExpenseIds: (groupId: string) => string[];
  reset: () => void;
};

export const useExpensesStore = create<ExpensesStore>()((set, get) => ({
  expensesByGroup: {},
  deletedExpenseIdsByGroup: {},
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
  // Remove an expense from a group. Drops any store-tracked entry and records a
  // tombstone so the mock layer can hide a seeded mock expense with the same id.
  deleteExpense: (groupId, expenseId) =>
    set((state) => {
      const current = state.expensesByGroup[groupId] ?? EMPTY_EXPENSES;
      const tombstones = state.deletedExpenseIdsByGroup[groupId] ?? EMPTY_IDS;
      const alreadyTombstoned = tombstones.includes(expenseId);

      return {
        expensesByGroup: {
          ...state.expensesByGroup,
          [groupId]: current.filter((item) => item.id !== expenseId),
        },
        deletedExpenseIdsByGroup: alreadyTombstoned
          ? state.deletedExpenseIdsByGroup
          : {
              ...state.deletedExpenseIdsByGroup,
              [groupId]: [...tombstones, expenseId],
            },
        };
    }),
  deleteGroupExpenses: (groupId) =>
    set((state) => {
      const nextExpensesByGroup = { ...state.expensesByGroup };

      delete nextExpensesByGroup[groupId];

      return {
        expensesByGroup: nextExpensesByGroup,
        deletedExpenseIdsByGroup: state.deletedExpenseIdsByGroup,
      };
    }),
  getExpensesForGroup: (groupId) => get().expensesByGroup[groupId] ?? EMPTY_EXPENSES,
  getDeletedExpenseIds: (groupId) => get().deletedExpenseIdsByGroup[groupId] ?? EMPTY_IDS,
  reset: () => set({ expensesByGroup: {}, deletedExpenseIdsByGroup: {} }),
}));
