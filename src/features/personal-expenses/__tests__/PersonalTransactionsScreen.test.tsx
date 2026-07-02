import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { PersonalTransactionsScreen } from '../screens/PersonalTransactionsScreen';
import { usePersonalTransactions } from '../hooks/usePersonalTransactions';

jest.mock('../hooks/usePersonalTransactions');

const mockUseNavigation = jest.mocked(useNavigation);
const mockUsePersonalTransactions = jest.mocked(usePersonalTransactions);

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
      total: 876371,
      incomeTotal: 876371,
      expenseTotal: 0,
      currency: 'ARS',
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the expense tab empty state matching the Stitch design', () => {
    render(<PersonalTransactionsScreen />);

    // Total section: "Total •" label + formatted amount
    expect(screen.getByText('Total •')).toBeTruthy();
    expect(screen.getByText('876.371 $')).toBeTruthy();
    // Dynamic date range label: current week (Monday 29 jun → Sunday 5 jul)
    expect(screen.getByText('29 jun – 5 jul')).toBeTruthy();
    // Empty state message
    expect(screen.getByText('No hubo gastos esta semana')).toBeTruthy();
    // Expense tab selected by default
    expect(screen.getByTestId('personal-tab-expense').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('switches to the income tab and shows the income empty state', () => {
    render(<PersonalTransactionsScreen />);

    fireEvent.press(screen.getByTestId('personal-tab-income'));

    expect(screen.getByText('No hubo ingresos esta semana')).toBeTruthy();
    expect(screen.getByTestId('personal-tab-income').props.accessibilityState).toMatchObject({ selected: true });
    expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'income', range: 'week' }),
    );
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
});
