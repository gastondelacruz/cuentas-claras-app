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

  it('merges store expenses on top of the seeded mock group', () => {
    useExpensesStore.getState().addExpense('group-1', makeExpense('new-1'));

    const { result } = renderHook(() => useGroupDetail('group-1'));

    expect(result.current.recentExpenses[0]?.id).toBe('new-1');
    expect(result.current.totalExpensesCount).toBe(25);
  });

  it('overrides a seeded mock expense without duplicating it', () => {
    // 'e1' is a seeded mock expense; editing it lands in the store under the same id.
    useExpensesStore.getState().updateExpense('group-1', makeExpense('e1'));

    const { result } = renderHook(() => useGroupDetail('group-1'));

    const e1Matches = result.current.recentExpenses.filter((expense) => expense.id === 'e1');
    expect(e1Matches).toHaveLength(1);
    expect(result.current.recentExpenses[0]?.id).toBe('e1');
    // Count stays at the mock baseline: the override replaces, it does not add.
    expect(result.current.totalExpensesCount).toBe(24);
  });

  it('preserves the selected seeded group identity', () => {
    const { result } = renderHook(() => useGroupDetail('group-2'));

    expect(result.current.group).toMatchObject({
      id: 'group-2',
      name: 'Departamento',
      category: 'HOME',
    });
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

    expect(result.current.recentExpenses).toHaveLength(1);
    expect(result.current.group.totalExpense).toBe(100);
    expect(result.current.group.owedToYou).toBe(60);
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

    expect(result.current.memberBalances[0]).toMatchObject({
      id: 'current-user',
      name: 'Vos',
      isCurrentUser: true,
    });
  });
});
