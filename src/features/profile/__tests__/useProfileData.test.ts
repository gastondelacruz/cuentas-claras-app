import { renderHook } from '@testing-library/react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import type { ExpenseUserRelation, GroupExpense } from '../../groups/types';
import { useGroupsStore } from '../../groups/store/groupsStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { useProfileData } from '../hooks/useProfileData';

function makeExpense(id: string, totalAmount: number, userRelation: ExpenseUserRelation): GroupExpense {
  return {
    id,
    title: `Gasto ${id}`,
    paidByLabel: 'Pagado',
    timeLabel: 'Hoy',
    totalAmount,
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

describe('useProfileData', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'tok');
  });

  it('uses the authenticated email while keeping the mocked profile identity', () => {
    const { result } = renderHook(() => useProfileData());

    expect(result.current.user).toMatchObject({
      name: 'Alex Thompson',
      email: 'you@example.com',
      status: 'Verificado',
    });
  });

  it('derives profile totals from real expenses', () => {
    const firstGroup = createGroup('Viaje a la costa');
    const secondGroup = createGroup('Departamento');

    useExpensesStore.getState().addExpense(firstGroup.id, makeExpense('a', 60000, { type: 'lent', amount: 30000 }));
    useExpensesStore.getState().addExpense(firstGroup.id, makeExpense('b', 20000, { type: 'share', amount: 10000 }));
    useExpensesStore.getState().addExpense(secondGroup.id, makeExpense('c', 12000, { type: 'share', amount: 6000 }));

    const { result } = renderHook(() => useProfileData());

    expect(result.current.summary).toEqual({
      activeDebtGroupsCount: 2,
      totalExpenseCount: 3,
      totalExpenses: 92000,
      youOwe: 16000,
    });
  });
});
