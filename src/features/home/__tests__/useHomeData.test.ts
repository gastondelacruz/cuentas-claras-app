import { renderHook } from '@testing-library/react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import type { ExpenseUserRelation, GroupExpense } from '../../groups/types';
import { useGroupsStore } from '../../groups/store/groupsStore';
import { useGroups } from '../../groups/hooks/useGroups';
import { useHomeData } from '../hooks/useHomeData';

jest.mock('../../groups/hooks/useGroups', () => ({
  useGroups: jest.fn(),
}));

const mockedUseGroups = jest.mocked(useGroups);

function mockGroupsQuery(groups: Array<{ id: string; name: string; description?: string | null }>) {
  mockedUseGroups.mockReturnValue({
    data: {
      data: groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description ?? null,
        currency: 'ARS',
        createdAt: '2024-05-20T00:00:00.000Z',
        updatedAt: '2024-05-20T00:00:00.000Z',
      })),
    },
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof useGroups>);
}

function makeExpense(
  id: string,
  userRelation: ExpenseUserRelation,
  participantIds: string[],
  overrides: Partial<GroupExpense> = {},
): GroupExpense {
  return {
    id,
    title: `Gasto ${id}`,
    paidByLabel: 'Pagado por mí',
    timeLabel: 'Hoy',
    totalAmount: 0,
    category: 'FOOD',
    userRelation,
    paidById: participantIds[0] ?? 'current-user',
    participantIds,
    date: '2024-05-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('useHomeData', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    jest.clearAllMocks();
    mockGroupsQuery([]);
  });

  it('starts from an empty state with query-shaped data', () => {
    const { result } = renderHook(() => useHomeData());

    expect(result.current.data).toEqual({
      summary: result.current.summary,
      activeGroups: result.current.activeGroups,
      recentActivity: result.current.recentActivity,
    });
    expect(result.current.summary.owedToUser.amount).toBe(0);
    expect(result.current.summary.owedByUser.amount).toBe(0);
    expect(result.current.activeGroups).toHaveLength(0);
    expect(result.current.recentActivity).toHaveLength(0);
  });

  it('keeps query-shaped data nullable for future loading and error states', () => {
    const { result } = renderHook(() => useHomeData());

    const data: typeof result.current.data = null;
    expect(data).toBeNull();
  });

  it('is not loading or errored by default', () => {
    const { result } = renderHook(() => useHomeData());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('derives active groups from the API-backed groups query', () => {
    mockGroupsQuery([
      { id: 'api-group-1', name: 'Cumple de Ana' },
      { id: 'api-group-2', name: 'Escapada a Tigre' },
      { id: 'api-group-3', name: 'Departamento' },
    ]);

    const { result } = renderHook(() => useHomeData());

    expect(result.current.activeGroups).toHaveLength(2);
    expect(result.current.activeGroups.map((group) => group.name)).toEqual(['Cumple de Ana', 'Escapada a Tigre']);
    expect(result.current.activeGroups).toEqual([
      expect.objectContaining({
        id: 'api-group-1',
        category: 'Otros',
        coverUrl: 'https://picsum.photos/seed/api-group-1/400/300',
        members: [],
        extraMembersCount: 0,
        activeDebtsLabel: 'Recién creado',
      }),
      expect.objectContaining({
        id: 'api-group-2',
        category: 'Otros',
        coverUrl: 'https://picsum.photos/seed/api-group-2/400/300',
        members: [],
        extraMembersCount: 0,
        activeDebtsLabel: 'Recién creado',
      }),
    ]);
  });

  it('returns API-backed groups with zero summaries when there are no local expenses', () => {
    mockGroupsQuery([{ id: 'api-group-1', name: 'Backend group' }]);

    const { result } = renderHook(() => useHomeData());

    expect(result.current.activeGroups).toHaveLength(1);
    expect(result.current.summary.owedToUser.amount).toBe(0);
    expect(result.current.summary.owedByUser.amount).toBe(0);
    expect(result.current.recentActivity).toHaveLength(0);
  });

  it('surfaces the groups query loading and error state', () => {
    const error = new Error('Groups failed');
    mockedUseGroups.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
    } as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useHomeData());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });

  it('computes the summary from local expenses keyed by API group id', () => {
    const groupId = 'api-group-summary';
    mockGroupsQuery([{ id: groupId, name: 'Viaje a la costa' }]);
    const otherId = 'invite-0-friend@example.com';

    // You paid 60.000 split between both: the other person owes you 30.000.
    useExpensesStore
      .getState()
      .addExpense(groupId, makeExpense('e-lent', { type: 'lent', amount: 30000 }, ['current-user', otherId]));
    // The other person paid and you share 15.000: you owe in this group.
    useExpensesStore
      .getState()
      .addExpense(groupId, makeExpense('e-share', { type: 'share', amount: 15000 }, ['current-user', otherId]));

    const { result } = renderHook(() => useHomeData());

    expect(result.current.summary.owedToUser.amount).toBe(30000);
    expect(result.current.summary.owedToUser.detail).toBe('1 Persona');
    expect(result.current.summary.owedByUser.amount).toBe(-15000);
    expect(result.current.summary.owedByUser.detail).toBe('1 Grupo');
  });

  it('derives recent activity from local expenses keyed by API group id, newest first', () => {
    const groupId = 'api-group-activity';
    mockGroupsQuery([{ id: groupId, name: 'Viaje a la costa' }]);
    const otherId = 'invite-0-friend@example.com';

    useExpensesStore.getState().addExpense(
      groupId,
      makeExpense('older', { type: 'lent', amount: 30000 }, ['current-user', otherId], {
        title: 'Cena',
        totalAmount: 60000,
        date: '2024-05-18T10:00:00.000Z',
      }),
    );
    useExpensesStore.getState().addExpense(
      groupId,
      makeExpense('newer', { type: 'share', amount: 15000 }, ['current-user', otherId], {
        title: 'Tren',
        category: 'TRANSPORT',
        totalAmount: 30000,
        paidById: otherId,
        paidByLabel: 'Pagado por friend@example.com',
        date: '2024-05-20T10:00:00.000Z',
      }),
    );

    const { result } = renderHook(() => useHomeData());
    const [first, second] = result.current.recentActivity;

    expect(result.current.recentActivity).toHaveLength(2);
    expect(first).toMatchObject({
      id: 'newer',
      groupId,
      title: 'Tren',
      context: 'Pagado por friend@example.com en Viaje a la costa',
      amount: -30000,
      category: 'transport',
    });
    expect(second).toMatchObject({
      id: 'older',
      title: 'Cena',
      context: 'Pagado por ti en Viaje a la costa',
      amount: 60000,
      category: 'food',
    });
  });
});
