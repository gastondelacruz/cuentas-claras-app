import {
  createNavigationContainerRef,
  NavigationContainer,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '../navigation/RootNavigator';
import { registeredRouteNames, RootStackParamList } from '../navigation/types';
import { useExpensesStore } from '../../features/expenses/store/expensesStore';
import { useGroupsStore } from '../../features/groups/store/groupsStore';
import type { GroupExpense } from '../../features/groups/types';
import { useAuthStore } from '../../shared/store/authStore';

jest.mock('../../features/auth/hooks/useLogin', () => ({
  useLogin: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

jest.mock('../../features/auth/hooks/useRegister', () => ({
  useRegister: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: jest.fn(),
  },
}));

const actualNavigation = jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native');

const mainTabLabels = ['Inicio', 'Grupos', 'Perfil'] as const;

function createGroup(name: string, invitedEmails: string[]) {
  return useGroupsStore.getState().createGroup({
    name,
    category: 'TRAVEL',
    image: { type: 'default', uri: null },
    invitedEmails,
    owner: {
      id: '1',
      name: 'Vos',
      email: 'a@b.com',
      initials: 'YO',
      avatarUrl: null,
    },
  });
}

function addExpense(groupId: string, expense: GroupExpense) {
  useExpensesStore.getState().addExpense(groupId, expense);
}

describe('navigation shell', () => {
  let groupId: string;

  beforeEach(() => {
    useAuthStore.getState().clearSession();
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    groupId = createGroup('Viaje a la costa', ['alex@example.com', 'sarah@example.com']).id;
    addExpense(groupId, {
      id: 'nav-expense-1',
      title: 'Cena frente al mar',
      paidByLabel: 'Pagado por mí',
      timeLabel: 'Hoy',
      totalAmount: 120,
      category: 'FOOD',
      userRelation: { type: 'lent', amount: 60 },
      paidById: '1',
      participantIds: ['1', 'invite-0-alex@example.com', 'invite-1-sarah@example.com'],
      date: '2024-05-21T12:00:00.000Z',
    });
    jest.mocked(useNavigation).mockImplementation(actualNavigation.useNavigation as never);
    jest.mocked(useRoute).mockImplementation(actualNavigation.useRoute as never);
  });

  it('registers all route names expected by the bootstrap spec', () => {
    expect(registeredRouteNames).toEqual([
      'Onboarding',
      'Auth',
      'Home',
      'GroupsList',
      'GroupDetail',
      'NewGroup',
      'AddExpense',
      'SettleDebts',
      'Profile',
    ]);
  });

  it('renders auth stack while unauthenticated', async () => {
    const navigationRef = createNavigationContainerRef<RootStackParamList>();
    const { findAllByText, findByText } = render(
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect((await findAllByText('Iniciar Sesión')).length).toBeGreaterThan(0);

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    act(() => {
      navigationRef.navigate('Auth', { initialTab: 'register' });
    });
    expect(await findByText('Crear Cuenta')).toBeOnTheScreen();
  });

  it('renders main tabs while authenticated', async () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok-abc');

    const { findByText, getAllByText, getByLabelText, getByText, queryByText } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect(await findByText('Cuentas Claras')).toBeOnTheScreen();
    expect(await findByText('Te deben')).toBeOnTheScreen();
    expect(queryByText('HomeScreen')).toBeNull();

    for (const tabLabel of mainTabLabels) {
      expect(getAllByText(tabLabel).length).toBeGreaterThan(0);
    }

    expect(queryByText('Saldos')).toBeNull();

    fireEvent.press(getByText('Grupos'));
    expect(await findByText('Balance Neto Total')).toBeOnTheScreen();

    fireEvent.press(getByLabelText('Abrir menú de creación'));
    expect(await findByText('Crear nuevo gasto')).toBeOnTheScreen();

    fireEvent.press(getByText('Perfil'));
    expect(await findByText('Alex Thompson')).toBeOnTheScreen();
    expect(await findByText('Gasto Total')).toBeOnTheScreen();
  });

  it('navigates to registered stack screens and switches stacks when auth state changes', async () => {
    const navigationRef = createNavigationContainerRef<RootStackParamList>();
    const { findByText, findAllByText, queryByText } = render(
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect((await findAllByText('Iniciar Sesión')).length).toBeGreaterThan(0);

    act(() => {
      useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok-abc');
    });

    expect(await findByText('Cuentas Claras')).toBeOnTheScreen();
    expect(queryByText('Iniciar Sesión')).toBeNull();
    expect(queryByText('HomeScreen')).toBeNull();

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    act(() => {
      navigationRef.navigate('GroupDetail', { groupId });
    });

    expect(await findByText('Viaje a la costa')).toBeOnTheScreen();

    act(() => {
      navigationRef.navigate('AddExpense');
    });

    expect(await findByText('Crear gasto')).toBeOnTheScreen();

    act(() => {
      useAuthStore.getState().clearSession();
    });

    expect((await findAllByText('Iniciar Sesión')).length).toBeGreaterThan(0);
    expect(queryByText('Viaje a la costa')).toBeNull();
  });
});
