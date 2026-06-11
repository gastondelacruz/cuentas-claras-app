import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';

import { useGroupsStore } from '../../groups/store/groupsStore';
import type { GroupExpense } from '../../groups/types';
import { useAuthStore } from '../../../shared/store/authStore';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { useExpensesStore } from '../store/expensesStore';

type NavigationMock = {
  navigate: jest.Mock;
  replace: jest.Mock;
  popTo: jest.Mock;
  goBack: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  dispatch: jest.Mock;
  setOptions: jest.Mock;
};

let navigationMock: NavigationMock;

function createGroup(name: string, invitedEmails: string[]) {
  return useGroupsStore.getState().createGroup({
    name,
    category: 'TRAVEL',
    image: { type: 'default', uri: null },
    invitedEmails,
    owner: {
      id: 'current-user',
      name: 'Vos',
      email: 'you@example.com',
      initials: 'YO',
      avatarUrl: null,
    },
  });
}

function createExpense(groupId: string, expense: GroupExpense) {
  useExpensesStore.getState().addExpense(groupId, expense);
}

describe('AddExpenseScreen', () => {
  let primaryGroupId: string;
  let secondaryGroupId: string;
  let editableExpenseId: string;

  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'token');
    secondaryGroupId = createGroup('Departamento', ['diego@example.com', 'lucia@example.com']).id;
    primaryGroupId = createGroup('Viaje a Lisboa', ['alex@example.com', 'sarah@example.com']).id;
    editableExpenseId = 'expense-1';
    createExpense(primaryGroupId, {
      id: editableExpenseId,
      title: 'Cena Italiana @ Luigis',
      paidByLabel: 'Pagado por alex@example.com',
      timeLabel: 'Hoy',
      totalAmount: 184,
      category: 'FOOD',
      userRelation: { type: 'share', amount: 92 },
      paidById: 'invite-0-alex@example.com',
      participantIds: ['current-user', 'invite-0-alex@example.com'],
      date: '2024-05-20T00:00:00.000Z',
    });
    jest.mocked(useRoute).mockReturnValue({ params: undefined } as ReturnType<typeof useRoute>);

    navigationMock = {
      navigate: jest.fn(),
      replace: jest.fn(),
      popTo: jest.fn(),
      goBack: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      removeListener: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
    };
    jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
  });

  it('shows validation errors in Spanish when the form is empty', async () => {
    render(<AddExpenseScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Ingresá un monto')).toBeTruthy();
      expect(screen.getByText('Ingresá una descripción')).toBeTruthy();
    });
  });

  it('does not create an expense when the amount is zero or less', async () => {
    render(<AddExpenseScreen />);

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '0');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('El monto debe ser mayor a 0')).toBeTruthy();
    });
    expect(useExpensesStore.getState().getExpensesForGroup(primaryGroupId)).toHaveLength(1);
  });

  it('creates the expense for the selected group when valid', async () => {
    render(<AddExpenseScreen />);

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '1500,50');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena compartida');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      const expenses = useExpensesStore.getState().getExpensesForGroup(primaryGroupId);
      expect(expenses).toHaveLength(2);
      expect(expenses[0]).toMatchObject({
        title: 'Cena compartida',
        totalAmount: 1500.5,
        category: 'FOOD',
      });
    });
  });

  it('stores the chosen category with the expense', async () => {
    render(<AddExpenseScreen />);

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '900');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Zapatillas');
    fireEvent.press(screen.getByTestId('expense-category-SHOPPING'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      const expenses = useExpensesStore.getState().getExpensesForGroup(primaryGroupId);
      expect(expenses[0]?.category).toBe('SHOPPING');
    });
  });

  it('masks the amount with es-AR thousands separators', () => {
    render(<AddExpenseScreen />);

    const amountInput = screen.getByTestId('expense-amount-input');
    fireEvent.changeText(amountInput, '11111');

    expect(amountInput.props.value).toBe('11.111');
  });

  it('lists the real members of the selected group', () => {
    render(<AddExpenseScreen />);

    expect(screen.getAllByText('Vos').length).toBeGreaterThan(0);
    expect(screen.getByText('alex@example.com')).toBeTruthy();
    expect(screen.getByText('sarah@example.com')).toBeTruthy();
  });

  it('refreshes participants when the group changes', () => {
    render(<AddExpenseScreen />);

    expect(screen.getByText('alex@example.com')).toBeTruthy();

    fireEvent.press(screen.getByTestId('expense-group-field'));
    const modal = screen.getByTestId('expense-group-modal');
    fireEvent.press(within(modal).getByText('Departamento'));

    expect(screen.getByText('diego@example.com')).toBeTruthy();
    expect(screen.queryByText('alex@example.com')).toBeNull();
  });

  it('preselects the group received from navigation params', () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: secondaryGroupId } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />);

    expect(screen.getByTestId('expense-group-field')).toHaveTextContent('Departamento');
    expect(screen.getByText('diego@example.com')).toBeTruthy();
  });

  it('returns to the existing group detail when saving from that group', async () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: primaryGroupId } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />);

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '1500');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena compartida');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(useExpensesStore.getState().getExpensesForGroup(primaryGroupId)).toHaveLength(2);
    });
    expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
    expect(navigationMock.popTo).not.toHaveBeenCalled();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('pops to the selected group detail when changing groups before saving', async () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: primaryGroupId } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />);

    fireEvent.press(screen.getByTestId('expense-group-field'));
    fireEvent.press(within(screen.getByTestId('expense-group-modal')).getByText('Departamento'));
    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '900');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Compras');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(useExpensesStore.getState().getExpensesForGroup(secondaryGroupId)).toHaveLength(1);
    });
    expect(navigationMock.popTo).toHaveBeenCalledWith('GroupDetail', { groupId: secondaryGroupId });
    expect(navigationMock.goBack).not.toHaveBeenCalled();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('blocks creating an expense when the route group was deleted after opening the screen', async () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: primaryGroupId } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />);

    act(() => {
      useGroupsStore.getState().deleteGroup(primaryGroupId);
    });

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '1500');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena compartida');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('El grupo seleccionado ya no está disponible. Elegí otro grupo.')).toBeTruthy();
    });

    expect(screen.getByTestId('expense-group-field')).toHaveTextContent('Seleccioná un grupo');
    expect(useExpensesStore.getState().getExpensesForGroup(primaryGroupId)).toHaveLength(1);
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('keeps at least one participant selected', () => {
    render(<AddExpenseScreen />);

    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(3);

    fireEvent.press(screen.getByTestId('expense-participant-invite-0-alex@example.com'));
    fireEvent.press(screen.getByTestId('expense-participant-invite-1-sarah@example.com'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(1);

    fireEvent.press(screen.getByTestId('expense-participant-current-user'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(1);
  });

  it('re-selects everyone with "Seleccionar todos"', () => {
    render(<AddExpenseScreen />);

    fireEvent.press(screen.getByTestId('expense-participant-invite-0-alex@example.com'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(2);

    fireEvent.press(screen.getByTestId('expense-select-all'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(3);
  });

  it('disables "Seleccionar todos" when everyone is already selected', () => {
    render(<AddExpenseScreen />);

    const selectAllButton = screen.getByTestId('expense-select-all');
    expect(selectAllButton.props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.press(screen.getByTestId('expense-participant-invite-0-alex@example.com'));
    expect(screen.getByTestId('expense-select-all').props.accessibilityState).toMatchObject({
      disabled: false,
    });

    fireEvent.press(screen.getByTestId('expense-select-all'));
    expect(screen.getByTestId('expense-select-all').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('lets the user change who paid through the selector', () => {
    render(<AddExpenseScreen />);

    fireEvent.press(screen.getByTestId('expense-paidby-field'));

    const modal = screen.getByTestId('expense-paidby-modal');
    fireEvent.press(within(modal).getByText('alex@example.com'));

    expect(screen.getByTestId('expense-paidby-field')).toHaveTextContent('alex@example.com');
  });

  describe('edit mode', () => {
    const editStoredExpense = () => {
      jest.mocked(useRoute).mockReturnValue({
        params: { groupId: primaryGroupId, expenseId: editableExpenseId },
      } as ReturnType<typeof useRoute>);
    };

    it('prefills the form from the selected expense', () => {
      editStoredExpense();

      render(<AddExpenseScreen />);

      expect(screen.getByText('Editar gasto')).toBeTruthy();
      expect(screen.getByText('Guardar cambios')).toBeTruthy();
      expect(screen.getByTestId('expense-amount-input').props.value).toBe('184');
      expect(screen.getByTestId('expense-description-input').props.value).toBe('Cena Italiana @ Luigis');
      expect(screen.getByTestId('expense-paidby-field')).toHaveTextContent('alex@example.com');
      expect(screen.getByTestId('expense-category-FOOD').props.accessibilityState).toMatchObject({
        selected: true,
      });
    });

    it('updates the expense in place and navigates back on save', async () => {
      editStoredExpense();

      render(<AddExpenseScreen />);

      fireEvent.changeText(screen.getByTestId('expense-amount-input'), '500');

      await act(async () => {
        fireEvent.press(screen.getByTestId('create-expense-button'));
      });

      await waitFor(() => {
        const expenses = useExpensesStore.getState().getExpensesForGroup(primaryGroupId);
        expect(expenses).toHaveLength(1);
        expect(expenses[0]).toMatchObject({
          id: editableExpenseId,
          title: 'Cena Italiana @ Luigis',
          totalAmount: 500,
        });
      });

      expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
      expect(navigationMock.replace).not.toHaveBeenCalled();
    });

    it('keeps the group fixed while editing', () => {
      editStoredExpense();

      render(<AddExpenseScreen />);

      expect(screen.getByTestId('expense-group-field').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });

    it('does not show the delete button in create mode', () => {
      render(<AddExpenseScreen />);

      expect(screen.queryByTestId('delete-expense-button')).toBeNull();
    });

    it('shows the delete button while editing', () => {
      editStoredExpense();

      render(<AddExpenseScreen />);

      expect(screen.getByTestId('delete-expense-button')).toBeTruthy();
    });

    it('deletes the expense after confirmation and navigates back', () => {
      editStoredExpense();

      const alertSpy = jest.spyOn(Alert, 'alert');

      render(<AddExpenseScreen />);

      fireEvent.press(screen.getByTestId('delete-expense-button'));

      expect(alertSpy).toHaveBeenCalledTimes(1);
      const buttons = alertSpy.mock.calls[0][2];
      const confirmButton = buttons?.find((button) => button.style === 'destructive');

      act(() => {
        confirmButton?.onPress?.();
      });

      expect(useExpensesStore.getState().getDeletedExpenseIds(primaryGroupId)).toContain(editableExpenseId);
      expect(navigationMock.goBack).toHaveBeenCalledTimes(1);

      alertSpy.mockRestore();
    });
  });
});
