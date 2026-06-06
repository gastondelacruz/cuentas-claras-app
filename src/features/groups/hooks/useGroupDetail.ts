import { GroupDetail, GroupExpense, MemberBalance } from '../types';
import { groupDetailMock, memberBalancesMock, recentExpensesMock, totalExpensesCountMock } from '../mocks/groupDetail.mock';

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
  void groupId;

  return {
    group: groupDetailMock,
    memberBalances: memberBalancesMock,
    recentExpenses: recentExpensesMock,
    totalExpensesCount: totalExpensesCountMock,
    isLoading: false,
  };
}
