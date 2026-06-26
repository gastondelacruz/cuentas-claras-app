import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import { GroupExpense } from '../types';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { useGroups } from '../hooks/useGroups';
import { useGroupsStore } from '../store/groupsStore';

jest.mock('../hooks/useGroups');

const mockUseGroups = jest.mocked(useGroups);

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
  let groupId: string;

  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    groupId = useGroupsStore.getState().createGroup({
      name: 'Viaje a Bariloche',
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['alex@example.com', 'sarah@example.com'],
      owner: {
        id: 'current-user',
        name: 'Vos',
        email: 'you@example.com',
        initials: 'YO',
        avatarUrl: null,
      },
    }).id;
    useExpensesStore.getState().addExpense(groupId, makeExpense('expense-1'));
    useExpensesStore.getState().addExpense(groupId, makeExpense('expense-2'));
    useExpensesStore.getState().addExpense(groupId, makeExpense('expense-3'));
    mockUseGroups.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);
    jest.mocked(useRoute).mockReturnValue({
      params: { groupId },
    } as ReturnType<typeof useRoute>);
    navigationMock = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };
    jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
  });

  it('hides the expand button when there are 3 or fewer expenses', () => {
    render(<GroupDetailScreen />);

    expect(screen.queryByTestId('group-expenses-toggle')).toBeNull();
  });

  it('expands the list inline when there are more than 3 expenses', () => {
    useExpensesStore.getState().addExpense(groupId, makeExpense('new-1'));

    render(<GroupDetailScreen />);

    expect(screen.getByTestId('group-expense-new-1')).toBeTruthy();
    expect(screen.queryByTestId('group-expense-expense-1')).toBeNull();

    const toggle = screen.getByTestId('group-expenses-toggle');
    expect(toggle).toHaveTextContent('Ver los 4 gastos');

    fireEvent.press(toggle);

    expect(screen.getByTestId('group-expense-expense-1')).toBeTruthy();
    expect(screen.getByTestId('group-expenses-toggle')).toHaveTextContent('Ver menos');
  });

  it('opens the settings action and navigates to edit group', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

    render(<GroupDetailScreen />);

    fireEvent.press(screen.getByLabelText('Ajustes del grupo'));

    const [, , buttons] = alertSpy.mock.calls[0] ?? [];
    const editButton = buttons?.find((button) => button.text === 'Editar grupo');

    editButton?.onPress?.();

    expect(navigationMock.navigate).toHaveBeenCalledWith('NewGroup', { groupId });
  });

  it('keeps only add expense and settle actions inside the group', () => {
    render(<GroupDetailScreen />);

    expect(screen.getByText('Añadir Gasto')).toBeTruthy();
    expect(screen.getByText('Saldar Cuentas')).toBeTruthy();
    expect(screen.queryByText('Ver Resumen')).toBeNull();
  });

  it('opens the settle debts stack screen from settle actions', () => {
    render(<GroupDetailScreen />);

    fireEvent.press(screen.getByText('Saldar Cuentas'));

    expect(navigationMock.navigate).toHaveBeenCalledWith('SettleDebts');
  });

  it('opens a destructive confirmation before deleting the group', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

    render(<GroupDetailScreen />);

    fireEvent.press(screen.getByLabelText('Ajustes del grupo'));

    const [, , settingsButtons] = alertSpy.mock.calls[0] ?? [];
    const deleteButton = settingsButtons?.find((button) => button.text === 'Eliminar grupo');
    act(() => {
      deleteButton?.onPress?.();
    });

    expect(alertSpy).toHaveBeenNthCalledWith(
      3,
      'Eliminar grupo',
      '¿Seguro que querés eliminar este grupo? Esta acción no se puede deshacer.',
      expect.any(Array),
    );
  });

  it('does not reopen a deleted group from the same route id', () => {
    useGroupsStore.getState().deleteGroup(groupId);
    useExpensesStore.getState().deleteGroupExpenses(groupId);

    render(<GroupDetailScreen />);

    expect(screen.getByText('Este grupo ya no está disponible')).toBeTruthy();
    expect(screen.queryByTestId('group-expense-expense-1')).toBeNull();
  });

  it('shows a loading state instead of unavailable copy while the group query is loading', () => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    mockUseGroups.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useGroups>);
    jest.mocked(useRoute).mockReturnValue({
      params: { groupId: 'api-group-loading' },
    } as ReturnType<typeof useRoute>);

    render(<GroupDetailScreen />);

    expect(screen.getByLabelText('Cargando grupo')).toBeTruthy();
    expect(screen.getByText('Cargando grupo...')).toBeTruthy();
    expect(screen.queryByText('Este grupo ya no está disponible')).toBeNull();
  });
});
