import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { PersonalTransactionsScreen } from '../screens/PersonalTransactionsScreen';
import { usePersonalTransactions } from '../hooks/usePersonalTransactions';
import { usePersonalTransactionsSummary } from '../hooks/usePersonalTransactionsSummary';

jest.mock('../hooks/usePersonalTransactions');
jest.mock('../hooks/usePersonalTransactionsSummary');

const mockUseNavigation = jest.mocked(useNavigation);
const mockUsePersonalTransactions = jest.mocked(usePersonalTransactions);
const mockUsePersonalTransactionsSummary = jest.mocked(usePersonalTransactionsSummary);

// Pin "today" to 2026-06-29 (Monday) so the dynamic rangeLabel is deterministic.
// Expected default week label: "29 jun – 5 jul"
const FAKE_NOW = new Date('2026-06-29T12:00:00.000Z');

describe('PersonalTransactionsScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: FAKE_NOW });
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue({
      getParent: () => ({ navigate: jest.fn() }),
    } as never);
    mockUsePersonalTransactions.mockReturnValue({
      transactions: [],
      total: 12500,
      incomeTotal: 0,
      expenseTotal: 12500,
      currency: 'ARS',
      hasFetchedTransactions: true,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockUsePersonalTransactionsSummary.mockReturnValue({
      summary: {
        total: 123629,
        incomeTotal: 500000,
        expenseTotal: 376371,
        currency: 'ARS',
        breakdown: [
          { category: 'Comida', type: 'expense', amount: 15000, percentage: 75 },
          { category: 'Salario', type: 'income', amount: 500000, percentage: 100 },
        ],
      },
      hasFetchedSummary: true,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders an honest expense empty state when the backend returns an empty list', () => {
    render(<PersonalTransactionsScreen />);

    // Total section: "Total" label + formatted amount
    expect(screen.getAllByText('Total')).toHaveLength(2);
    expect(screen.getByText('123.629 $')).toBeTruthy();
    expect(screen.getByText('376.371 $')).toBeTruthy();
    // Dynamic date range label: current week (Monday 29 jun → Sunday 5 jul)
    expect(screen.getByText('29 jun – 5 jul')).toBeTruthy();
    // Summary/chart visuals now come from the (mocked) real summary API, not a design fixture.
    expect(screen.getByText('Gastos Recientes')).toBeTruthy();
    expect(screen.getByText('No hay gastos para este período.')).toBeTruthy();
    expect(screen.queryByText('Comida')).toBeNull();
    expect(screen.queryByText('- 350.548 $')).toBeNull();
    expect(screen.queryByText('Transporte')).toBeNull();
    expect(screen.queryByText('Compras')).toBeNull();
    expect(screen.queryByText('Otros')).toBeNull();
    expect(screen.getByTestId('personal-transactions-donut-chart')).toBeTruthy();
    // Expense tab selected by default
    expect(screen.getByTestId('personal-tab-expense').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('switches to the income tab and preserves the backend empty list', () => {
    render(<PersonalTransactionsScreen />);

    fireEvent.press(screen.getByTestId('personal-tab-income'));

    expect(screen.getByText('Ingresos Recientes')).toBeTruthy();
    expect(screen.getByText('No hay ingresos para este período.')).toBeTruthy();
    expect(screen.queryByText('Salario')).toBeNull();
    expect(screen.queryByText('+ 613.460 $')).toBeNull();
    expect(screen.queryByText('Regalos')).toBeNull();
    expect(screen.queryByText('Intereses')).toBeNull();
    expect(screen.getByTestId('personal-tab-income').props.accessibilityState).toMatchObject({ selected: true });
    expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'income', range: 'week' }),
    );
  });

  it('uses the summary total for the top total when selected-tab list totals differ', () => {
    mockUsePersonalTransactions.mockImplementation(({ type }) => ({
      transactions: [],
      total: type === 'income' ? 10000 : 2500,
      incomeTotal: 10000,
      expenseTotal: 2500,
      currency: 'ARS',
      hasFetchedTransactions: true,
      isLoading: false,
      isError: false,
      error: null,
    }));

    mockUsePersonalTransactionsSummary.mockReturnValue({
      summary: {
        total: 123629,
        incomeTotal: 10000,
        expenseTotal: 2500,
        currency: 'ARS',
        breakdown: [
          { category: 'Compras', type: 'expense', amount: 2500, percentage: 100 },
          { category: 'Salario', type: 'income', amount: 10000, percentage: 100 },
        ],
      },
      hasFetchedSummary: true,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PersonalTransactionsScreen />);

    expect(within(screen.getByTestId('personal-transactions-total')).getByText('123.629 $')).toBeTruthy();
    expect(screen.getByText('2.500 $')).toBeTruthy();

    fireEvent.press(screen.getByTestId('personal-tab-income'));

    expect(screen.getByText('10.000 $')).toBeTruthy();
  });

  it('keeps the summary top total unchanged when switching tabs', () => {
    mockUsePersonalTransactions.mockImplementation(({ type }) => ({
      transactions: [],
      total: type === 'income' ? 10000 : 2500,
      incomeTotal: type === 'income' ? 10000 : 0,
      expenseTotal: type === 'expense' ? 2500 : 0,
      currency: 'ARS',
      hasFetchedTransactions: true,
      isLoading: false,
      isError: false,
      error: null,
    }));

    mockUsePersonalTransactionsSummary.mockReturnValue({
      summary: {
        total: 123629,
        incomeTotal: 10000,
        expenseTotal: 2500,
        currency: 'ARS',
        breakdown: [
          { category: 'Compras', type: 'expense', amount: 2500, percentage: 100 },
          { category: 'Salario', type: 'income', amount: 10000, percentage: 100 },
        ],
      },
      hasFetchedSummary: true,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PersonalTransactionsScreen />);

    expect(within(screen.getByTestId('personal-transactions-total')).getByText('123.629 $')).toBeTruthy();

    fireEvent.press(screen.getByTestId('personal-tab-income'));

    expect(within(screen.getByTestId('personal-transactions-total')).getByText('123.629 $')).toBeTruthy();
  });

  it('marks time filters as accessible selectable controls', () => {
    render(<PersonalTransactionsScreen />);

    fireEvent.press(screen.getByTestId('personal-range-month'));

    expect(screen.getByTestId('personal-range-month').props.accessibilityState).toMatchObject({ selected: true });
    expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
      expect.objectContaining({ range: 'month' }),
    );
  });

  it('navigates to the add personal transaction screen from the FAB', () => {
    const rootNavigate = jest.fn();
    mockUseNavigation.mockReturnValue({ getParent: () => ({ navigate: rootNavigate }) } as never);

    render(<PersonalTransactionsScreen />);

    fireEvent.press(screen.getByTestId('add-personal-transaction-fab'));

    expect(rootNavigate).toHaveBeenCalledWith('AddPersonalTransaction', { type: 'expense' });
  });

  it('renders the white card that wraps tabs, filters, date nav and content', () => {
    render(<PersonalTransactionsScreen />);

    expect(screen.getByTestId('personal-transactions-card')).toBeTruthy();
  });

  it('renders the total section outside the card, not as a child of it', () => {
    render(<PersonalTransactionsScreen />);

    const total = screen.getByTestId('personal-transactions-total');
    const card = screen.getByTestId('personal-transactions-card');

    expect(total).toBeTruthy();
    expect(card).toBeTruthy();
    // The total section must be a sibling before the card, not nested inside it.
    expect(within(card).queryByTestId('personal-transactions-total')).toBeNull();
  });

  it('keeps the FAB visible after switching to the income tab', () => {
    render(<PersonalTransactionsScreen />);

    fireEvent.press(screen.getByTestId('personal-tab-income'));

    expect(screen.getByTestId('add-personal-transaction-fab')).toBeTruthy();
  });

  it('renders backend transactions instead of deterministic fixtures when the list endpoint returns data', () => {
    mockUsePersonalTransactions.mockReturnValue({
      transactions: [
        {
          id: 'ptx-custom-1',
          type: 'expense',
          amount: 12345,
          currency: 'ARS',
          category: 'Salud',
          accountId: 'account-ars',
          accountName: 'Pesos',
          occurredAt: '2026-06-28T12:00:00.000Z',
          note: null,
          createdAt: '2026-06-28T12:00:00.000Z',
          updatedAt: '2026-06-28T12:00:00.000Z',
        },
      ],
      total: 12345,
      incomeTotal: 0,
      expenseTotal: 12345,
      currency: 'ARS',
      hasFetchedTransactions: true,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PersonalTransactionsScreen />);

    expect(screen.getByText('Salud')).toBeTruthy();
    expect(screen.getByText('- 12.345 $')).toBeTruthy();
    expect(screen.getByText('28 de jun de 2026')).toBeTruthy();
    expect(screen.queryByText('Comida')).toBeNull();
  });

  it('renders the real year from a 2026 backend transaction date', () => {
    mockUsePersonalTransactions.mockReturnValue({
      transactions: [
        {
          id: 'ptx-custom-2026',
          type: 'expense',
          amount: 2400,
          currency: 'ARS',
          category: 'Libros',
          accountId: 'account-ars',
          accountName: 'Pesos',
          occurredAt: '2026-07-02T12:00:00.000Z',
          note: null,
          createdAt: '2026-07-02T12:00:00.000Z',
          updatedAt: '2026-07-02T12:00:00.000Z',
        },
      ],
      total: 2400,
      incomeTotal: 0,
      expenseTotal: 2400,
      currency: 'ARS',
      hasFetchedTransactions: true,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PersonalTransactionsScreen />);

    expect(screen.getByText('2 de jul de 2026')).toBeTruthy();
    expect(screen.queryByText('2 jul, 2024')).toBeNull();
  });

  it('renders loading and error states inside the Stitch card content area', () => {
    mockUsePersonalTransactions.mockReturnValueOnce({
      transactions: [],
      total: 0,
      incomeTotal: 0,
      expenseTotal: 0,
      currency: 'ARS',
      hasFetchedTransactions: false,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<PersonalTransactionsScreen />);
    expect(screen.getByText('Cargando movimientos...')).toBeTruthy();
    expect(screen.queryByText('123.629 $')).toBeNull();
    expect(screen.queryByTestId('personal-transactions-total')).toBeNull();

    mockUsePersonalTransactionsSummary.mockReturnValueOnce({
      summary: undefined,
      hasFetchedSummary: false,
      isLoading: false,
      isError: true,
      error: new Error('summary boom'),
    });
    mockUsePersonalTransactions.mockReturnValueOnce({
      transactions: [],
      total: 0,
      incomeTotal: 0,
      expenseTotal: 0,
      currency: 'ARS',
      hasFetchedTransactions: false,
      isLoading: false,
      isError: true,
      error: new Error('boom'),
    });

    render(<PersonalTransactionsScreen />);
    expect(screen.getByText('No pudimos cargar tus movimientos')).toBeTruthy();
    expect(screen.queryByText('123.629 $')).toBeNull();
    expect(screen.queryByTestId('personal-transactions-total')).toBeNull();
  });

  it('passes the active range to the real summary query', () => {
    render(<PersonalTransactionsScreen />);

    fireEvent.press(screen.getByTestId('personal-range-month'));

    expect(mockUsePersonalTransactionsSummary).toHaveBeenLastCalledWith(
      expect.objectContaining({ range: 'month' }),
    );
  });
});
