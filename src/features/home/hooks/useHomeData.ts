import { useQueries } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { selectAccountSummaryTotals } from '../../account/utils/accountSummaryTotals';
import { useAccountSummary } from '../../account/hooks/useAccountSummary';
import { getGroupExpenses } from '../../expenses/api/expensesApi';
import type { ExpenseListItemDto } from '../../expenses/schemas/expenseSchema';
import type { GroupListItemDto } from '../../groups/api/groupsApi';
import { useGroups } from '../../groups/hooks/useGroups';
import type { HomeActivity, HomeActivityCategory, HomeDashboardData, UseHomeDataResult } from '../types';

type HomeSourceGroup = Pick<GroupListItemDto, 'id' | 'name' | 'currentUserBalance' | 'expensesCount'>;

const LATEST_EXPENSES_PER_GROUP = 3;
const RECENT_ACTIVITY_LIMIT = 5;

const expenseCategoryToHomeCategory: Record<string, HomeActivityCategory> = {
  FOOD: 'food',
  TRANSPORT: 'transport',
  UTILITIES: 'utilities',
  SHOPPING: 'shopping',
  ENTERTAINMENT: 'entertainment',
  OTHER: 'other',
};

function getGroupCoverUrl(groupId: string) {
  return `https://picsum.photos/seed/${groupId}/400/300`;
}

function mapGroupToHomeGroup(group: HomeSourceGroup) {
  return {
    id: group.id,
    name: group.name,
    category: 'Otros',
    coverUrl: getGroupCoverUrl(group.id),
    members: [],
    extraMembersCount: 0,
    activeDebtsLabel: 'Recién creado',
  };
}

function buildSummaryFromAccountSummary(accountSummary: ReturnType<typeof selectAccountSummaryTotals>) {
  const { currency, totalToReceive, totalOwed, netBalance } = accountSummary;

  return {
    netBalance: {
      id: 'net-balance',
      title: 'Balance total',
      amount: netBalance,
      currency,
      detail: 'Balance neto',
      tone: netBalance >= 0 ? 'success' as const : 'debt' as const,
    },
    owedToUser: { id: 'owed-to-user', title: 'Te deben', amount: totalToReceive, currency, detail: currency, tone: 'success' as const },
    owedByUser: { id: 'owed-by-user', title: 'Debes', amount: totalOwed > 0 ? -totalOwed : 0, currency, detail: currency, tone: 'debt' as const },
  };
}

function getExpenseTimestamp(expense: ExpenseListItemDto): number {
  const parsedDate = new Date(expense.expenseDate).getTime();

  if (!Number.isNaN(parsedDate)) {
    return parsedDate;
  }

  const parsedCreatedAt = expense.createdAt ? new Date(expense.createdAt).getTime() : Number.NaN;
  return Number.isNaN(parsedCreatedAt) ? 0 : parsedCreatedAt;
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

function mapExpenseToHomeActivity(
  expense: ExpenseListItemDto,
  group: HomeSourceGroup,
): HomeActivity {
  return {
    id: expense.id,
    groupId: group.id,
    title: expense.title,
    context: group.name,
    amount: expense.amount,
    timeLabel: buildTimeLabel(expense.expenseDate),
    category: expenseCategoryToHomeCategory[expense.category ?? 'OTHER'] ?? 'other',
  };
}


export function useHomeData(): UseHomeDataResult {
  const { data: groupsResponse, isLoading: isGroupsLoading, isError: isGroupsError, error: groupsError } = useGroups();
  const { data: accountSummaryResponse, isLoading: isSummaryLoading, isError: isSummaryError, error: summaryError } = useAccountSummary();

  const groups = groupsResponse?.data ?? [];
  const groupsWithPossibleExpenses = isGroupsLoading
    ? []
    : groups.filter((group) => group.expensesCount !== 0);
  const latestExpenseQueries = useQueries({
    queries: groupsWithPossibleExpenses.map((group) => ({
      queryKey: queryKeys.expenses.latest(group.id),
      queryFn: () => getGroupExpenses(group.id, { limit: LATEST_EXPENSES_PER_GROUP }),
      enabled: !isGroupsLoading,
    })),
  });
  const summary = buildSummaryFromAccountSummary(selectAccountSummaryTotals(accountSummaryResponse));
  const activeGroups = groups.slice(0, 2).map(mapGroupToHomeGroup);

  const latestExpensesByGroup = latestExpenseQueries.flatMap((query, index) => {
    const group = groupsWithPossibleExpenses[index];

    if (!group) {
      return [];
    }

    return (query.data?.expenses ?? []).map((expense) => ({ expense, group }));
  });
  const recentActivity: HomeActivity[] = latestExpensesByGroup
    .sort((left, right) => getExpenseTimestamp(right.expense) - getExpenseTimestamp(left.expense))
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map(({ expense, group }) => mapExpenseToHomeActivity(expense, group));
  const isExpensesLoading = latestExpenseQueries.some((query) => query.isLoading);
  const expenseError = latestExpenseQueries.find((query) => query.isError)?.error as Error | undefined;

  const isLoading = isGroupsLoading || isSummaryLoading || isExpensesLoading;
  const isError = isGroupsError || isSummaryError || Boolean(expenseError);
  const data: HomeDashboardData | null = isLoading
    ? null
    : { summary, activeGroups, recentActivity };

  return {
    data,
    summary,
    activeGroups,
    recentActivity,
    isLoading,
    isError,
    error: (groupsError as Error | null) ?? (summaryError as Error | null) ?? expenseError ?? null,
  };
}
