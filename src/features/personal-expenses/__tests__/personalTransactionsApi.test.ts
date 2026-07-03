import { client } from '../../../shared/api/client';
import {
  createPersonalTransaction,
  getPersonalTransactions,
  getPersonalTransactionsSummary,
  updatePersonalTransaction,
} from '../api/personalTransactionsApi';

jest.mock('../../../shared/api/client', () => ({
  client: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockGet = jest.mocked(client.get);
const mockPost = jest.mocked(client.post);
const mockPatch = jest.mocked(client.patch);

const validTransaction = {
  id: 'ptx-1',
  type: 'expense',
  amount: 12500,
  currency: 'ARS',
  category: 'Salud',
  accountId: 'account-ars',
  accountName: 'Pesos',
  occurredAt: '2026-06-27T12:00:00.000Z',
  note: null,
  createdAt: '2026-06-27T12:00:00.000Z',
  updatedAt: '2026-06-27T12:00:00.000Z',
};

describe('personalTransactionsApi.getPersonalTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /me/personal-transactions with filter params', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          transactions: [validTransaction],
          nextCursor: 'cursor-1',
          total: 12500,
          incomeTotal: 0,
          expenseTotal: 12500,
          currency: 'ARS',
        },
      },
    });

    await getPersonalTransactions({
      type: 'expense',
      range: 'week',
      from: '2026-06-22',
      to: '2026-06-28',
      cursor: 'cursor-0',
      limit: 20,
    });

    expect(mockGet).toHaveBeenCalledWith('/me/personal-transactions', {
      params: {
        type: 'expense',
        range: 'week',
        from: '2026-06-22',
        to: '2026-06-28',
        cursor: 'cursor-0',
        limit: 20,
      },
    });
  });

  it('returns the parsed envelope payload', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          transactions: [validTransaction],
          nextCursor: null,
          total: 12500,
          incomeTotal: 0,
          expenseTotal: 12500,
          currency: 'ARS',
        },
      },
    });

    const result = await getPersonalTransactions({ type: 'expense', range: 'week' });

    expect(result.transactions).toHaveLength(1);
    expect(result.total).toBe(12500);
    expect(result.currency).toBe('ARS');
  });

  it('throws when the response does not match the contract', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { transactions: [{ id: 'ptx-1' }] } } });

    await expect(getPersonalTransactions({ type: 'expense', range: 'week' })).rejects.toThrow(
      'API response does not match contract',
    );
  });

  it('includes accountName in the parsed transaction (PersonalTransactionResponseDto contract)', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          transactions: [validTransaction],
          nextCursor: null,
          total: 12500,
          incomeTotal: 0,
          expenseTotal: 12500,
          currency: 'ARS',
        },
      },
    });

    const result = await getPersonalTransactions({ type: 'expense', range: 'week' });

    expect(result.transactions[0].accountName).toBe('Pesos');
  });

  it('throws when a transaction is missing accountName (required per contract)', async () => {
    const { accountName: _accountName, ...transactionWithoutAccountName } = validTransaction;

    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          transactions: [transactionWithoutAccountName],
          nextCursor: null,
          total: 12500,
          incomeTotal: 0,
          expenseTotal: 12500,
          currency: 'ARS',
        },
      },
    });

    await expect(getPersonalTransactions({ type: 'expense', range: 'week' })).rejects.toThrow(
      'API response does not match contract',
    );
  });

  it('parses a transaction with note: null successfully', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          transactions: [{ ...validTransaction, note: null }],
          nextCursor: null,
          total: 12500,
          incomeTotal: 0,
          expenseTotal: 12500,
          currency: 'ARS',
        },
      },
    });

    const result = await getPersonalTransactions({ type: 'expense', range: 'week' });

    expect(result.transactions[0].note).toBeNull();
  });

  it('throws when a transaction is missing the note key (required but nullable per contract)', async () => {
    const { note: _note, ...transactionWithoutNote } = validTransaction;

    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          transactions: [transactionWithoutNote],
          nextCursor: null,
          total: 12500,
          incomeTotal: 0,
          expenseTotal: 12500,
          currency: 'ARS',
        },
      },
    });

    await expect(getPersonalTransactions({ type: 'expense', range: 'week' })).rejects.toThrow(
      'API response does not match contract',
    );
  });
});

