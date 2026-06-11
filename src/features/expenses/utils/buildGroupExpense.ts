import { createId } from '../../../shared/utils/createId';
import { ExpenseCategory, ExpenseUserRelation, GroupExpense } from '../../groups/types';

export type ExpenseParticipant = {
  id: string;
  name: string;
};

export type BuildGroupExpenseInput = {
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: Date;
  paidById: string;
  participantIds: string[];
  participants: ExpenseParticipant[];
  currentUserId: string;
  now?: Date;
  // When editing an existing expense, pass its id to keep identity stable.
  id?: string;
};

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
): ExpenseUserRelation {
  if (youPaid) {
    const lentAmount = roundToCents(amount - (userIncluded ? perHead : 0));

    return lentAmount > 0
      ? { type: 'lent', amount: lentAmount }
      : { type: 'none', amount: 0 };
  }

  if (userIncluded) {
    return { type: 'share', amount: perHead };
  }

  return { type: 'none', amount: 0 };
}

/**
 * Maps the create-expense form state into a GroupExpense.
 * The split is assumed to be equitable across the selected participants
 * (the explicit split UI was removed for now).
 */
export function buildGroupExpense(input: BuildGroupExpenseInput): GroupExpense {
  const { amount, description, category, date, paidById, participantIds, participants, currentUserId } = input;
  const now = input.now ?? new Date();

  const paidByParticipant = participants.find((participant) => participant.id === paidById);
  const youPaid = paidById === currentUserId;
  const paidByLabel = youPaid
    ? 'Pagado por mí'
    : `Pagado por ${paidByParticipant?.name ?? 'alguien'}`;

  const participantCount = Math.max(participantIds.length, 1);
  const perHead = roundToCents(amount / participantCount);
  const userIncluded = participantIds.includes(currentUserId);

  return {
    id: input.id ?? createId(),
    title: description,
    paidByLabel,
    timeLabel: buildTimeLabel(date, now),
    totalAmount: amount,
    category,
    userRelation: buildUserRelation(amount, perHead, youPaid, userIncluded),
    paidById,
    participantIds,
    date: date.toISOString(),
  };
}
