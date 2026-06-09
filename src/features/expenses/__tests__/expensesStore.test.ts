import { GroupExpense } from '../../groups/types';
import { useExpensesStore } from '../store/expensesStore';

function makeExpense(id: string): GroupExpense {
  return {
    id,
    title: `Gasto ${id}`,
    paidByLabel: 'Pagado por mí',
    timeLabel: 'Hoy',
    totalAmount: 100,
    category: 'FOOD',
    userRelation: { type: 'none', amount: 0 },
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
});