describe('personalTransactionsApi.getPersonalTransactionsSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /me/personal-transactions/summary with range params and returns the parsed envelope payload', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          total: 123629,
          currency: 'ARS',
          incomeTotal: 500000,
          expenseTotal: 376371,
          breakdown: [
            {
              category: 'Salario',
              type: 'income',
              amount: 500000,
              percentage: 100,
            },
          ],
        },
      },
    });

    const result = await getPersonalTransactionsSummary({
      range: 'period',
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.999Z',
    });

    expect(mockGet).toHaveBeenCalledWith('/me/personal-transactions/summary', {
      params: {
        range: 'period',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-30T23:59:59.999Z',
      },
    });
    expect(result.total).toBe(123629);
    expect(result.breakdown[0]).toEqual({
      category: 'Salario',
      type: 'income',
      amount: 500000,
      percentage: 100,
    });
  });

  it('does not blank the top Total when a breakdown row has an unexpected type string (Swagger defines type as string, not a closed enum)', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          total: 123629,
          currency: 'ARS',
          incomeTotal: 500000,
          expenseTotal: 376371,
          breakdown: [
            { category: 'Reembolsos', type: 'refund', amount: 15000, percentage: 12 },
            { category: 'Salario', type: 'income', amount: 500000, percentage: 88 },
          ],
        },
      },
    });

    const result = await getPersonalTransactionsSummary({ range: 'week' });

    expect(result.total).toBe(123629);
    expect(result.breakdown).toHaveLength(2);
  });

  it('throws when summary breakdown uses the old fixture shape instead of Swagger amount/percentage', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          total: 876371,
          currency: 'ARS',
          incomeTotal: 876371,
          expenseTotal: 0,
          breakdown: [{ type: 'income', category: 'Salario', total: 876371, currency: 'ARS' }],
        },
      },
    });

    await expect(getPersonalTransactionsSummary({ range: 'week' })).rejects.toThrow(
      'API response does not match contract',
    );
  });

  it('throws when the summary response does not match the contract', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { total: 876371 } } });

    await expect(getPersonalTransactionsSummary({ range: 'week' })).rejects.toThrow(
      'API response does not match contract',
    );
  });
});

describe('personalTransactionsApi.createPersonalTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /me/personal-transactions with the transaction payload', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: validTransaction } });

    const input = {
      type: 'income' as const,
      amount: 876371,
      currency: 'ARS',
      category: 'Salario',
      accountId: 'account-ars',
      occurredAt: '2026-06-27T12:00:00.000Z',
      note: 'June salary',
    };

    await createPersonalTransaction(input);

    expect(mockPost).toHaveBeenCalledWith('/me/personal-transactions', input);
  });

  it('returns the parsed created transaction', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: validTransaction } });

    const result = await createPersonalTransaction({
      type: 'expense',
      amount: 12500,
      currency: 'ARS',
      category: 'Salud',
      accountId: 'account-ars',
      occurredAt: '2026-06-27T12:00:00.000Z',
    });

    expect(result).toEqual(validTransaction);
  });
});

describe('personalTransactionsApi.updatePersonalTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls PATCH /me/personal-transactions/:id with the partial payload', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: validTransaction } });

    const input = {
      amount: 46000,
      category: 'Salud',
      note: null,
    };

    await updatePersonalTransaction('ptx-1', input);

    expect(mockPatch).toHaveBeenCalledWith('/me/personal-transactions/ptx-1', input);
  });

  it('returns the parsed updated transaction', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: validTransaction } });

    const result = await updatePersonalTransaction('ptx-1', { amount: 46000 });

    expect(result).toEqual(validTransaction);
  });

  it('throws when the response does not match the contract', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { id: 'ptx-1' } } });

    await expect(updatePersonalTransaction('ptx-1', { amount: 46000 })).rejects.toThrow(
      'API response does not match contract',
    );
  });
});
