import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { getExpense } from '../api/expensesApi';
import { useExpenseToEdit } from '../hooks/useExpenseToEdit';
import { useAuthStore } from '../../../shared/store/authStore';

jest.mock('../api/expensesApi', () => ({
  getExpense: jest.fn(),
  getGroupExpenses: jest.fn(),
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
}));

const mockGetExpense = jest.mocked(getExpense);

// Fixture using real backend response shape
const apiExpense = {
  id: 'e1',
  title: 'Cena',
  amount: 120,
  currency: 'ARS',
  paidBy: { id: 'current-user', displayName: 'Vos' },
  participants: [
    { memberId: 'current-user', displayName: 'Vos', owedAmount: 0, paidAmount: 120, netAmount: 60 },
    { memberId: 'm2', displayName: 'Ana', owedAmount: 60, paidAmount: 0, netAmount: -60 },
  ],
  splitType: 'equal' as const,
  category: 'FOOD' as const,
  notes: null,
  expenseDate: '2024-05-20T00:00:00.000Z',
};

describe('useExpenseToEdit', () => {
  let testClient: QueryClient;

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={testClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.clearAllMocks();
    testClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'tok');
  });

  afterEach(() => {
    testClient.clear();
    jest.useRealTimers();
  });

  it('returns undefined when no expenseId is provided', () => {
    const { result } = renderHook(() => useExpenseToEdit('group-1', undefined), { wrapper: Wrapper });

    expect(result.current).toBeUndefined();
    expect(mockGetExpense).not.toHaveBeenCalled();
  });

  it('returns undefined while loading', () => {
    mockGetExpense.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useExpenseToEdit('group-1', 'e1'), { wrapper: Wrapper });

    expect(result.current).toBeUndefined();
  });

  it('maps the API expense to a GroupExpense when resolved', async () => {
    mockGetExpense.mockResolvedValueOnce(apiExpense);

    const { result } = renderHook(() => useExpenseToEdit('group-1', 'e1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current).toBeDefined());

    expect(result.current).toMatchObject({
      id: 'e1',
      title: 'Cena',
      totalAmount: 120,
      category: 'FOOD',
      paidById: 'current-user',
      participantIds: ['current-user', 'm2'],
      date: '2024-05-20T00:00:00.000Z',
      paidByLabel: 'Pagado por mí',
    });
    expect(result.current?.userRelation).toEqual({ type: 'lent', amount: 60 });
  });

  it('maps a share relation when someone else paid and the current user participates', async () => {
    mockGetExpense.mockResolvedValueOnce({
      ...apiExpense,
      paidBy: { id: 'm2', displayName: 'Ana' },
    });

    const { result } = renderHook(() => useExpenseToEdit('group-1', 'e1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current).toBeDefined());

    expect(result.current?.paidByLabel).toBe('Pagado por Ana');
    expect(result.current?.userRelation).toEqual({ type: 'share', amount: 60 });
  });

  it('returns undefined when the detail query fails', async () => {
    mockGetExpense.mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useExpenseToEdit('group-1', 'e1'), { wrapper: Wrapper });

    await waitFor(() => expect(mockGetExpense).toHaveBeenCalled());

    expect(result.current).toBeUndefined();
  });
});
