import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { getPersonalTransactions } from '../api/personalTransactionsApi';
import { useCreatePersonalTransaction } from '../hooks/useCreatePersonalTransaction';
import { usePersonalTransactions } from '../hooks/usePersonalTransactions';

jest.mock('../api/personalTransactionsApi', () => ({
  getPersonalTransactions: jest.fn(),
  createPersonalTransaction: jest.fn(async (input) => ({
    id: 'ptx-created',
    ...input,
    note: input.note ?? null,
    createdAt: '2026-06-27T12:00:00.000Z',
    updatedAt: '2026-06-27T12:00:00.000Z',
  })),
}));

const mockGetPersonalTransactions = jest.mocked(getPersonalTransactions);

let testClient: QueryClient;

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={testClient}>{children}</QueryClientProvider>;
}

describe('usePersonalTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    mockGetPersonalTransactions.mockResolvedValue({
      transactions: [],
      nextCursor: null,
      total: 876371,
      incomeTotal: 876371,
      expenseTotal: 0,
      currency: 'ARS',
    });
  });

  afterEach(() => {
    testClient.clear();
  });

  it('fetches personal transactions with a stable personal-expenses query key', async () => {
    const filters = { type: 'income' as const, range: 'week' as const, from: '2026-06-22', to: '2026-06-28' };

    const { result } = renderHook(() => usePersonalTransactions(filters), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetPersonalTransactions).toHaveBeenCalledWith({ ...filters, limit: 20 });
    expect(testClient.getQueryState(queryKeys.personalTransactions.list(filters))).toBeTruthy();
    expect(result.current.transactions).toEqual([]);
    expect(result.current.hasFetchedTransactions).toBe(true);
    expect(result.current.total).toBe(876371);
  });

  it('invalidates personal transaction lists after a successful create mutation', async () => {
    const invalidateSpy = jest.spyOn(testClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreatePersonalTransaction(), { wrapper: Wrapper });

    result.current.mutate({
      type: 'expense',
      amount: 1200,
      currency: 'ARS',
      category: 'Café',
      accountId: 'account-ars',
      occurredAt: '2026-06-27T12:00:00.000Z',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.personalTransactions.all() });
  });
});
