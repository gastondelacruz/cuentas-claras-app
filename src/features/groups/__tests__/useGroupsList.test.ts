import { renderHook } from '@testing-library/react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import { useGroupsList } from '../hooks/useGroupsList';
import { useGroupsStore } from '../store/groupsStore';
import type { ExpenseUserRelation, GroupExpense } from '../types';

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

function createGroup(name: string) {
  return useGroupsStore.getState().createGroup({
    category: 'TRAVEL',
    image: { type: 'default', uri: null },
    invitedEmails: ['friend@example.com'],
    name,
    owner: {
      id: 'current-user',
      name: 'Vos',
      initials: 'YO',
      avatarUrl: null,
      email: 'you@example.com',
    },
  });
}

describe('useGroupsList', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
  });

  it('starts empty with a zero net balance', () => {
    const { result } = renderHook(() => useGroupsList());

    expect(result.current.groups).toEqual([]);
    expect(result.current.netBalance).toBe(0);
  });

  it('derives each group balance and the net total from real expenses', () => {
    const owedGroup = createGroup('Viaje a la costa');
    const owingGroup = createGroup('Departamento');

    // First group: you are owed 30.000 and owe 5.000 -> +25.000.
    useExpensesStore.getState().addExpense(owedGroup.id, makeExpense('a', { type: 'lent', amount: 30000 }));
    useExpensesStore.getState().addExpense(owedGroup.id, makeExpense('b', { type: 'share', amount: 5000 }));
    // Second group: you only owe 12.000 -> -12.000.
    useExpensesStore.getState().addExpense(owingGroup.id, makeExpense('c', { type: 'share', amount: 12000 }));

    const { result } = renderHook(() => useGroupsList());

    const balances = Object.fromEntries(result.current.groups.map((group) => [group.id, group.balance]));
    expect(balances[owedGroup.id]).toBe(25000);
    expect(balances[owingGroup.id]).toBe(-12000);
    expect(result.current.netBalance).toBe(13000);
  });
});
