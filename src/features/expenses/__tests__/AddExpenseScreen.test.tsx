import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';

import { useAuthStore } from '../../../shared/store/authStore';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import type { GroupExpense } from '../../groups/types';
import {
  createExpense,
  deleteExpense,
  updateExpense,
} from '../api/expensesApi';
import { useExpenseToEdit } from '../hooks/useExpenseToEdit';
import { useGroups } from '../../groups/hooks/useGroups';
import { queryKeys } from '../../../shared/api/queryKeys';

jest.mock('../api/expensesApi', () => ({
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  getExpense: jest.fn(),
  getGroupExpenses: jest.fn(),
}));

jest.mock('../hooks/useExpenseToEdit', () => ({
  useExpenseToEdit: jest.fn(),
}));

jest.mock('../../groups/hooks/useGroups', () => ({
  useGroups: jest.fn(),
}));

// Fixed IDs — match what would come from the API
const PRIMARY_GROUP_ID = 'primary-group-id';
const SECONDARY_GROUP_ID = 'secondary-group-id';

// Member IDs kept consistent with old store IDs to minimise expectation changes
const MEMBERS_PRIMARY = [
  { id: 'current-user', displayName: 'Vos', isCurrentUser: true },
  { id: 'invite-0-alex@example.com', displayName: 'alex@example.com', isCurrentUser: false },
  { id: 'invite-1-sarah@example.com', displayName: 'sarah@example.com', isCurrentUser: false },
];
const MEMBERS_SECONDARY = [
  { id: 'current-user', displayName: 'Vos', isCurrentUser: true },
  { id: 'invite-0-diego@example.com', displayName: 'diego@example.com', isCurrentUser: false },
  { id: 'invite-1-lucia@example.com', displayName: 'lucia@example.com', isCurrentUser: false },
];

const GROUP_PRIMARY = {
  id: PRIMARY_GROUP_ID, name: 'Viaje a Lisboa', description: null, currency: 'ARS',
  createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z',
};
const GROUP_SECONDARY = {
  id: SECONDARY_GROUP_ID, name: 'Departamento', description: null, currency: 'ARS',
  createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z',
};

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
let testClient: QueryClient;

const mockCreateExpense = jest.mocked(createExpense);
const mockUpdateExpense = jest.mocked(updateExpense);
const mockDeleteExpense = jest.mocked(deleteExpense);
const mockUseExpenseToEdit = jest.mocked(useExpenseToEdit);
const mockUseGroups = jest.mocked(useGroups);

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={testClient}>{children}</QueryClientProvider>;
}

function seedGroupDetails(client: QueryClient) {
  // Pre-seed group detail cache so useGroupMembers returns data synchronously
  client.setQueryData(queryKeys.groups.detail(PRIMARY_GROUP_ID), {
    id: PRIMARY_GROUP_ID, name: 'Viaje a Lisboa', members: MEMBERS_PRIMARY,
  });
  client.setQueryData(queryKeys.groups.detail(SECONDARY_GROUP_ID), {
    id: SECONDARY_GROUP_ID, name: 'Departamento', members: MEMBERS_SECONDARY,
  });
}

