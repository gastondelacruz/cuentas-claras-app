import { GroupExpense } from '../../groups/types';
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

describe('expensesStore', () => {
  beforeEach(() => {
    useExpensesStore.getState().reset();
  });

  it('prepends new expenses per group', () => {
    const { addExpense, getExpensesForGroup } = useExpensesStore.getState();

    addExpense('group-1', makeExpense('e1'));
    addExpense('group-1', makeExpense('e2'));

    expect(useExpensesStore.getState().getExpensesForGroup('group-1').map((e) => e.id)).toEqual([
      'e2',
      'e1',
    ]);
    expect(getExpensesForGroup('group-2')).toHaveLength(0);
  });

  it('keeps expenses isolated by group', () => {
    useExpensesStore.getState().addExpense('group-1', makeExpense('e1'));
    useExpensesStore.getState().addExpense('group-2', makeExpense('e2'));

    expect(useExpensesStore.getState().getExpensesForGroup('group-1')).toHaveLength(1);
    expect(useExpensesStore.getState().getExpensesForGroup('group-2')).toHaveLength(1);
  });

  it('clears everything on reset', () => {
    useExpensesStore.getState().addExpense('group-1', makeExpense('e1'));
    useExpensesStore.getState().reset();

    expect(useExpensesStore.getState().getExpensesForGroup('group-1')).toHaveLength(0);
  });

  it('replaces an existing expense in place on update', () => {
    const { addExpense, updateExpense } = useExpensesStore.getState();

    addExpense('group-1', makeExpense('e1', { title: 'Original' }));
    addExpense('group-1', makeExpense('e2'));

    updateExpense('group-1', makeExpense('e1', { title: 'Editado', totalAmount: 250 }));

    const expenses = useExpensesStore.getState().getExpensesForGroup('group-1');
    expect(expenses.map((e) => e.id)).toEqual(['e2', 'e1']);
    expect(expenses.find((e) => e.id === 'e1')).toMatchObject({ title: 'Editado', totalAmount: 250 });
  });

  it('prepends the expense on update when its id is not tracked yet', () => {
    useExpensesStore.getState().updateExpense('group-1', makeExpense('mock-1', { title: 'Desde mock' }));

    const expenses = useExpensesStore.getState().getExpensesForGroup('group-1');
    expect(expenses).toHaveLength(1);
    expect(expenses[0]).toMatchObject({ id: 'mock-1', title: 'Desde mock' });
  });
});
