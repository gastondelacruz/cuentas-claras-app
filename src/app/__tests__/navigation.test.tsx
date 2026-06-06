import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '../navigation/RootNavigator';
import { registeredRouteNames, RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../../shared/store/authStore';

const mainTabLabels = ['Inicio', 'Grupos', 'Agregar', 'Perfil'] as const;

describe('navigation shell', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('registers all route names expected by the bootstrap spec', () => {
    expect(registeredRouteNames).toEqual([
      'Onboarding',
      'Login',
      'Register',
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
    const { findByText } = render(
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect(await findByText('OnboardingScreen')).toBeOnTheScreen();

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    act(() => {
      navigationRef.navigate('Login');
    });
    expect(await findByText('LoginScreen')).toBeOnTheScreen();

    act(() => {
      navigationRef.navigate('Register');
    });
    expect(await findByText('RegisterScreen')).toBeOnTheScreen();
  });

  it('renders main tabs while authenticated', async () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok-abc');

    const { findByText, getAllByText, getByText, queryByText } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect(await findByText('Cuentas Claras')).toBeOnTheScreen();
    expect(await findByText('Te deben')).toBeOnTheScreen();
    expect(queryByText('HomeScreen')).toBeNull();

    expect(mainTabLabels).toHaveLength(4);

    for (const tabLabel of mainTabLabels) {
      expect(getAllByText(tabLabel).length).toBeGreaterThan(0);
    }

    fireEvent.press(getByText('Grupos'));
    expect(await findByText('GroupsListScreen')).toBeOnTheScreen();

    fireEvent.press(getAllByText('Agregar').at(-1)!);
    expect(await findByText('AddExpenseScreen')).toBeOnTheScreen();

    fireEvent.press(getByText('Perfil'));
    expect(await findByText('ProfileScreen')).toBeOnTheScreen();
  });

  it('navigates to registered stack screens and switches stacks when auth state changes', async () => {
    const navigationRef = createNavigationContainerRef<RootStackParamList>();
    const { findByText, queryByText } = render(
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect(await findByText('OnboardingScreen')).toBeOnTheScreen();

    act(() => {
      useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok-abc');
    });

    expect(await findByText('Cuentas Claras')).toBeOnTheScreen();
    expect(queryByText('OnboardingScreen')).toBeNull();
    expect(queryByText('HomeScreen')).toBeNull();

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    act(() => {
      navigationRef.navigate('GroupDetail', { groupId: 'group-1' });
    });

    expect(await findByText('GroupDetailScreen')).toBeOnTheScreen();

    act(() => {
      useAuthStore.getState().clearSession();
    });

    expect(await findByText('OnboardingScreen')).toBeOnTheScreen();
    expect(queryByText('GroupDetailScreen')).toBeNull();
  });
});
