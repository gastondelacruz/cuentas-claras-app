import { GroupDetail, GroupExpense, MemberBalance } from '../types';
import { groupDetailMock, memberBalancesMock, recentExpensesMock, totalExpensesCountMock } from '../mocks/groupDetail.mock';
import { groupsListMock } from '../mocks/groupsList.mock';
import { useGroupsStore } from '../store/groupsStore';

function getInitialsFromValue(value: string) {
  const tokens = value
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return 'NA';
  }

  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('');
}

type UseGroupDetailResult = {
  group: GroupDetail;
  memberBalances: MemberBalance[];
  recentExpenses: GroupExpense[];
  totalExpensesCount: number;
  isLoading: boolean;
};

/**
 * Returns the data needed to render the group detail screen.
 *
 * This is intentionally shaped like a TanStack Query hook so that swapping the
 * mock for a real `useQuery({ queryKey: ['group', groupId], ... })` call later
 * does not require touching the UI. For now `groupId` is ignored and the hook
 * always resolves the mock synchronously with `isLoading: false`.
 */
export function useGroupDetail(groupId?: string): UseGroupDetailResult {
  const groupFromStore = useGroupsStore((state) => state.groups.find((group) => group.id === groupId));
  const isSeededMockGroup = groupsListMock.some((group) => group.id === groupId);

  if (groupFromStore && !isSeededMockGroup) {
    const memberBalances: MemberBalance[] = [
      {
        id: 'current-user',
        name: 'Vos',
        initials: groupFromStore.members[0]?.initials ?? 'YO',
        avatarUrl: groupFromStore.members[0]?.avatarUrl ?? null,
        isCurrentUser: true,
        balance: 0,
      },
      ...groupFromStore.invitedEmails.map((email) => ({
        id: email,
        name: email,
        initials: getInitialsFromValue(email.split('@')[0] ?? email),
        avatarUrl: null,
        isCurrentUser: false,
        balance: 0,
      })),
    ];

    return {
      group: {
        id: groupFromStore.id,
        name: groupFromStore.name,
        category: groupFromStore.category,
        totalExpense: 0,
        totalExpenseChangePercent: 0,
        owedToYou: 0,
        youOwe: 0,
      },
      memberBalances,
      recentExpenses: [],
      totalExpensesCount: 0,
      isLoading: false,
    };
  }

  return {
    group: groupDetailMock,
    memberBalances: memberBalancesMock,
    recentExpenses: recentExpensesMock,
    totalExpensesCount: totalExpensesCountMock,
    isLoading: false,
  };
}
