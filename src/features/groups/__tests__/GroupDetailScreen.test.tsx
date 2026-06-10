import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import { GroupExpense } from '../types';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { useGroupsStore } from '../store/groupsStore';

type NavigationMock = {
  goBack: jest.Mock;
  navigate: jest.Mock;
};

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
  let navigationMock: NavigationMock;

  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    jest.mocked(useRoute).mockReturnValue({
      params: { groupId: 'group-1' },
    } as ReturnType<typeof useRoute>);
    navigationMock = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };
    jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
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

  it('opens the settings action and navigates to edit group', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

    render(<GroupDetailScreen />);

    fireEvent.press(screen.getByLabelText('Ajustes del grupo'));

    const [, , buttons] = alertSpy.mock.calls[0] ?? [];
    const editButton = buttons?.find((button) => button.text === 'Editar grupo');

    editButton?.onPress?.();

    expect(navigationMock.navigate).toHaveBeenCalledWith('NewGroup', { groupId: 'group-1' });
  });

  it('deletes the group after confirmation and clears its local expenses', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((title, _message, buttons) => {
      if (title === 'Eliminar grupo') {
        buttons?.find((button) => button.style === 'destructive')?.onPress?.();
      }
    });
    useExpensesStore.getState().addExpense('group-1', makeExpense('local-1'));

    render(<GroupDetailScreen />);

    fireEvent.press(screen.getByLabelText('Ajustes del grupo'));

    const [, , settingsButtons] = alertSpy.mock.calls[0] ?? [];
    const deleteButton = settingsButtons?.find((button) => button.text === 'Eliminar grupo');
    act(() => {
      deleteButton?.onPress?.();
    });

    expect(useGroupsStore.getState().groups.find((group) => group.id === 'group-1')).toBeUndefined();
    expect(useExpensesStore.getState().getExpensesForGroup('group-1')).toHaveLength(0);
  });

  it('does not reopen a deleted seeded group from the same route id', () => {
    useGroupsStore.getState().deleteGroup('group-1');
    useExpensesStore.getState().deleteExpense('group-1', 'e1');
    useExpensesStore.getState().deleteGroupExpenses('group-1');

    render(<GroupDetailScreen />);

    expect(screen.getByText('Este grupo ya no está disponible')).toBeTruthy();
    expect(screen.queryByTestId('group-expense-e1')).toBeNull();
  });
});
