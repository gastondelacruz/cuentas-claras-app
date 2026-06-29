import { selectAccountSummaryTotals } from '../../account/utils/accountSummaryTotals';
import { useAccountSummary } from '../../account/hooks/useAccountSummary';
import { useAuthStore } from '../../../shared/store/authStore';

type ProfileSummary = {
  activeDebtGroupsCount: number;
  currency: string;
  netBalance: number;
  totalExpenseCount: number;
  totalExpenses: number;
  owedToYou: number;
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
  summary: ProfileSummary | null;
  summaryError: Error | null;
  summaryStatus: 'loading' | 'error' | 'empty' | 'success';
  user: ProfileUser;
};

const defaultAvatarUrl =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop&crop=faces';

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export function useProfileData(): UseProfileDataResult {
  const authUser = useAuthStore((state) => state.user);
  const {
    data: accountSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useAccountSummary();

  const selectedTotals = selectAccountSummaryTotals(accountSummary);
  const summary: ProfileSummary | null = accountSummary
    ? {
        activeDebtGroupsCount: accountSummary.totalGroups,
        totalExpenseCount: accountSummary.totalExpenses,
        totalExpenses: selectedTotals.totalPaid,
        owedToYou: selectedTotals.totalToReceive,
        youOwe: selectedTotals.totalOwed,
        netBalance: selectedTotals.netBalance,
        currency: selectedTotals.currency,
      }
    : null;

  const summaryStatus = isSummaryLoading
    ? 'loading'
    : isSummaryError
      ? 'error'
      : summary
        ? 'success'
        : 'empty';

  return {
    user: {
      name: authUser?.name ?? authUser?.email ?? 'Usuario',
      email: authUser?.email ?? '',
      status: 'Verificado',
      avatarUrl: defaultAvatarUrl,
      initials: getInitials(authUser?.name ?? authUser?.email ?? 'U'),
    },
    summary,
    summaryError: (summaryError as Error | null) ?? null,
    summaryStatus,
  };
}
