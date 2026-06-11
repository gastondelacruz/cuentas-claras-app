import { buildGroupMembers } from '../../groups/hooks/useGroupMembers';
import { useGroupsStore } from '../../groups/store/groupsStore';
import type { GroupMember } from '../../groups/types';
import { useAuthStore } from '../../../shared/store/authStore';
import { useExpensesStore } from '../store/expensesStore';
import { SettlementItem, SettlementPerson, SettlementSummary } from '../types';

type UseSettleDebtsResult = {
  summary: SettlementSummary;
  items: SettlementItem[];
};

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

type PersonNet = {
  person: SettlementPerson;
  net: number;
};

// Members are identified by name (an email for invited members), which stays
// stable across groups even when their per-group member id differs.
function personKey(member: GroupMember): string {
  return member.name;
}

function accumulate(netByPerson: Map<string, PersonNet>, member: GroupMember, delta: number) {
  const key = personKey(member);
  const existing = netByPerson.get(key);

  if (existing) {
    existing.net += delta;
    return;
  }

  netByPerson.set(key, {
    person: {
      id: key,
      name: member.name,
      initials: member.initials,
      avatarUrl: member.avatarUrl,
    },
    net: delta,
  });
}

/**
 * Computes the current user's net balance with every other person across all
 * groups, from real expenses. For each expense the cost is split equally:
 * if you paid, each other participant owes you their share; if someone else
 * paid and you participated, you owe them your share.
 *
 * `between-members` settlements (debts among other people) are not derived yet;
 * the current simplified model does not track them.
 */
export function useSettleDebts(): UseSettleDebtsResult {
  const groups = useGroupsStore((state) => state.groups);
  const expensesByGroup = useExpensesStore((state) => state.expensesByGroup);
  const authUser = useAuthStore((state) => state.user);

  const netByPerson = new Map<string, PersonNet>();

  for (const group of groups) {
    const members = buildGroupMembers(group, authUser);
    const currentUserId = members.find((member) => member.isCurrentUser)?.id ?? 'current-user';
    const memberById = new Map(members.map((member) => [member.id, member]));
    const expenses = expensesByGroup[group.id] ?? [];

    for (const expense of expenses) {
      const participantCount = Math.max(expense.participantIds.length, 1);
      const perHead = roundToCents(expense.totalAmount / participantCount);
      const youPaid = expense.paidById === currentUserId;
      const youParticipate = expense.participantIds.includes(currentUserId);

      if (youPaid) {
        for (const participantId of expense.participantIds) {
          if (participantId === currentUserId) {
            continue;
          }

          const member = memberById.get(participantId);
          if (member) {
            accumulate(netByPerson, member, perHead);
          }
        }
        continue;
      }

      if (youParticipate) {
        const payer = memberById.get(expense.paidById);
        if (payer) {
          accumulate(netByPerson, payer, -perHead);
        }
      }
    }
  }

  const items: SettlementItem[] = [];
  let owedToYou = 0;
  let youOwe = 0;

  for (const { person, net } of netByPerson.values()) {
    const balance = roundToCents(net);

    if (Math.abs(balance) < 0.01) {
      continue;
    }

    if (balance > 0) {
      owedToYou += balance;
      items.push({ id: `with-${person.id}`, type: 'with-user', person, direction: 'owes-you', amount: balance });
    } else {
      youOwe += -balance;
      items.push({ id: `with-${person.id}`, type: 'with-user', person, direction: 'you-owe', amount: -balance });
    }
  }

  // People who owe you first, then who you owe; larger amounts first.
  items.sort((a, b) => {
    const aOwesYou = a.type === 'with-user' && a.direction === 'owes-you';
    const bOwesYou = b.type === 'with-user' && b.direction === 'owes-you';

    if (aOwesYou !== bOwesYou) {
      return aOwesYou ? -1 : 1;
    }

    return b.amount - a.amount;
  });

  return {
    summary: { owedToYou: roundToCents(owedToYou), youOwe: roundToCents(youOwe) },
    items,
  };
}