describe('AddExpenseScreen', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'token');
    jest.clearAllMocks();
    mockUseExpenseToEdit.mockReturnValue(undefined);

    testClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    seedGroupDetails(testClient);

    // Groups come from API — primary first so it's the default selection
    mockUseGroups.mockReturnValue({
      data: { data: [GROUP_PRIMARY, GROUP_SECONDARY] },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useGroups>);

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

    // Use real backend response shape (paidBy / participants, not paidByMemberId)
    mockCreateExpense.mockResolvedValue({
      id: 'new-expense-id',
      groupId: PRIMARY_GROUP_ID,
      title: 'Cena compartida',
      amount: 1500.5,
      currency: 'ARS',
      paidBy: { id: 'current-user', displayName: 'Vos' },
      participants: [{ memberId: 'current-user', displayName: 'Vos', owedAmount: 0, paidAmount: 1500.5, netAmount: 750.25 }],
      splitType: 'equal',
      category: 'FOOD',
      notes: null,
      expenseDate: '2024-05-20T00:00:00.000Z',
      createdAt: '2024-05-20T00:00:00.000Z',
      updatedAt: '2024-05-20T00:00:00.000Z',
    });
    mockUpdateExpense.mockResolvedValue({
      id: 'expense-1',
      groupId: PRIMARY_GROUP_ID,
      title: 'Cena Italiana @ Luigis',
      amount: 500,
      currency: 'ARS',
      paidBy: { id: 'invite-0-alex@example.com', displayName: 'alex@example.com' },
      participants: [],
      splitType: 'equal',
      category: 'FOOD',
      notes: null,
      expenseDate: '2024-05-20T00:00:00.000Z',
      createdAt: '2024-05-20T00:00:00.000Z',
      updatedAt: '2024-05-20T00:00:00.000Z',
    });
    mockDeleteExpense.mockResolvedValue({
      id: 'expense-1',
      deletedAt: '2024-05-20T00:00:00.000Z',
    });
  });

  afterEach(() => {
    testClient.clear();
  });

  it('shows validation errors in Spanish when the form is empty', async () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('Ingresá un monto')).toBeTruthy();
      expect(screen.getByText('Ingresá una descripción')).toBeTruthy();
    });
  });

  it('does not submit when the amount is zero or less', async () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '0');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('El monto debe ser mayor a 0')).toBeTruthy();
    });
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  it('calls the create expense API for the selected group when valid', async () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '1500,50');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena compartida');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalledWith(PRIMARY_GROUP_ID, {
        title: 'Cena compartida',
        amount: 1500.5,
        currency: 'ARS',
        paidByMemberId: 'current-user',
        participantMemberIds: ['current-user', 'invite-0-alex@example.com', 'invite-1-sarah@example.com'],
        splitType: 'equal',
        category: 'FOOD',
        notes: null,
        expenseDate: expect.any(String),
      });
    });
  });

  it('stores the chosen category with the expense', async () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '900');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Zapatillas');
    fireEvent.press(screen.getByTestId('expense-category-SHOPPING'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ category: 'SHOPPING' }),
      );
    });
  });

  it('masks the amount with es-AR thousands separators', () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    const amountInput = screen.getByTestId('expense-amount-input');
    fireEvent.changeText(amountInput, '11111');

    expect(amountInput.props.value).toBe('11.111');
  });

  it('lists the real members of the selected group', () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    expect(screen.getAllByText('Vos').length).toBeGreaterThan(0);
    expect(screen.getByText('alex@example.com')).toBeTruthy();
    expect(screen.getByText('sarah@example.com')).toBeTruthy();
  });

  it('refreshes participants when the group changes', () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    expect(screen.getByText('alex@example.com')).toBeTruthy();

    fireEvent.press(screen.getByTestId('expense-group-field'));
    const modal = screen.getByTestId('expense-group-modal');
    fireEvent.press(within(modal).getByText('Departamento'));

    expect(screen.getByText('diego@example.com')).toBeTruthy();
    expect(screen.queryByText('alex@example.com')).toBeNull();
  });

  it('preselects the group received from navigation params', () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: SECONDARY_GROUP_ID } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />, { wrapper: Wrapper });

    expect(screen.getByTestId('expense-group-field')).toHaveTextContent('Departamento');
    expect(screen.getByText('diego@example.com')).toBeTruthy();
  });

  it('returns to the existing group detail when saving from that group', async () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: PRIMARY_GROUP_ID } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />, { wrapper: Wrapper });

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '1500');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena compartida');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalledWith(PRIMARY_GROUP_ID, expect.any(Object));
    });
    expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
    expect(navigationMock.popTo).not.toHaveBeenCalled();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('pops to the selected group detail when changing groups before saving', async () => {
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: PRIMARY_GROUP_ID } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />, { wrapper: Wrapper });

    fireEvent.press(screen.getByTestId('expense-group-field'));
    fireEvent.press(within(screen.getByTestId('expense-group-modal')).getByText('Departamento'));
    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '900');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Compras');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(mockCreateExpense).toHaveBeenCalledWith(SECONDARY_GROUP_ID, expect.any(Object));
    });
    expect(navigationMock.popTo).toHaveBeenCalledWith('GroupDetail', { groupId: SECONDARY_GROUP_ID });
    expect(navigationMock.goBack).not.toHaveBeenCalled();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('shows error when selected group is not found in the groups list', async () => {
    // Simulate group not in API result (e.g. deleted externally)
    mockUseGroups.mockReturnValue({
      data: { data: [GROUP_SECONDARY] },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useGroups>);
    jest.mocked(useRoute).mockReturnValue({ params: { groupId: PRIMARY_GROUP_ID } } as ReturnType<typeof useRoute>);

    render(<AddExpenseScreen />, { wrapper: Wrapper });

    fireEvent.changeText(screen.getByTestId('expense-amount-input'), '1500');
    fireEvent.changeText(screen.getByTestId('expense-description-input'), 'Cena compartida');

    await act(async () => {
      fireEvent.press(screen.getByTestId('create-expense-button'));
    });

    await waitFor(() => {
      expect(screen.getByText('El grupo seleccionado ya no está disponible. Elegí otro grupo.')).toBeTruthy();
    });
    expect(mockCreateExpense).not.toHaveBeenCalled();
  });

  it('keeps at least one participant selected', () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(3);

    fireEvent.press(screen.getByTestId('expense-participant-invite-0-alex@example.com'));
    fireEvent.press(screen.getByTestId('expense-participant-invite-1-sarah@example.com'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(1);

    fireEvent.press(screen.getByTestId('expense-participant-current-user'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(1);
  });

  it('re-selects everyone with "Seleccionar todos"', () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    fireEvent.press(screen.getByTestId('expense-participant-invite-0-alex@example.com'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(2);

    fireEvent.press(screen.getByTestId('expense-select-all'));
    expect(screen.getAllByText('Incluido en el gasto')).toHaveLength(3);
  });

  it('disables "Seleccionar todos" when everyone is already selected', () => {
    render(<AddExpenseScreen />, { wrapper: Wrapper });

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
    render(<AddExpenseScreen />, { wrapper: Wrapper });

    fireEvent.press(screen.getByTestId('expense-paidby-field'));

    const modal = screen.getByTestId('expense-paidby-modal');
    fireEvent.press(within(modal).getByText('alex@example.com'));

    expect(screen.getByTestId('expense-paidby-field')).toHaveTextContent('alex@example.com');
  });

  describe('edit mode', () => {
    const editableExpense: GroupExpense = {
      id: 'expense-1',
      title: 'Cena Italiana @ Luigis',
      paidByLabel: 'Pagado por alex@example.com',
      timeLabel: 'Hoy',
      totalAmount: 184,
      category: 'FOOD',
      userRelation: { type: 'share', amount: 92 },
      paidById: 'invite-0-alex@example.com',
      participantIds: ['current-user', 'invite-0-alex@example.com'],
      date: '2024-05-20T00:00:00.000Z',
    };

    const editStoredExpense = () => {
      jest.mocked(useRoute).mockReturnValue({
        params: { groupId: PRIMARY_GROUP_ID, expenseId: editableExpense.id },
      } as ReturnType<typeof useRoute>);
      mockUseExpenseToEdit.mockReturnValue(editableExpense);
    };

    it('prefills the form from the selected expense', () => {
      editStoredExpense();

      render(<AddExpenseScreen />, { wrapper: Wrapper });

      expect(screen.getByText('Editar gasto')).toBeTruthy();
      expect(screen.getByText('Guardar cambios')).toBeTruthy();
      expect(screen.getByTestId('expense-amount-input').props.value).toBe('184');
      expect(screen.getByTestId('expense-description-input').props.value).toBe('Cena Italiana @ Luigis');
      expect(screen.getByTestId('expense-paidby-field')).toHaveTextContent('alex@example.com');
      expect(screen.getByTestId('expense-category-FOOD').props.accessibilityState).toMatchObject({
        selected: true,
      });
    });

    it('calls the update expense API and navigates back on save', async () => {
      editStoredExpense();

      render(<AddExpenseScreen />, { wrapper: Wrapper });

      fireEvent.changeText(screen.getByTestId('expense-amount-input'), '500');

      await act(async () => {
        fireEvent.press(screen.getByTestId('create-expense-button'));
      });

      await waitFor(() => {
        expect(mockUpdateExpense).toHaveBeenCalledWith(
          editableExpense.id,
          expect.objectContaining({ amount: 500 }),
        );
      });

      expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
      expect(navigationMock.replace).not.toHaveBeenCalled();
    });

    it('keeps the group fixed while editing', () => {
      editStoredExpense();

      render(<AddExpenseScreen />, { wrapper: Wrapper });

      expect(screen.getByTestId('expense-group-field').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });

    it('does not show the delete button in create mode', () => {
      render(<AddExpenseScreen />, { wrapper: Wrapper });

      expect(screen.queryByTestId('delete-expense-button')).toBeNull();
    });

    it('shows the delete button while editing', () => {
      editStoredExpense();

      render(<AddExpenseScreen />, { wrapper: Wrapper });

      expect(screen.getByTestId('delete-expense-button')).toBeTruthy();
    });

    it('calls the delete expense API after confirmation and navigates back', async () => {
      editStoredExpense();

      const alertSpy = jest.spyOn(Alert, 'alert');

      render(<AddExpenseScreen />, { wrapper: Wrapper });

      fireEvent.press(screen.getByTestId('delete-expense-button'));

      expect(alertSpy).toHaveBeenCalledTimes(1);
      const buttons = alertSpy.mock.calls[0][2];
      const confirmButton = buttons?.find((button) => button.style === 'destructive');

      act(() => {
        confirmButton?.onPress?.();
      });

      await waitFor(() => {
        expect(mockDeleteExpense).toHaveBeenCalledWith(editableExpense.id, expect.any(Object));
      });
      expect(navigationMock.goBack).toHaveBeenCalledTimes(1);

      alertSpy.mockRestore();
    });
  });
});
