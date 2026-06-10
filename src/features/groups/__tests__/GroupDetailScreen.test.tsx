import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import { GroupExpense } from '../types';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';

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

describe('GroupDetailScreen', () => {
  beforeEach(() => {
    useExpensesStore.getState().reset();
    jest.mocked(useRoute).mockReturnValue({
      params: { groupId: 'group-1' },
    } as ReturnType<typeof useRoute>);
  });

  it('hides the expand button when there are 3 or fewer expenses', () => {
    // group-1 has exactly 3 seeded mock expenses.
    render(<GroupDetailScreen />);

    expect(screen.queryByTestId('group-expenses-toggle')).toBeNull();
  });

  it('expands the list inline when there are more than 3 expenses', () => {
    // A 4th expense pushes the group past the recent limit.
    useExpensesStore.getState().addExpense('group-1', makeExpense('new-1'));

    render(<GroupDetailScreen />);

    // Collapsed: only the first 3 rows are visible.
    expect(screen.getByTestId('group-expense-new-1')).toBeTruthy();
    expect(screen.queryByTestId('group-expense-e3')).toBeNull();

    const toggle = screen.getByTestId('group-expenses-toggle');
    expect(toggle).toHaveTextContent('Ver los 4 gastos');

    fireEvent.press(toggle);

    // Expanded: the full set is visible and the label flips.
    expect(screen.getByTestId('group-expense-e3')).toBeTruthy();
    expect(screen.getByTestId('group-expenses-toggle')).toHaveTextContent('Ver menos');
  });
});
