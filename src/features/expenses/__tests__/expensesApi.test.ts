import { client } from '../../../shared/api/client';
import {
  createExpense,
  deleteExpense,
  getExpense,
  getGroupExpenses,
  updateExpense,
} from '../api/expensesApi';

jest.mock('../../../shared/api/client', () => ({
  client: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPost = jest.mocked(client.post);
const mockGet = jest.mocked(client.get);
const mockPatch = jest.mocked(client.patch);
const mockDelete = jest.mocked(client.delete);

// Real backend response shape (paidBy / participants, not paidByMemberId)
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

// All single-resource endpoints are wrapped: { data: { data: <payload> } }
describe('expensesApi.getGroupExpenses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /groups/:groupId/expenses with cursor params', async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: { expenses: [validExpense], nextCursor: 'cursor-1' } },
    });

    await getGroupExpenses('g1', { cursor: 'cursor-0', limit: 10 });

    expect(mockGet).toHaveBeenCalledWith('/groups/g1/expenses', {
      params: { cursor: 'cursor-0', limit: 10 },
    });
  });

  it('returns parsed paginated expenses', async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: { expenses: [validExpense], nextCursor: null } },
    });

    const result = await getGroupExpenses('g1');

    expect(result.expenses).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });

  it('throws when the response does not match the contract', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { expenses: [{ id: 'e1' }] } } });

    await expect(getGroupExpenses('g1')).rejects.toThrow(
      'API response does not match contract',
    );
  });
});

describe('expensesApi.createExpense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls POST /groups/:groupId/expenses with the payload', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: validExpense } });

    const input = {
      title: 'Cena',
      amount: 120.5,
      currency: 'ARS',
      paidByMemberId: 'm1',
      participantMemberIds: ['m1', 'm2'],
      splitType: 'equal' as const,
      expenseDate: '2024-05-20T00:00:00.000Z',
    };

    await createExpense('g1', input);

    expect(mockPost).toHaveBeenCalledWith('/groups/g1/expenses', input);
  });

  it('returns the parsed created expense', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: validExpense } });

    const result = await createExpense('g1', {
      title: 'Cena',
      amount: 120.5,
      currency: 'ARS',
      paidByMemberId: 'm1',
      participantMemberIds: ['m1', 'm2'],
      splitType: 'equal',
      expenseDate: '2024-05-20T00:00:00.000Z',
    });

    expect(result).toEqual(validExpense);
  });

  it('throws when the response does not match the contract', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { id: 'e1' } } });

    await expect(
      createExpense('g1', {
        title: 'Cena',
        amount: 120.5,
        currency: 'ARS',
        paidByMemberId: 'm1',
        participantMemberIds: ['m1'],
        splitType: 'equal',
        expenseDate: '2024-05-20T00:00:00.000Z',
      }),
    ).rejects.toThrow('API response does not match contract');
  });
});

describe('expensesApi.getExpense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /expenses/:expenseId and returns parsed data', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: validExpense } });

    const result = await getExpense('e1');

    expect(mockGet).toHaveBeenCalledWith('/expenses/e1');
    expect(result).toEqual(validExpense);
  });

  it('throws when the response does not match the contract', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { id: 'e1' } } });

    await expect(getExpense('e1')).rejects.toThrow(
      'API response does not match contract',
    );
  });
});

describe('expensesApi.updateExpense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls PATCH /expenses/:expenseId with the payload', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { ...validExpense, title: 'Cena editada' } } });

    const result = await updateExpense('e1', { title: 'Cena editada' });

    expect(mockPatch).toHaveBeenCalledWith('/expenses/e1', { title: 'Cena editada' });
    expect(result.title).toBe('Cena editada');
  });

  it('throws when the response does not match the contract', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { title: 'Invalid' } } });

    await expect(updateExpense('e1', { title: 'Invalid' })).rejects.toThrow(
      'API response does not match contract',
    );
  });
});

describe('expensesApi.deleteExpense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls DELETE /expenses/:expenseId and returns parsed data', async () => {
    mockDelete.mockResolvedValueOnce({
      data: { data: { id: 'e1', deletedAt: '2024-05-20T00:00:00.000Z' } },
    });

    const result = await deleteExpense('e1');

    expect(mockDelete).toHaveBeenCalledWith('/expenses/e1');
    expect(result.deletedAt).toBe('2024-05-20T00:00:00.000Z');
  });

  it('throws when the response does not match the contract', async () => {
    mockDelete.mockResolvedValueOnce({ data: { data: { id: 'e1' } } });

    await expect(deleteExpense('e1')).rejects.toThrow(
      'API response does not match contract',
    );
  });
});
