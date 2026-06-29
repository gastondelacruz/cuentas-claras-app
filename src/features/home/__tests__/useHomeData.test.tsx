import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { useGroups } from '../../groups/hooks/useGroups';
import { getGroupExpenses } from '../../expenses/api/expensesApi';
import { useHomeData } from '../hooks/useHomeData';

jest.mock('../../groups/hooks/useGroups', () => ({
  useGroups: jest.fn(),
}));

jest.mock('../../expenses/api/expensesApi', () => ({
  getGroupExpenses: jest.fn(),
}));

const mockedUseGroups = jest.mocked(useGroups);
const mockedGetGroupExpenses = jest.mocked(getGroupExpenses);

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } },
  });
}

function mockGroupsQuery(
  groups: Array<{ id: string; name: string; currentUserBalance?: number; expensesCount?: number }>,
  opts: { isLoading?: boolean; isError?: boolean; error?: Error | null } = {},
) {
  mockedUseGroups.mockReturnValue({
    data: {
      data: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: null,
        currency: 'ARS',
        currentUserBalance: g.currentUserBalance ?? 0,
        expensesCount: g.expensesCount ?? 0,
        createdAt: '2024-05-20T00:00:00.000Z',
        updatedAt: '2024-05-20T00:00:00.000Z',
      })),
    },
    isLoading: opts.isLoading ?? false,
    isError: opts.isError ?? false,
    error: opts.error ?? null,
  } as ReturnType<typeof useGroups>);
}

describe('useHomeData', () => {
  let testClient: QueryClient;

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={testClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    testClient = createTestQueryClient();
    mockGroupsQuery([]);
    mockedGetGroupExpenses.mockResolvedValue({ expenses: [], nextCursor: null });
  });

  afterEach(() => {
    testClient.clear();
  });

  it('returns loading while the groups query is fetching', () => {
    mockedUseGroups.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('maps a positive total balance (sum of groups) to owed-to-user summary', async () => {
    mockGroupsQuery([
      { id: 'g1', name: 'Viaje', currentUserBalance: 120 },
      { id: 'g2', name: 'Casa', currentUserBalance: 0 },
    ]);

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary.owedToUser.amount).toBe(120);
    expect(result.current.summary.owedByUser.amount).toBe(0);
  });

  it('maps a negative total balance to owed-by-user summary', async () => {
    mockGroupsQuery([{ id: 'g1', name: 'Viaje', currentUserBalance: -75 }]);

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary.owedToUser.amount).toBe(0);
    expect(result.current.summary.owedByUser.amount).toBe(-75);
  });

  it('keeps receivable and payable balances separate instead of netting them together', async () => {
    mockGroupsQuery([
      { id: 'g1', name: 'Viaje', currentUserBalance: 120 },
      { id: 'g2', name: 'Casa', currentUserBalance: -75 },
    ]);

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary.owedToUser.amount).toBe(120);
    expect(result.current.summary.owedByUser.amount).toBe(-75);
  });

  it('derives active groups from the API-backed groups query', async () => {
    mockGroupsQuery([
      { id: 'api-group-1', name: 'Cumple de Ana' },
      { id: 'api-group-2', name: 'Escapada a Tigre' },
      { id: 'api-group-3', name: 'Departamento' },
    ]);

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activeGroups).toHaveLength(2);
    expect(result.current.activeGroups.map((g) => g.name)).toEqual(['Cumple de Ana', 'Escapada a Tigre']);
  });

  it('maps the latest expenses from available group expense queries into recent activity', async () => {
    mockGroupsQuery([
      { id: 'g1', name: 'Viaje a Lisboa', currentUserBalance: 50, expensesCount: 2 },
      { id: 'g2', name: 'Departamento', currentUserBalance: -10, expensesCount: 1 },
    ]);
    mockedGetGroupExpenses.mockImplementation(async (groupId) => {
      if (groupId === 'g1') {
        return {
          expenses: [
            {
              id: 'expense-old',
              groupId: 'g1',
              title: 'Taxi al aeropuerto',
              amount: 3200,
              currency: 'ARS',
              paidBy: { id: 'm1', displayName: 'Gaston' },
              participantsCount: 2,
              category: 'TRANSPORT',
              expenseDate: '2026-06-27T11:57:48.434Z',
              createdAt: '2026-06-27T12:00:00.000Z',
            },
          ],
          nextCursor: null,
        };
      }

      return {
        expenses: [
          {
            id: 'expense-new',
            groupId: 'g2',
            title: 'Supermercado',
            amount: 8500,
            currency: 'ARS',
            paidBy: { id: 'm2', displayName: 'Ana' },
            participantsCount: 2,
            category: 'FOOD',
            expenseDate: '2026-06-29T10:00:00.000Z',
            createdAt: '2026-06-29T10:01:00.000Z',
          },
        ],
        nextCursor: null,
      };
    });

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedGetGroupExpenses).toHaveBeenCalledWith('g1', { limit: 3 });
    expect(mockedGetGroupExpenses).toHaveBeenCalledWith('g2', { limit: 3 });
    expect(result.current.recentActivity).toEqual([
      expect.objectContaining({
        id: 'expense-new',
        groupId: 'g2',
        title: 'Supermercado',
        context: 'Departamento',
        amount: 8500,
        category: 'food',
      }),
      expect.objectContaining({
        id: 'expense-old',
        groupId: 'g1',
        title: 'Taxi al aeropuerto',
        context: 'Viaje a Lisboa',
        amount: 3200,
        category: 'transport',
      }),
    ]);
  });

  it('keeps recent activity empty when fetched groups have no expenses', async () => {
    mockGroupsQuery([{ id: 'g1', name: 'Viaje', currentUserBalance: 50, expensesCount: 0 }]);

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedGetGroupExpenses).not.toHaveBeenCalled();
    expect(result.current.recentActivity).toEqual([]);
  });

  it('surfaces the groups query error state', async () => {
    const error = new Error('Groups failed');
    mockGroupsQuery([], { isError: true, error });

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
  });

  it('does not fetch expenses while the groups query is still loading', () => {
    mockedUseGroups.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useHomeData(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(mockedGetGroupExpenses).not.toHaveBeenCalled();
  });
});
