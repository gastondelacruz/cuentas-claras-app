import { useExpensesStore } from '../../expenses/store/expensesStore';
import { GroupDetail, GroupExpense, MemberBalance } from '../types';
import { groupDetailMock, memberBalancesMock, recentExpensesMock } from '../mocks/groupDetail.mock';
import { groupsListMock } from '../mocks/groupsList.mock';
import { useGroupsStore } from '../store/groupsStore';
import { useGroups } from './useGroups';

const EMPTY_EXPENSES: GroupExpense[] = [];
const EMPTY_IDS: string[] = [];

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
  group: GroupDetail | null;
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
  const { data, isLoading } = useGroups();
  const groupFromStore = useGroupsStore((state) => state.groups.find((group) => group.id === groupId));
  const isDeletedGroup = useGroupsStore((state) =>
    groupId ? state.deletedGroupIds.includes(groupId) : false,
  );
  const createdExpenses = useExpensesStore((state) =>
    groupId ? state.expensesByGroup[groupId] ?? EMPTY_EXPENSES : EMPTY_EXPENSES,
  );
  const deletedExpenseIds = useExpensesStore((state) =>
    groupId ? state.deletedExpenseIdsByGroup[groupId] ?? EMPTY_IDS : EMPTY_IDS,
  );
  const isSeededMockGroup = groupsListMock.some((group) => group.id === groupId);
  const groupFromApi = data?.data.find((group) => group.id === groupId);

  if (!groupId || isDeletedGroup || (!groupFromStore && !isSeededMockGroup && !groupFromApi)) {
    return {
      group: null,
      memberBalances: [],
      recentExpenses: [],
      totalExpensesCount: 0,
      isLoading,
    };
  }

  const createdTotals = sumExpenses(createdExpenses);

  if (groupFromApi && !groupFromStore && !isSeededMockGroup) {
    return {
      group: {
        id: groupFromApi.id,
        name: groupFromApi.name,
        category: 'OTHER',
        totalExpense: createdTotals.total,
        totalExpenseChangePercent: 0,
        owedToYou: createdTotals.owedToYou,
        youOwe: createdTotals.youOwe,
      },
      memberBalances: [
        {
          id: 'current-user',
          name: 'Vos',
          initials: 'YO',
          avatarUrl: null,
          isCurrentUser: true,
          balance: 0,
        },
      ],
      recentExpenses: createdExpenses,
      totalExpensesCount: createdExpenses.length,
      isLoading,
    };
  }

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
      isLoading,
    };
  }

  // A store entry can override a seeded mock expense when it shares its id
  // (i.e. the user edited a mock); a tombstone can mark one as deleted. Drop both
  // overridden and deleted mocks so the list reflects the real available set.
  const createdIds = new Set(createdExpenses.map((expense) => expense.id));
  const deletedIds = new Set(deletedExpenseIds);
  const remainingMockExpenses = recentExpensesMock.filter(
    (expense) => !createdIds.has(expense.id) && !deletedIds.has(expense.id),
  );
  const recentExpenses = [...createdExpenses, ...remainingMockExpenses];
  const realTotals = sumExpenses(recentExpenses);

  return {
    group: {
      ...groupDetailMock,
      id: groupFromStore?.id ?? groupDetailMock.id,
      name: groupFromStore?.name ?? groupDetailMock.name,
      category: groupFromStore?.category ?? groupDetailMock.category,
      totalExpense: realTotals.total,
      owedToYou: realTotals.owedToYou,
      youOwe: realTotals.youOwe,
    },
    memberBalances: memberBalancesMock,
    recentExpenses,
    // Honest count: the number of expenses actually available, not a fixed mock total.
    totalExpensesCount: recentExpenses.length,
    isLoading,
  };
}
