import { renderHook } from '@testing-library/react-native';

import { recentExpensesMock } from '../../groups/mocks/groupDetail.mock';
import { GroupExpense } from '../../groups/types';
import { useGroupsStore } from '../../groups/store/groupsStore';
import { useExpenseToEdit } from '../hooks/useExpenseToEdit';
import { useExpensesStore } from '../store/expensesStore';

function makeExpense(id: string, overrides: Partial<GroupExpense> = {}): GroupExpense {
  return {
    id,
    title: `Gasto ${id}`,
    paidByLabel: 'Pagado por mí',
    timeLabel: 'Hoy',
    totalAmount: 100,
    category: 'FOOD',
    userRelation: { type: 'none', amount: 0 },
    paidById: 'current-user',
    participantIds: ['current-user'],
    date: '2024-05-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('useExpenseToEdit', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
  });

  it('returns a valid seeded expense when it was not deleted', () => {
    const { result } = renderHook(() => useExpenseToEdit('group-1', 'e1'));

    expect(result.current).toEqual(recentExpensesMock[0]);
  });

  it('returns a local stored expense for created groups', () => {
    const localExpense = makeExpense('local-1', { title: 'Supermercado' });

    useExpensesStore.getState().addExpense('created-group', localExpense);

    const { result } = renderHook(() => useExpenseToEdit('created-group', 'local-1'));

    expect(result.current).toEqual(localExpense);
  });

  it('does not revive a seeded expense after it was tombstoned', () => {
    useExpensesStore.getState().deleteExpense('group-1', 'e1');

    const { result } = renderHook(() => useExpenseToEdit('group-1', 'e1'));

    expect(result.current).toBeUndefined();
  });

  it('does not revive a seeded expense when its group was deleted', () => {
    useGroupsStore.getState().deleteGroup('group-1');

    const { result } = renderHook(() => useExpenseToEdit('group-1', 'e1'));

    expect(result.current).toBeUndefined();
  });
});
