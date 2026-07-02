import {
  createPersonalTransactionSchema,
  personalTransactionSummaryResponseSchema,
} from '../personalTransactionSchema';

describe('createPersonalTransactionSchema', () => {
  it('parses a payload without accountId (backend defaults to the user default account)', () => {
    const payload = {
      type: 'expense' as const,
      amount: 12500,
      currency: 'ARS',
      category: 'Salud',
      occurredAt: '2026-06-29T12:00:00.000Z',
    };

    const result = createPersonalTransactionSchema.parse(payload);

    expect(result.accountId).toBeUndefined();
    expect(result).not.toHaveProperty('accountId');
  });

  it('still parses a payload with an explicit accountId', () => {
    const payload = {
      type: 'income' as const,
      amount: 500,
      currency: 'ARS',
      category: 'Salario',
      accountId: '550e8400-e29b-41d4-a716-446655440000',
      occurredAt: '2026-06-29T12:00:00.000Z',
    };

    const result = createPersonalTransactionSchema.parse(payload);

    expect(result.accountId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects an empty-string accountId when provided', () => {
    const payload = {
      type: 'expense' as const,
      amount: 100,
      currency: 'ARS',
      category: 'Salud',
      accountId: '',
      occurredAt: '2026-06-29T12:00:00.000Z',
    };

    expect(() => createPersonalTransactionSchema.parse(payload)).toThrow();
  });

  it('rejects a note longer than 200 characters', () => {
    const payload = {
      type: 'expense' as const,
      amount: 100,
      currency: 'ARS',
      category: 'Salud',
      occurredAt: '2026-06-29T12:00:00.000Z',
      note: 'a'.repeat(201),
    };

    expect(() => createPersonalTransactionSchema.parse(payload)).toThrow();
  });

  it('accepts a note of exactly 200 characters', () => {
    const payload = {
      type: 'expense' as const,
      amount: 100,
      currency: 'ARS',
      category: 'Salud',
      occurredAt: '2026-06-29T12:00:00.000Z',
      note: 'a'.repeat(200),
    };

    const result = createPersonalTransactionSchema.parse(payload);

    expect(result.note).toHaveLength(200);
  });

  it('accepts a missing note', () => {
    const payload = {
      type: 'expense' as const,
      amount: 100,
      currency: 'ARS',
      category: 'Salud',
      occurredAt: '2026-06-29T12:00:00.000Z',
    };

    const result = createPersonalTransactionSchema.parse(payload);

    expect(result.note).toBeUndefined();
  });
});

describe('personalTransactionSummaryResponseSchema', () => {
  it('parses a breakdown row with an unexpected type string without throwing and keeps the top total (Swagger defines breakdown.type as string, not a closed enum)', () => {
    const payload = {
      total: 123629,
      currency: 'ARS',
      incomeTotal: 500000,
      expenseTotal: 376371,
      breakdown: [
        { category: 'Reembolsos', type: 'refund', amount: 15000, percentage: 12 },
        { category: 'Salario', type: 'income', amount: 500000, percentage: 88 },
      ],
    };

    const result = personalTransactionSummaryResponseSchema.parse(payload);

    expect(result.total).toBe(123629);
    expect(result.breakdown[0].type).toBe('refund');
    expect(result.breakdown[1].type).toBe('income');
  });
});
