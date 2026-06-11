import { useExpensesStore } from '../../expenses/store/expensesStore';
import { useGroupsStore } from '../../groups/store/groupsStore';
import type { GroupExpense } from '../../groups/types';
import { useAuthStore } from '../../../shared/store/authStore';

type ProfileSummary = {
  activeDebtGroupsCount: number;
  totalExpenseCount: number;
  totalExpenses: number;
  youOwe: number;
};

type ProfileUser = {
  avatarUrl: string;
  email: string;
  name: string;
  status: string;
};

type UseProfileDataResult = {
  summary: ProfileSummary;
  user: ProfileUser;
};

const profileFallback = {
  name: 'Alex Thompson',
  email: 'alex.thompson@lumifinance.com',
  status: 'Verificado',
  avatarUrl:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop&crop=faces',
};

function roundToCents(value: number) {
  return Math.round(value * 100) / 100;
}

function summarizeExpenses(groups: { id: string }[], expensesByGroup: Record<string, GroupExpense[]>): ProfileSummary {
  let totalExpenses = 0;
  let totalExpenseCount = 0;
  let youOwe = 0;
  const activeDebtGroupIds = new Set<string>();

  for (const group of groups) {
    const expenses = expensesByGroup[group.id] ?? [];

    for (const expense of expenses) {
      totalExpenses += expense.totalAmount;
      totalExpenseCount += 1;

      if (expense.userRelation.type === 'share') {
        youOwe += expense.userRelation.amount;
        activeDebtGroupIds.add(group.id);
      }
    }
  }

  return {
    activeDebtGroupsCount: activeDebtGroupIds.size,
    totalExpenseCount,
    totalExpenses: roundToCents(totalExpenses),
    youOwe: roundToCents(youOwe),
  };
}

export function useProfileData(): UseProfileDataResult {
  const authUser = useAuthStore((state) => state.user);
  const groups = useGroupsStore((state) => state.groups);
  const expensesByGroup = useExpensesStore((state) => state.expensesByGroup);

  return {
    user: {
      ...profileFallback,
      email: authUser?.email ?? profileFallback.email,
    },
    summary: summarizeExpenses(groups, expensesByGroup),
  };
}
