import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '../navigation/RootNavigator';
import { registeredRouteNames, RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../../shared/store/authStore';

const mainTabRoutes = ['Inicio', 'ListadoGrupos', 'AgregarGasto', 'Perfil'] as const;

describe('navigation shell', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('registers all route names expected by the bootstrap spec', () => {
    expect(registeredRouteNames).toEqual([
      'Onboarding',
      'Login',
      'Registrarse',
      'Inicio',
      'ListadoGrupos',
      'DetalleGrupo',
      'NuevoGrupo',
      'AgregarGasto',
      'LiquidarDeudas',
      'Perfil',
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
      navigationRef.navigate('Registrarse');
    });
    expect(await findByText('RegistrarseScreen')).toBeOnTheScreen();
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

    expect(mainTabRoutes).toHaveLength(4);

    for (const tabName of mainTabRoutes) {
      expect(getAllByText(tabName).length).toBeGreaterThan(0);
    }

    fireEvent.press(getByText('ListadoGrupos'));
    expect(await findByText('ListadoGruposScreen')).toBeOnTheScreen();

    fireEvent.press(getAllByText('AgregarGasto').at(-1)!);
    expect(await findByText('AgregarGastoScreen')).toBeOnTheScreen();

    fireEvent.press(getByText('Perfil'));
    expect(await findByText('PerfilScreen')).toBeOnTheScreen();
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
      navigationRef.navigate('DetalleGrupo', { groupId: 'group-1' });
    });

    expect(await findByText('DetalleGrupoScreen')).toBeOnTheScreen();

    act(() => {
      useAuthStore.getState().clearSession();
    });

    expect(await findByText('OnboardingScreen')).toBeOnTheScreen();
    expect(queryByText('DetalleGrupoScreen')).toBeNull();
  });
});
