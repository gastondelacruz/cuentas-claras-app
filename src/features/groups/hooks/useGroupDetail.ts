import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { useAuthStore } from '../../../shared/store/authStore';
import { useGroupExpenses } from '../../expenses/hooks/useGroupExpenses';
import { ExpenseListItemDto } from '../../expenses/schemas/expenseSchema';
import { GroupApiType, getGroup, getGroupBalances } from '../api/groupsApi';
import { ExpenseCategory, GroupDetail, GroupExpense, MemberBalance } from '../types';
import { getPayableAmount, getReceivableAmount } from '../utils/balanceContract';
import type { AuthUser } from '../../../shared/store/authStore';
import type { GroupBalanceItemDto, GroupDetailDto } from '../schemas/groupSchema';

const EMPTY_EXPENSES: GroupExpense[] = [];

const apiTypeToCategory: Record<GroupApiType, GroupDetail['category']> = {
  trip: 'TRAVEL',
  home: 'HOME',
  couple: 'OTHER',
  friends: 'OTHER',
  event: 'EVENT',
  other: 'OTHER',
};

const validExpenseCategories = new Set<ExpenseCategory>([
  'FOOD',
  'TRANSPORT',
  'UTILITIES',
  'SHOPPING',
  'ENTERTAINMENT',
  'OTHER',
]);

function toExpenseCategory(category: ExpenseListItemDto['category']): ExpenseCategory {
  return category && validExpenseCategories.has(category as ExpenseCategory)
    ? (category as ExpenseCategory)
    : 'OTHER';
}

function toStartOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function buildTimeLabel(dateValue: string, now = new Date()): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((toStartOfDay(now) - toStartOfDay(date)) / oneDay);

  if (diffDays === 0) {
    return 'Hoy';
  }

  if (diffDays === 1) {
    return 'Ayer';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function mapExpenseListItemToGroupExpense(expense: ExpenseListItemDto): GroupExpense {
  return {
    id: expense.id,
    title: expense.title,
    paidByLabel: `Pagado por ${expense.paidBy.displayName}`,
    timeLabel: buildTimeLabel(expense.expenseDate),
    totalAmount: expense.amount,
    category: toExpenseCategory(expense.category),
    userRelation: { type: 'none', amount: 0 },
    paidById: expense.paidBy.id,
    participantIds: [],
    date: expense.expenseDate,
  };
}

function getCurrentMemberId(groupDetail: GroupDetailDto, authUser: AuthUser | null): string | undefined {
  const currentMember = groupDetail.members.find((member) => member.isCurrentUser);

  if (currentMember?.id) {
    return currentMember.id;
  }

  const authMatchedMember = groupDetail.members.find(
    (member) =>
      (Boolean(member.id) && member.id === authUser?.id) ||
      (Boolean(member.email) && member.email === authUser?.email),
  );

  return authMatchedMember?.id;
}

function isCurrentUserBalance(
  balance: GroupBalanceItemDto,
  currentMemberId: string | undefined,
  authUser: AuthUser | null,
): boolean {
  return Boolean(
    balance.isCurrentUser ||
      (currentMemberId && balance.memberId === currentMemberId) ||
      (authUser?.id && balance.memberId === authUser.id),
  );
}

type UseGroupDetailResult = {
  group: GroupDetail | null;
  memberBalances: MemberBalance[];
  recentExpenses: GroupExpense[];
  totalExpensesCount: number;
  isLoading: boolean;
  isFetching: boolean;
};

export function useGroupDetail(groupId?: string): UseGroupDetailResult {
  const authUser = useAuthStore((state) => state.user);

  const { data: groupDetail, isLoading: isDetailLoading, isFetching: isDetailFetching } = useQuery({
    queryKey: queryKeys.groups.detail(groupId ?? ''),
    queryFn: () => getGroup(groupId!),
    enabled: Boolean(groupId),
  });

  const { data: balancesData, isLoading: isBalancesLoading, isFetching: isBalancesFetching } = useQuery({
    queryKey: queryKeys.groups.balances(groupId ?? ''),
    queryFn: () => getGroupBalances(groupId!),
    enabled: Boolean(groupId),
  });

  const { expenses, isLoading: isExpensesLoading } = useGroupExpenses(groupId);

  const isLoading = isDetailLoading || isBalancesLoading || isExpensesLoading;
  const isFetching = isDetailFetching || isBalancesFetching || isExpensesLoading;

  if (!groupId || !groupDetail) {
    return {
      group: null,
      memberBalances: [],
      recentExpenses: EMPTY_EXPENSES,
      totalExpensesCount: 0,
      isLoading,
      isFetching,
    };
  }

  const currentMemberId = getCurrentMemberId(groupDetail, authUser);
  const rawBalances = balancesData?.balances ?? [];
  const derivedCurrentUserBalance = rawBalances.find((item) =>
    isCurrentUserBalance(item, currentMemberId, authUser),
  )?.balance;
  const currentUserBalance = groupDetail.currentUserBalance ?? derivedCurrentUserBalance ?? 0;
  const owedToYou = getReceivableAmount(currentUserBalance);
  const youOwe = getPayableAmount(currentUserBalance);
  const totalExpense = groupDetail.totalAmount ?? expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const group: GroupDetail = {
    id: groupDetail.id,
    name: groupDetail.name ?? '',
    category: apiTypeToCategory[groupDetail.type ?? 'other'] ?? 'OTHER',
    totalExpense,
    totalExpenseChangePercent: 0,
    owedToYou,
    youOwe,
  };

  const memberBalances: MemberBalance[] = rawBalances.map((item) => ({
    id: item.memberId,
    name: item.displayName,
    avatarUrl: null,
    initials: item.displayName.slice(0, 2).toUpperCase(),
    isCurrentUser: isCurrentUserBalance(item, currentMemberId, authUser),
    balance: item.balance,
  }));

  const recentExpenses = expenses.map(mapExpenseListItemToGroupExpense);

  return {
    group,
    memberBalances,
    recentExpenses,
    totalExpensesCount: groupDetail.expensesCount ?? expenses.length,
    isLoading,
    isFetching,
  };
}
