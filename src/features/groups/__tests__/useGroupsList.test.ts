import { renderHook } from '@testing-library/react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import { useGroupsList } from '../hooks/useGroupsList';
import { useGroups } from '../hooks/useGroups';
import type { ExpenseUserRelation, GroupExpense } from '../types';

jest.mock('../hooks/useGroups');

const mockUseGroups = jest.mocked(useGroups);

function makeGroup(id: string, name = `Group ${id}`) {
  return { id, name, description: null, currency: 'ARS', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
}

function makeExpense(id: string, userRelation: ExpenseUserRelation): GroupExpense {
  return {
    id,
    title: `Gasto ${id}`,
    paidByLabel: 'Pagado por mí',
    timeLabel: 'Hoy',
    totalAmount: 0,
    category: 'FOOD',
    userRelation,
    paidById: 'current-user',
    participantIds: ['current-user'],
    date: '2024-05-20T00:00:00.000Z',
  };
}

describe('useGroupsList', () => {
  beforeEach(() => {
    useExpensesStore.getState().reset();
    mockUseGroups.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);
  });

  it('starts empty with a zero net balance when the query returns no groups', () => {
    const { result } = renderHook(() => useGroupsList());

    expect(result.current.groups).toEqual([]);
    expect(result.current.netBalance).toBe(0);
  });

  it('exposes isLoading from the query', () => {
    mockUseGroups.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useGroupsList());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.groups).toEqual([]);
  });

  it('exposes error state from the query', () => {
    const error = new Error('GET /groups failed');
    mockUseGroups.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useGroupsList());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.groups).toEqual([]);
  });

  it('maps API response to GroupListItem with defaults for missing fields', () => {
    mockUseGroups.mockReturnValue({
      data: { data: [makeGroup('g1', 'Viaje a la costa')] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useGroupsList());

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0]).toMatchObject({
      id: 'g1',
      name: 'Viaje a la costa',
      category: 'OTHER',
      status: { type: 'recent' },
      members: [],
      extraMembersCount: 0,
      balance: 0,
    });
  });

  it('derives each group balance and the net total from local expenses', () => {
    mockUseGroups.mockReturnValue({
      data: { data: [makeGroup('g1', 'Viaje a la costa'), makeGroup('g2', 'Departamento')] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);

    // g1: owed 30.000 and owe 5.000 -> +25.000
    useExpensesStore.getState().addExpense('g1', makeExpense('a', { type: 'lent', amount: 30000 }));
    useExpensesStore.getState().addExpense('g1', makeExpense('b', { type: 'share', amount: 5000 }));
    // g2: owe 12.000 -> -12.000
    useExpensesStore.getState().addExpense('g2', makeExpense('c', { type: 'share', amount: 12000 }));

    const { result } = renderHook(() => useGroupsList());

    const balances = Object.fromEntries(result.current.groups.map((g) => [g.id, g.balance]));
    expect(balances['g1']).toBe(25000);
    expect(balances['g2']).toBe(-12000);
    expect(result.current.netBalance).toBe(13000);
  });
});
