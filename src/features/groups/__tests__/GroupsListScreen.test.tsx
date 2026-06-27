import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { GroupsListScreen } from '../screens/GroupsListScreen';
import { useGroupsList } from '../hooks/useGroupsList';
import { GroupListItem } from '../types';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../hooks/useGroupsList');

const mockUseNavigation = jest.mocked(useNavigation);
const mockUseGroupsList = jest.mocked(useGroupsList);

function createGroup(overrides: Partial<GroupListItem>): GroupListItem {
  return {
    id: 'group-1',
    name: 'Casa',
    description: 'Gastos del hogar',
    category: 'HOME',
    status: { type: 'pending', count: 1 },
    members: [{ id: 'm1', name: 'Ana', initials: 'AN', avatarUrl: null }],
    extraMembersCount: 0,
    balance: 0,
    ...overrides,
  };
}

describe('GroupsListScreen', () => {
  beforeEach(() => {
    mockUseNavigation.mockReturnValue({
      getParent: () => ({ navigate: jest.fn() }),
    } as never);
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('shows a loading state instead of the empty state while groups are loading', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<GroupsListScreen />);

    expect(screen.getByLabelText('Cargando grupos')).toBeTruthy();
    expect(screen.getByText('Cargando grupos...')).toBeTruthy();
    expect(screen.queryByText('Aún no tienes movimientos')).toBeNull();
  });

  it('shows an error state instead of the empty state when groups fail to load', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      isLoading: false,
      isError: true,
      error: new Error('GET /groups failed'),
    });

    render(<GroupsListScreen />);

    expect(screen.getByText('No pudimos cargar tus grupos')).toBeTruthy();
    expect(screen.getByText('Intentá nuevamente en unos minutos.')).toBeTruthy();
    expect(screen.queryByText('Aún no tienes movimientos')).toBeNull();
  });

  it('renders positive balances as money owed to the current user and filters receivable groups', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [
        createGroup({ id: 'receivable', name: 'Viaje Bariloche', balance: 120 }),
        createGroup({ id: 'payable', name: 'Cena Palermo', balance: -45, status: { type: 'recent' } }),
      ],
      netBalance: 75,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<GroupsListScreen />);

    expect(screen.getByText('Balance Neto Total')).toBeTruthy();
    expect(screen.getByText('Te deben')).toBeTruthy();

    const summaryAmount = screen.getByText('$75,00');
    expect(summaryAmount.props.className).toContain('text-success');

    const receivableAmount = screen.getByText('+$120,00');
    expect(receivableAmount.props.className).toContain('text-success');
    expect(screen.getByText('-$45,00').props.className).toContain('text-debt');

    fireEvent.press(screen.getByText('Me deben'));

    expect(screen.getByText('Viaje Bariloche')).toBeTruthy();
    expect(screen.queryByText('Cena Palermo')).toBeNull();
  });

  it('renders negative balances as money the current user owes and filters payable groups', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [
        createGroup({ id: 'receivable', name: 'Viaje Bariloche', balance: 120, status: { type: 'settled' } }),
        createGroup({ id: 'payable', name: 'Cena Palermo', balance: -45 }),
      ],
      netBalance: -45,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<GroupsListScreen />);

    expect(screen.getByText('Balance Neto Total')).toBeTruthy();
    expect(screen.getByText('Debes')).toBeTruthy();

    const summaryAmount = screen.getByText('$45,00');
    expect(summaryAmount.props.className).toContain('text-debt');

    const payableAmount = screen.getByText('-$45,00');
    expect(payableAmount.props.className).toContain('text-debt');
    expect(screen.getByText('+$120,00').props.className).toContain('text-success');

    fireEvent.press(screen.getByText('Debo'));

    expect(screen.getByText('Cena Palermo')).toBeTruthy();
    expect(screen.queryByText('Viaje Bariloche')).toBeNull();
  });
});
