import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { useAuthStore } from '../../../shared/store/authStore';
import { getExpense } from '../api/expensesApi';
import { ExpenseDto } from '../schemas/expenseSchema';
import { GroupExpense } from '../../groups/types';

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function toStartOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function buildTimeLabel(date: Date, now: Date): string {
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

function buildUserRelation(
  amount: number,
  perHead: number,
  youPaid: boolean,
  userIncluded: boolean,
) {
  if (youPaid) {
    const lentAmount = roundToCents(amount - (userIncluded ? perHead : 0));

    return lentAmount > 0
      ? ({ type: 'lent', amount: lentAmount } as const)
      : ({ type: 'none', amount: 0 } as const);
  }

  if (userIncluded) {
    return { type: 'share', amount: perHead } as const;
  }

  return { type: 'none', amount: 0 } as const;
}

function mapExpenseToGroupExpense(
  expense: ExpenseDto,
  currentUserId: string | undefined,
): GroupExpense {
  // API returns paidBy: { id, displayName } and participants: [{ memberId, ... }]
  const paidById = expense.paidBy.id;
  const participantIds = expense.participants?.map((p) => p.memberId) ?? [];
  const youPaid = paidById === currentUserId;
  const userIncluded = participantIds.includes(currentUserId ?? '');
  const participantCount = Math.max(participantIds.length, 1);
  const perHead = roundToCents(expense.amount / participantCount);
  const expenseDate = new Date(expense.expenseDate);

  // Category comes as a raw string from the API — cast to ExpenseCategory or default
  const VALID_CATEGORIES = ['FOOD', 'TRANSPORT', 'UTILITIES', 'SHOPPING', 'ENTERTAINMENT', 'OTHER'] as const;
  type ValidCategory = typeof VALID_CATEGORIES[number];
  const rawCategory = (expense.category?.toUpperCase() ?? '') as string;
  const category: ValidCategory = VALID_CATEGORIES.includes(rawCategory as ValidCategory)
    ? (rawCategory as ValidCategory)
    : 'OTHER';

  return {
    id: expense.id,
    title: expense.title,
    paidByLabel: youPaid ? 'Pagado por mí' : `Pagado por ${expense.paidBy.displayName}`,
    timeLabel: buildTimeLabel(expenseDate, new Date()),
    totalAmount: expense.amount,
    category,
    userRelation: buildUserRelation(expense.amount, perHead, youPaid, userIncluded),
    paidById,
    participantIds,
    date: expense.expenseDate,
  };
}

/**
 * Resolves the expense being edited for a given group, if any.
 *
 * The detail is fetched from the backend and mapped to the GroupExpense shape
 * used by the create/edit form.
 */
export function useExpenseToEdit(
  groupId?: string,
  expenseId?: string,
): GroupExpense | undefined {
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { data } = useQuery({
    queryKey: queryKeys.expenses.detail(expenseId ?? ''),
    queryFn: () => getExpense(expenseId!),
    enabled: Boolean(expenseId),
  });

  if (!expenseId || !data) {
    return undefined;
  }

  return mapExpenseToGroupExpense(data, currentUserId);
}
