import { renderHook } from '@testing-library/react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import { GroupExpense } from '../types';
import { useGroupDetail } from '../hooks/useGroupDetail';
import { useGroupsStore } from '../store/groupsStore';

function makeExpense(id: string): GroupExpense {
  return {
    id,
    title: `Gasto ${id}`,
    paidByLabel: 'Pagado por mí',
    timeLabel: 'Hoy',
    totalAmount: 100,
    category: 'FOOD',
    userRelation: { type: 'lent', amount: 60 },
    paidById: 'current-user',
    participantIds: ['current-user'],
    date: '2024-05-20T00:00:00.000Z',
  };
}

describe('useGroupDetail', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
  });

  it('returns null for an unknown group with no store entry', () => {
    const { result } = renderHook(() => useGroupDetail('group-1'));

    expect(result.current.group).toBeNull();
    expect(result.current.recentExpenses).toEqual([]);
    expect(result.current.totalExpensesCount).toBe(0);
  });

  it('drops a created expense from the list when deleted', () => {
    const createdGroup = useGroupsStore.getState().createGroup({
      name: 'Viaje a Mendoza',
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['friend@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    });

    useExpensesStore.getState().addExpense(createdGroup.id, makeExpense('new-1'));
    useExpensesStore.getState().deleteExpense(createdGroup.id, 'new-1');

    const { result } = renderHook(() => useGroupDetail(createdGroup.id));

    expect(result.current.group).not.toBeNull();
    expect(result.current.recentExpenses.some((expense) => expense.id === 'new-1')).toBe(false);
    expect(result.current.totalExpensesCount).toBe(0);
  });

  it('shows store expenses for a newly created group', () => {
    const createdGroup = useGroupsStore.getState().createGroup({
      name: 'Viaje a Mendoza',
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['friend@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    });

    useExpensesStore.getState().addExpense(createdGroup.id, makeExpense('new-2'));

    const { result } = renderHook(() => useGroupDetail(createdGroup.id));
    const group = result.current.group;

    expect(group).not.toBeNull();
    if (!group) {
      throw new Error('Expected created group detail');
    }
    expect(result.current.recentExpenses).toHaveLength(1);
    expect(group.totalExpense).toBe(100);
    expect(group.owedToYou).toBe(60);
  });

  it('uses Spanish current member copy for newly created groups', () => {
    const createdGroup = useGroupsStore.getState().createGroup({
      name: 'Viaje a Mendoza',
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['friend@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    });

    const { result } = renderHook(() => useGroupDetail(createdGroup.id));

    expect(result.current.group).not.toBeNull();
    expect(result.current.memberBalances[0]).toMatchObject({
      id: 'current-user',
      name: 'Vos',
      isCurrentUser: true,
    });
  });
});
