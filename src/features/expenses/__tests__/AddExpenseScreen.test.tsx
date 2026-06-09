import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';

import { useGroupsStore } from '../../groups/store/groupsStore';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { useExpensesStore } from '../store/expensesStore';

const firstGroupId = () => useGroupsStore.getState().groups[0].id;

describe('AddExpenseScreen', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    jest.mocked(useRoute).mockReturnValue({ params: undefined } as ReturnType<typeof useRoute>);
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
});
