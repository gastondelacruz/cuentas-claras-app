import {
  expenseSchema,
  expenseListResponseSchema,
  expenseDeleteResponseSchema,
} from '../expenseSchema';

// Real backend response shape: paidBy / participants (not paidByMemberId)
const validExpense = {
  id: 'e1',
  groupId: 'g1',
  title: 'Cena',
  amount: 120.5,
  currency: 'ARS',
  paidBy: { id: 'm1', displayName: 'Vos' },
  participants: [
    { memberId: 'm1', displayName: 'Vos', owedAmount: 0, paidAmount: 120.5, netAmount: 60.25 },
    { memberId: 'm2', displayName: 'Ana', owedAmount: 60.25, paidAmount: 0, netAmount: -60.25 },
  ],
  splitType: 'equal',
  category: 'FOOD',
  notes: null,
  expenseDate: '2024-05-20T00:00:00.000Z',
  createdAt: '2024-05-20T00:00:00.000Z',
  updatedAt: '2024-05-20T00:00:00.000Z',
};

// List items don't have splitType or participants — use list item shape
const validListItem = {
  id: 'e1',
  groupId: 'g1',
  title: 'Cena',
  amount: 120.5,
  currency: 'ARS',
  paidBy: { id: 'm1', displayName: 'Vos' },
  participantsCount: 2,
  category: 'FOOD',
  expenseDate: '2024-05-20T00:00:00.000Z',
  createdAt: '2024-05-20T00:00:00.000Z',
};

describe('expenseSchema', () => {
  it('parses a valid expense with paidBy and participants', () => {
    const result = expenseSchema.parse(validExpense);
    expect(result.id).toBe('e1');
    expect(result.paidBy.id).toBe('m1');
    expect(result.participants).toHaveLength(2);
  });

  it('parses an expense without optional fields', () => {
    const minimal = {
      id: 'e2',
      title: 'Taxi',
      amount: 45,
      currency: 'ARS',
      paidBy: { id: 'm1', displayName: 'Vos' },
      splitType: 'equal',
      expenseDate: '2024-05-21T00:00:00.000Z',
    };

    const result = expenseSchema.parse(minimal);

    expect(result.category).toBeUndefined();
    expect(result.notes).toBeUndefined();
    expect(result.participants).toBeUndefined();
  });

  it('throws when required fields are missing', () => {
    expect(() => expenseSchema.parse({ id: 'e3' })).toThrow();
  });
});

describe('expenseListResponseSchema', () => {
  it('parses a paginated list with a cursor', () => {
    const response = {
      expenses: [validListItem],
      nextCursor: 'cursor-1',
    };

    const result = expenseListResponseSchema.parse(response);

    expect(result.expenses).toHaveLength(1);
    expect(result.nextCursor).toBe('cursor-1');
  });

  it('parses the last page when nextCursor is null', () => {
    const response = {
      expenses: [validListItem],
      nextCursor: null,
    };

    const result = expenseListResponseSchema.parse(response);

    expect(result.nextCursor).toBeNull();
  });

  it('throws when expenses is not an array', () => {
    expect(() =>
      expenseListResponseSchema.parse({ expenses: validListItem, nextCursor: null }),
    ).toThrow();
  });
});

describe('expenseDeleteResponseSchema', () => {
  it('parses a successful delete response', () => {
    const response = {
      id: 'e1',
      deletedAt: '2024-05-20T00:00:00.000Z',
    };

    const result = expenseDeleteResponseSchema.parse(response);

    expect(result).toEqual(response);
  });

  it('throws when deletedAt is missing', () => {
    expect(() => expenseDeleteResponseSchema.parse({ id: 'e1' })).toThrow();
  });
});
