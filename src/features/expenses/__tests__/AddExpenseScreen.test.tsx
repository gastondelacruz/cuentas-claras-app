import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';

import { useGroupsStore } from '../../groups/store/groupsStore';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { useExpensesStore } from '../store/expensesStore';

const firstGroupId = () => useGroupsStore.getState().groups[0].id;

type NavigationMock = {
  navigate: jest.Mock;
  replace: jest.Mock;
  goBack: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  dispatch: jest.Mock;
  setOptions: jest.Mock;
};

let navigationMock: NavigationMock;

describe('AddExpenseScreen', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    jest.mocked(useRoute).mockReturnValue({ params: undefined } as ReturnType<typeof useRoute>);

    navigationMock = {
      navigate: jest.fn(),
      replace: jest.fn(),
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
    expect(useExpensesStore.getState().getExpensesForGroup(firstGroupId())).toHaveLength(0);
  });

  it('creates the expense for the selected group when valid', async () => {
    render(<AddExpenseScreen />);

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '1500,50');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena compartida');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      const expenses = useExpensesStore.getState().getExpensesForGroup(firstGroupId());
      expect(expenses).toHaveLength(1);
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
      const expenses = useExpensesStore.getState().getExpensesForGroup(firstGroupId());
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

    // group-1 seeded members (Alex, Sarah) plus the current user.
    expect(screen.getAllByText('Vos').length).toBeGreaterThan(0);
    expect(screen.getByText('Alex')).toBeTruthy();
    expect(screen.getByText('Sarah')).toBeTruthy();
  });

  it('refreshes participants when the group changes', () => {
    render(<AddExpenseScreen />);

    expect(screen.getByText('Alex')).toBeTruthy();

    fireEvent.press(screen.getByTestId('expense-group-field'));
    const modal = screen.getByTestId('expense-group-modal');
    fireEvent.press(within(modal).getByText('Departamento'));

    // group-2 members (Diego, Lucía) replace group-1 members.
    expect(screen.getByText('Diego')).toBeTruthy();
    expect(screen.queryByText('Alex')).toBeNull();
  });

  it('preselects the group received from navigation params', () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: 'group-2' } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />);

    expect(screen.getByTestId('expense-group-field')).toHaveTextContent('Departamento');
    expect(screen.getByText('Diego')).toBeTruthy();
  });

  it('blocks creating an expense when the route group was deleted after opening the screen', async () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: 'group-1' } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />);

    act(() => {
      useGroupsStore.getState().deleteGroup('group-1');
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
    expect(useExpensesStore.getState().getExpensesForGroup('group-1')).toHaveLength(0);
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('keeps at least one participant selected', () => {
    render(<AddExpenseScreen />);

    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(3);

    fireEvent.press(screen.getByTestId('expense-participant-m1'));
    fireEvent.press(screen.getByTestId('expense-participant-m2'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(1);

    // Attempting to deselect the last participant is ignored.
    fireEvent.press(screen.getByTestId('expense-participant-current-user'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(1);
  });

  it('re-selects everyone with "Seleccionar todos"', () => {
    render(<AddExpenseScreen />);

    fireEvent.press(screen.getByTestId('expense-participant-m1'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(2);

    fireEvent.press(screen.getByTestId('expense-select-all'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(3);
  });

  it('disables "Seleccionar todos" when everyone is already selected', () => {
    render(<AddExpenseScreen />);

    const selectAllButton = screen.getByTestId('expense-select-all');
    expect(selectAllButton.props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.press(screen.getByTestId('expense-participant-m1'));
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
    fireEvent.press(within(modal).getByText('Alex'));

    expect(screen.getByTestId('expense-paidby-field')).toHaveTextContent('Alex');
  });

  describe('edit mode', () => {
    const editSeededExpense = () => {
      jest.mocked(useRoute).mockReturnValue({
        params: { groupId: 'group-1', expenseId: 'e1' },
      } as ReturnType<typeof useRoute>);
    };

    it('prefills the form from the selected expense', () => {
      editSeededExpense();

      render(<AddExpenseScreen />);

      expect(screen.getByText('Editar gasto')).toBeTruthy();
      expect(screen.getByText('Guardar cambios')).toBeTruthy();
      expect(screen.getByTestId('expense-amount-input').props.value).toBe('184');
      expect(screen.getByTestId('expense-description-input').props.value).toBe(
        'Cena Italiana @ Luigis',
      );
      expect(screen.getByTestId('expense-paidby-field')).toHaveTextContent('Alex');
      expect(screen.getByTestId('expense-category-FOOD').props.accessibilityState).toMatchObject({
        selected: true,
      });
    });

    it('updates the expense in place and navigates back on save', async () => {
      editSeededExpense();

      render(<AddExpenseScreen />);

      fireEvent.changeText(screen.getByTestId('expense-amount-input'), '500');

      await act(async () => {
        fireEvent.press(screen.getByTestId('create-expense-button'));
      });

      await waitFor(() => {
        const expenses = useExpensesStore.getState().getExpensesForGroup('group-1');
        expect(expenses).toHaveLength(1);
        expect(expenses[0]).toMatchObject({
          id: 'e1',
          title: 'Cena Italiana @ Luigis',
          totalAmount: 500,
        });
      });

      expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
      expect(navigationMock.replace).not.toHaveBeenCalled();
    });

    it('keeps the group fixed while editing', () => {
      editSeededExpense();

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
      editSeededExpense();

      render(<AddExpenseScreen />);

      expect(screen.getByTestId('delete-expense-button')).toBeTruthy();
    });

    it('deletes the expense after confirmation and navigates back', () => {
      editSeededExpense();

      const alertSpy = jest.spyOn(Alert, 'alert');

      render(<AddExpenseScreen />);

      fireEvent.press(screen.getByTestId('delete-expense-button'));

      expect(alertSpy).toHaveBeenCalledTimes(1);
      const buttons = alertSpy.mock.calls[0][2];
      const confirmButton = buttons?.find((button) => button.style === 'destructive');

      act(() => {
        confirmButton?.onPress?.();
      });

      expect(useExpensesStore.getState().getDeletedExpenseIds('group-1')).toContain('e1');
      expect(navigationMock.goBack).toHaveBeenCalledTimes(1);

      alertSpy.mockRestore();
    });
  });
});
