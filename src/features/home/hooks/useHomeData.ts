import { useExpensesStore } from '../../expenses/store/expensesStore';
import { useGroupsStore } from '../../groups/store/groupsStore';
import type {
  ExpenseCategory,
  GroupCategory,
  GroupExpense,
  GroupStatus,
  StoredGroup,
} from '../../groups/types';
import { useAuthStore } from '../../../shared/store/authStore';
import type { HomeActivity, HomeActivityCategory, HomeSummary, UseHomeDataResult } from '../types';

// How many recent expenses to surface on the home dashboard.
const RECENT_ACTIVITY_LIMIT = 5;

const activityCategoryByExpense: Record<ExpenseCategory, HomeActivityCategory> = {
  FOOD: 'food',
  TRANSPORT: 'transport',
  UTILITIES: 'utilities',
  SHOPPING: 'shopping',
  ENTERTAINMENT: 'entertainment',
  OTHER: 'other',
};

const homeCategoryLabels: Record<GroupCategory, string> = {
  TRAVEL: 'Viajes',
  HOME: 'Hogar',
  FOOD: 'Comida',
  EVENT: 'Eventos',
  OTHER: 'Otros',
};

function getGroupCoverUrl(group: StoredGroup) {
  if (group.image.type === 'uploaded') {
    return group.image.uri;
  }

  return `https://picsum.photos/seed/${group.id}/400/300`;
}

function getActiveDebtsLabel(status: GroupStatus) {
  if (status.type === 'pending') {
    return `${status.count} ${status.count === 1 ? 'deuda activa' : 'deudas activas'}`;
  }

  if (status.type === 'recent') {
    return 'Recién creado';
  }

  return 'Sin deudas activas';
}

function mapGroupToHomeGroup(group: StoredGroup) {
  return {
    id: group.id,
    name: group.name,
    category: homeCategoryLabels[group.category],
    coverUrl: getGroupCoverUrl(group),
    members: group.members,
    extraMembersCount: group.extraMembersCount,
    activeDebtsLabel: getActiveDebtsLabel(group.status),
  };
}

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

type SummaryTotals = {
  owedToYou: number;
  youOwe: number;
  owedByPeopleIds: Set<string>;
  owingGroupIds: Set<string>;
};

function accumulateSummary(
  totals: SummaryTotals,
  groupId: string,
  expenses: GroupExpense[],
  currentUserId: string,
) {
  for (const expense of expenses) {
    if (expense.userRelation.type === 'lent') {
      totals.owedToYou += expense.userRelation.amount;
      expense.participantIds.forEach((participantId) => {
        if (participantId !== currentUserId) {
          totals.owedByPeopleIds.add(participantId);
        }
      });
    }

    if (expense.userRelation.type === 'share') {
      totals.youOwe += expense.userRelation.amount;
      totals.owingGroupIds.add(groupId);
    }
  }
}

function roundToCents(value: number) {
  return Math.round(value * 100) / 100;
}

function buildRecentActivity(
  groups: StoredGroup[],
  expensesByGroup: Record<string, GroupExpense[]>,
  currentUserId: string,
): HomeActivity[] {
  const entries = groups.flatMap((group) =>
    (expensesByGroup[group.id] ?? []).map((expense) => ({ group, expense })),
  );

  return entries
    .sort((a, b) => new Date(b.expense.date).getTime() - new Date(a.expense.date).getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map(({ group, expense }) => {
      const youPaid = expense.paidById === currentUserId;

      return {
        id: expense.id,
        groupId: group.id,
        title: expense.title,
        context: `${youPaid ? 'Pagado por ti' : expense.paidByLabel} en ${group.name}`,
        // Positive when you paid, negative when someone else did, mirroring the
        // sign convention used by the activity amount renderer.
        amount: youPaid ? expense.totalAmount : -expense.totalAmount,
        timeLabel: expense.timeLabel,
        category: activityCategoryByExpense[expense.category] ?? 'other',
      };
    });
}

function buildSummary(totals: SummaryTotals): HomeSummary {
  const owedToYou = roundToCents(totals.owedToYou);
  const youOwe = roundToCents(totals.youOwe);

  return {
    owedToUser: {
      id: 'owed-to-user',
      title: 'Te deben',
      amount: owedToYou,
      detail: pluralize(totals.owedByPeopleIds.size, 'Persona', 'Personas'),
    },
    owedByUser: {
      id: 'owed-by-user',
      title: 'Debes',
      // Negative so the UI renders it as a debt; guard against -0.
      amount: youOwe > 0 ? -youOwe : 0,
      detail: pluralize(totals.owingGroupIds.size, 'Grupo', 'Grupos'),
    },
  };
}

export function useHomeData(): UseHomeDataResult {
  const groups = useGroupsStore((state) => state.groups);
  const expensesByGroup = useExpensesStore((state) => state.expensesByGroup);
  const currentUserId = useAuthStore((state) => state.user?.id) ?? 'current-user';

  const totals: SummaryTotals = {
    owedToYou: 0,
    youOwe: 0,
    owedByPeopleIds: new Set<string>(),
    owingGroupIds: new Set<string>(),
  };

  for (const group of groups) {
    accumulateSummary(totals, group.id, expensesByGroup[group.id] ?? [], currentUserId);
  }

  const summary = buildSummary(totals);
  const activeGroups = groups.slice(0, 2).map(mapGroupToHomeGroup);
  const recentActivity = buildRecentActivity(groups, expensesByGroup, currentUserId);

  return {
    data: {
      summary,
      activeGroups,
      recentActivity,
    },
    summary,
    activeGroups,
    recentActivity,
    isLoading: false,
    isError: false,
    error: null,
  };
}
