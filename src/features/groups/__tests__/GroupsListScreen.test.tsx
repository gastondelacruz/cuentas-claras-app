import { useNavigation } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { GroupsListScreen } from '../screens/GroupsListScreen';
import { useGroupsList } from '../hooks/useGroupsList';
import { GroupListItem } from '../types';
import { isEnhancedInitialLoadingEnabled } from '../../../shared/feature-flags/initialLoadingFlags';
import { useAuthStore } from '../../../shared/store/authStore';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../hooks/useGroupsList');
jest.mock('../../../shared/feature-flags/initialLoadingFlags');

const mockUseNavigation = jest.mocked(useNavigation);
const mockUseGroupsList = jest.mocked(useGroupsList);
const mockIsEnhancedInitialLoadingEnabled = jest.mocked(isEnhancedInitialLoadingEnabled);

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

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
  let rootNavigateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().clearSession();
    rootNavigateMock = jest.fn();
    mockUseNavigation.mockReturnValue({
      getParent: () => ({ navigate: rootNavigateMock }),
    } as never);
    mockIsEnhancedInitialLoadingEnabled.mockReturnValue(false);
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      owedToYou: 0,
      youOwe: 0,
      currency: 'ARS',
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('shows a loading state instead of the empty state while groups are loading', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      owedToYou: 0,
      youOwe: 0,
      currency: 'ARS',
      isLoading: true,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<GroupsListScreen />);

    expect(screen.getByLabelText('Cargando grupos')).toBeTruthy();
    expect(screen.getByText('Cargando grupos...')).toBeTruthy();
    expect(screen.queryByText(/¡Bienvenido! Empecemos/)).toBeNull();
  });

  it('renders stable skeleton placeholders instead of the centered spinner when enhanced loading is enabled', () => {
    mockIsEnhancedInitialLoadingEnabled.mockReturnValue(true);
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      owedToYou: 0,
      youOwe: 0,
      currency: 'ARS',
      isLoading: true,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<GroupsListScreen />);

    expect(screen.getByTestId('groups-loading-skeleton')).toBeTruthy();
    expect(screen.getByLabelText('Cargando grupos')).toBeTruthy();
    expect(screen.queryByText('Cargando grupos...')).toBeNull();
    expect(screen.getByText('Cuentas Claras')).toBeTruthy();
  });

  it('shows an error state instead of the empty state when groups fail to load', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      owedToYou: 0,
      youOwe: 0,
      currency: 'ARS',
      isLoading: false,
      isError: true,
      error: new Error('GET /groups failed'),
    });

    renderWithQueryClient(<GroupsListScreen />);

    expect(screen.getByText('No pudimos cargar tus grupos')).toBeTruthy();
    expect(screen.getByText('Intentá nuevamente en unos minutos.')).toBeTruthy();
    expect(screen.queryByText(/¡Bienvenido! Empecemos/)).toBeNull();
  });

  it('renders the Stitch empty groups card and navigates to group creation', () => {
    useAuthStore.getState().setEmailVerification({ verified: true, verifiedAt: '2026-07-05T10:00:00.000Z' });
    renderWithQueryClient(<GroupsListScreen />);

    expect(screen.getByText('Cuentas Claras')).toBeTruthy();
    expect(screen.getByTestId('empty-state-card')).toBeTruthy();
    const illustration = screen.getByLabelText('Ilustración de persona usando el celular con dinero y monedas');
    expect(illustration).toBeTruthy();
    expect(illustration.props.source).toEqual(expect.objectContaining({
      testUri: expect.stringContaining('empty-groups-illustration.png'),
    }));

    const title = screen.getByText('¡Bienvenido! Empecemos\na ahorrar juntos');
    const description = screen.getByText('Crea tu primer grupo para empezar\na dividir gastos con tus amigos.');
    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
    expect(screen.queryByText(/\\a/)).toBeNull();
    expect(screen.queryByText(/Empecemosa ahorrar/)).toBeNull();

    const createButton = screen.getByLabelText('Crear un Grupo');
    expect(createButton.props.accessibilityRole).toBe('button');
    expect(createButton.props.className).toContain('h-12');
    expect(createButton.props.className).toContain('rounded-full');

    fireEvent.press(createButton);

    expect(rootNavigateMock).toHaveBeenCalledWith('NewGroup');
  });

  it('shows the verification banner and disables empty-home creation for unverified users', () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok-abc');

    renderWithQueryClient(<GroupsListScreen />);

    expect(screen.getByText('Verifica tu email para poder usar la app')).toBeTruthy();

    const createButton = screen.getByLabelText('Crear un Grupo');
    expect(createButton.props.accessibilityState).toMatchObject({ disabled: true });
    fireEvent.press(createButton);

    expect(rootNavigateMock).not.toHaveBeenCalled();
  });

  it('renders positive balances as money owed to the current user and filters receivable groups', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [
        createGroup({ id: 'receivable', name: 'Viaje Bariloche', balance: 120 }),
        createGroup({ id: 'payable', name: 'Cena Palermo', balance: -45, status: { type: 'recent' } }),
      ],
      netBalance: 75,
      owedToYou: 120,
      youOwe: 45,
      currency: 'ARS',
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<GroupsListScreen />);

    expect(screen.getByText('Balance Neto Total')).toBeTruthy();
    expect(screen.getAllByText('Te deben').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Debes').length).toBeGreaterThan(0);
    expect(screen.getByText('$120,00')).toBeTruthy();
    expect(screen.getByText('$45,00')).toBeTruthy();

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
      owedToYou: 120,
      youOwe: 165,
      currency: 'ARS',
      isLoading: false,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<GroupsListScreen />);

    expect(screen.getByText('Balance Neto Total')).toBeTruthy();
    expect(screen.getAllByText('Debes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Te deben').length).toBeGreaterThan(0);
    expect(screen.getByText('$120,00')).toBeTruthy();
    expect(screen.getByText('$165,00')).toBeTruthy();

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
