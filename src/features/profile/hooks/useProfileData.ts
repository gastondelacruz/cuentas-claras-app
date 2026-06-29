import { useGroups } from '../../groups/hooks/useGroups';
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
  initials: string;
  name: string;
  status: string;
};

type UseProfileDataResult = {
  summary: ProfileSummary;
  user: ProfileUser;
};

const defaultAvatarUrl =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop&crop=faces';

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function summarizeGroups(groups: { expensesCount?: number; totalAmount?: number; currentUserBalance?: number }[]): ProfileSummary {
  let totalExpenseCount = 0;
  let totalExpenses = 0;
  let activeDebtGroupsCount = 0;
  let youOwe = 0;

  for (const group of groups) {
    totalExpenseCount += group.expensesCount ?? 0;
    totalExpenses += group.totalAmount ?? 0;

    const balance = group.currentUserBalance ?? 0;
    if (balance < 0) {
      activeDebtGroupsCount += 1;
      youOwe += Math.abs(balance);
    }
  }

  return {
    activeDebtGroupsCount,
    totalExpenseCount,
    totalExpenses: roundToCents(totalExpenses),
    youOwe: roundToCents(youOwe),
  };
}

export function useProfileData(): UseProfileDataResult {
  const authUser = useAuthStore((state) => state.user);
  const { data: groupsResponse } = useGroups();

  const groups = groupsResponse?.data ?? [];
  const summary = summarizeGroups(groups);

  return {
    user: {
      name: authUser?.name ?? authUser?.email ?? 'Usuario',
      email: authUser?.email ?? '',
      status: 'Verificado',
      avatarUrl: defaultAvatarUrl,
      initials: getInitials(authUser?.name ?? authUser?.email ?? 'U'),
    },
    summary,
  };
}
