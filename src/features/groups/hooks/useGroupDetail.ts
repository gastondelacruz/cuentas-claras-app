import { useExpensesStore } from '../../expenses/store/expensesStore';
import { GroupDetail, GroupExpense, MemberBalance } from '../types';
import { groupDetailMock, memberBalancesMock, recentExpensesMock, totalExpensesCountMock } from '../mocks/groupDetail.mock';
import { groupsListMock } from '../mocks/groupsList.mock';
import { useGroupsStore } from '../store/groupsStore';

const EMPTY_EXPENSES: GroupExpense[] = [];

function sumExpenses(expenses: GroupExpense[]) {
  return expenses.reduce(
    (totals, expense) => {
      totals.total += expense.totalAmount;

      if (expense.userRelation.type === 'lent') {
        totals.owedToYou += expense.userRelation.amount;
      }

      if (expense.userRelation.type === 'share') {
        totals.youOwe += expense.userRelation.amount;
      }

      return totals;
    },
    { total: 0, owedToYou: 0, youOwe: 0 },
  );
}

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
 * does not require touching the UI. For now the hook resolves synchronously,
 * preserving the selected group identity while merging local expense state.
 */
export function useGroupDetail(groupId?: string): UseGroupDetailResult {
  const groupFromStore = useGroupsStore((state) => state.groups.find((group) => group.id === groupId));
  const createdExpenses = useExpensesStore((state) =>
    groupId ? state.expensesByGroup[groupId] ?? EMPTY_EXPENSES : EMPTY_EXPENSES,
  );
  const isSeededMockGroup = groupsListMock.some((group) => group.id === groupId);
  const createdTotals = sumExpenses(createdExpenses);

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
        totalExpense: createdTotals.total,
        totalExpenseChangePercent: 0,
        owedToYou: createdTotals.owedToYou,
        youOwe: createdTotals.youOwe,
      },
      memberBalances,
      recentExpenses: createdExpenses,
      totalExpensesCount: createdExpenses.length,
      isLoading: false,
    };
  }

  // A store entry can override a seeded mock expense when it shares its id
  // (i.e. the user edited a mock). Drop the overridden mock to avoid duplicates.
  const createdIds = new Set(createdExpenses.map((expense) => expense.id));
  const remainingMockExpenses = recentExpensesMock.filter((expense) => !createdIds.has(expense.id));
  const overriddenMockCount = recentExpensesMock.length - remainingMockExpenses.length;

  return {
    group: {
      ...groupDetailMock,
      id: groupFromStore?.id ?? groupDetailMock.id,
      name: groupFromStore?.name ?? groupDetailMock.name,
      category: groupFromStore?.category ?? groupDetailMock.category,
      totalExpense: groupDetailMock.totalExpense + createdTotals.total,
      owedToYou: groupDetailMock.owedToYou + createdTotals.owedToYou,
      youOwe: groupDetailMock.youOwe + createdTotals.youOwe,
    },
    memberBalances: memberBalancesMock,
    recentExpenses: [...createdExpenses, ...remainingMockExpenses],
    totalExpensesCount: totalExpensesCountMock + createdExpenses.length - overriddenMockCount,
    isLoading: false,
  };
}
