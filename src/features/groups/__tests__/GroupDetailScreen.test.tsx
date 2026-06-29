import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';

import { GroupExpense } from '../types';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { useGroupsStore } from '../store/groupsStore';
import { useGroupDetail } from '../hooks/useGroupDetail';
import { useGroupDetailActions } from '../hooks/useGroupDetailActions';

jest.mock('../hooks/useGroupDetail');
jest.mock('../hooks/useGroupDetailActions');

const mockUseGroupDetail = jest.mocked(useGroupDetail);
const mockUseGroupDetailActions = jest.mocked(useGroupDetailActions);

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

function buildGroupDetailResult(groupId: string, expenses: GroupExpense[]) {
  const group = useGroupsStore.getState().groups.find((g) => g.id === groupId);
  if (!group) {
    return {
      group: null,
      memberBalances: [],
      recentExpenses: [] as GroupExpense[],
      totalExpensesCount: 0,
      isLoading: false,
      isFetching: false,
    };
  }
  const owedToYou = expenses
    .filter((e) => e.userRelation.type === 'lent')
    .reduce((s, e) => s + (e.userRelation.type === 'lent' ? e.userRelation.amount : 0), 0);
  const youOwe = expenses
    .filter((e) => e.userRelation.type === 'share')
    .reduce((s, e) => s + (e.userRelation.type === 'share' ? e.userRelation.amount : 0), 0);
  return {
    group: {
      id: group.id,
      name: group.name,
      category: group.category,
      totalExpense: expenses.reduce((s, e) => s + e.totalAmount, 0),
      totalExpenseChangePercent: 0,
      owedToYou,
      youOwe,
    },
    memberBalances: [],
    recentExpenses: expenses,
    totalExpensesCount: expenses.length,
    isLoading: false,
    isFetching: false,
  };
}

type NavigationMock = {
  goBack: jest.Mock;
  navigate: jest.Mock;
};

describe('GroupDetailScreen', () => {
  let navigationMock: NavigationMock;
  let groupId: string;
  let localExpenses: GroupExpense[];

  beforeEach(() => {
    useGroupsStore.getState().reset();
    localExpenses = [];
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
    // Newest-first order (matching how expenses are displayed): expense-3 is most recent
    localExpenses = [makeExpense('expense-3'), makeExpense('expense-2'), makeExpense('expense-1')];
    jest.mocked(useRoute).mockReturnValue({
      params: { groupId },
    } as ReturnType<typeof useRoute>);
    navigationMock = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };
    jest.mocked(useNavigation).mockReturnValue(navigationMock as never);

    function openSettings() {
      Alert.alert('Opciones del grupo', 'Elegí qué querés hacer con este grupo.', [
        {
          text: 'Editar grupo',
          onPress: () => navigationMock.navigate('NewGroup', { groupId }),
        },
        {
          text: 'Eliminar grupo',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Eliminar grupo',
              '¿Seguro que querés eliminar este grupo? Esta acción no se puede deshacer.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive' },
              ],
            ),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }

    mockUseGroupDetail.mockImplementation(() => buildGroupDetailResult(groupId, localExpenses));
    mockUseGroupDetailActions.mockReturnValue({
      handleOpenSettings: openSettings,
      handleOpenBalances: () => navigationMock.navigate('SettleDebts', { groupId }),
      handleConfirmDelete: jest.fn(),
    } as unknown as ReturnType<typeof useGroupDetailActions>);
  });

  it('hides the expand button when there are 3 or fewer expenses', () => {
    render(<GroupDetailScreen />);

    expect(screen.queryByTestId('group-expenses-toggle')).toBeNull();
  });

  it('expands the list inline when there are more than 3 expenses', () => {
    localExpenses = [makeExpense('new-1'), ...localExpenses];
    mockUseGroupDetail.mockImplementation(() => buildGroupDetailResult(groupId, localExpenses));

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

    expect(navigationMock.navigate).toHaveBeenCalledWith('SettleDebts', { groupId });
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

    expect(alertSpy).toHaveBeenLastCalledWith(
      'Eliminar grupo',
      '¿Seguro que querés eliminar este grupo? Esta acción no se puede deshacer.',
      expect.any(Array),
    );
  });

  it('does not reopen a deleted group from the same route id', () => {
    useGroupsStore.getState().deleteGroup(groupId);
    mockUseGroupDetail.mockReturnValue({
      group: null,
      memberBalances: [],
      recentExpenses: [] as GroupExpense[],
      totalExpensesCount: 0,
      isLoading: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useGroupDetail>);

    render(<GroupDetailScreen />);

    expect(screen.getByText('Este grupo ya no está disponible')).toBeTruthy();
    expect(screen.queryByTestId('group-expense-expense-1')).toBeNull();
  });

  it('shows a loading state instead of unavailable copy while the group query is loading', () => {
    useGroupsStore.getState().reset();
    mockUseGroupDetail.mockReturnValue({
      group: null,
      memberBalances: [],
      recentExpenses: [] as GroupExpense[],
      totalExpensesCount: 0,
      isLoading: true,
      isFetching: false,
    } as unknown as ReturnType<typeof useGroupDetail>);
    jest.mocked(useRoute).mockReturnValue({
      params: { groupId: 'api-group-loading' },
    } as ReturnType<typeof useRoute>);

    render(<GroupDetailScreen />);

    expect(screen.getByLabelText('Cargando grupo')).toBeTruthy();
    expect(screen.getByText('Cargando grupo...')).toBeTruthy();
    expect(screen.queryByText('Este grupo ya no está disponible')).toBeNull();
  });

  it('shows spinner instead of error screen when group is null but isFetching is true (background refetch)', () => {
    mockUseGroupDetail.mockReturnValue({
      group: null,
      memberBalances: [],
      recentExpenses: [] as GroupExpense[],
      totalExpensesCount: 0,
      isLoading: false,
      isFetching: true,
    } as unknown as ReturnType<typeof useGroupDetail>);

    render(<GroupDetailScreen />);

    expect(screen.getByLabelText('Cargando grupo')).toBeTruthy();
    expect(screen.queryByText('Este grupo ya no está disponible')).toBeNull();
  });

  it('shows error screen when group is null and both isLoading and isFetching are false (genuinely missing)', () => {
    mockUseGroupDetail.mockReturnValue({
      group: null,
      memberBalances: [],
      recentExpenses: [] as GroupExpense[],
      totalExpensesCount: 0,
      isLoading: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useGroupDetail>);

    render(<GroupDetailScreen />);

    expect(screen.getByText('Este grupo ya no está disponible')).toBeTruthy();
    expect(screen.queryByLabelText('Cargando grupo')).toBeNull();
  });

  it('renders group detail correctly when group data is available and all fetches are settled', () => {
    render(<GroupDetailScreen />);

    expect(screen.queryByText('Este grupo ya no está disponible')).toBeNull();
    expect(screen.queryByLabelText('Cargando grupo')).toBeNull();
    expect(screen.getByText('Gastos Recientes')).toBeTruthy();
  });
});
