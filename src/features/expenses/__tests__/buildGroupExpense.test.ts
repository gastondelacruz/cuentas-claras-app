import { buildGroupExpense, ExpenseParticipant } from '../utils/buildGroupExpense';

const participants: ExpenseParticipant[] = [
  { id: 'you', name: 'Tú' },
  { id: 'sarah', name: 'Sarah Miller' },
  { id: 'alex', name: 'Alex Chen' },
];

const baseInput = {
  amount: 300,
  description: 'Cena',
  category: 'FOOD' as const,
  date: new Date(2024, 4, 20),
  participants,
  currentUserId: 'you',
  now: new Date(2024, 4, 20),
};

describe('buildGroupExpense', () => {
  it('marks the current user as lender with an equitable split when they paid', () => {
    const expense = buildGroupExpense({
      ...baseInput,
      paidById: 'you',
      participantIds: ['you', 'sarah', 'alex'],
    });

    expect(expense).toMatchObject({
      title: 'Cena',
      paidByLabel: 'Pagado por mí',
      timeLabel: 'Hoy',
      totalAmount: 300,
      category: 'FOOD',
      userRelation: { type: 'lent', amount: 200 },
    });
  });

  it('marks the current user share when someone else paid', () => {
    const expense = buildGroupExpense({
      ...baseInput,
      paidById: 'alex',
      participantIds: ['you', 'sarah', 'alex'],
    });

    expect(expense.paidByLabel).toBe('Pagado por Alex Chen');
    expect(expense.userRelation).toEqual({ type: 'share', amount: 100 });
  });

  it('uses a "none" relation when the current user is not a participant', () => {
    const expense = buildGroupExpense({
      ...baseInput,
      paidById: 'alex',
      participantIds: ['sarah', 'alex'],
    });

    expect(expense.userRelation).toEqual({ type: 'none', amount: 0 });
  });

  it('persists the raw form inputs needed to edit the expense', () => {
    const expense = buildGroupExpense({
      ...baseInput,
      paidById: 'alex',
      participantIds: ['you', 'alex'],
    });

    expect(expense.paidById).toBe('alex');
    expect(expense.participantIds).toEqual(['you', 'alex']);
    expect(expense.date).toBe(new Date(2024, 4, 20).toISOString());
  });

  it('keeps the provided id when editing instead of generating a new one', () => {
    const expense = buildGroupExpense({
      ...baseInput,
      id: 'expense-existing',
      paidById: 'you',
      participantIds: ['you'],
    });

    expect(expense.id).toBe('expense-existing');
  });

  it('generates an id when none is provided', () => {
    const expense = buildGroupExpense({
      ...baseInput,
      paidById: 'you',
      participantIds: ['you'],
    });

    expect(expense.id).toMatch(/^expense-\d+$/);
  });

  it('builds relative time labels', () => {
    const yesterday = buildGroupExpense({
      ...baseInput,
      date: new Date(2024, 4, 19),
      paidById: 'you',
      participantIds: ['you'],
    });
    expect(yesterday.timeLabel).toBe('Ayer');

    const older = buildGroupExpense({
      ...baseInput,
      date: new Date(2024, 4, 10),
      paidById: 'you',
      participantIds: ['you', 'sarah'],
    });
    expect(older.timeLabel).toBe('10/05/2024');
  });
});
