import { fireEvent, render, screen } from '@testing-library/react-native';

import { useAuthStore } from '../../../../shared/store/authStore';
import { AuthScreen } from '../AuthScreen';

jest.mock('../../../../shared/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockedUseAuthStore = jest.mocked(useAuthStore);
const setSession = jest.fn();

function renderAuth(initialTab?: 'login' | 'register') {
  const route = { params: initialTab ? { initialTab } : undefined } as never;
  const navigation = {} as never;
  return render(<AuthScreen route={route} navigation={navigation} />);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseAuthStore.mockImplementation((selector) =>
    (selector as (s: unknown) => unknown)({ setSession }) as never,
  );
});

describe('AuthScreen', () => {
  it('renders without crashing', () => {
    renderAuth();
  });

  it('shows "Iniciar Sesión" heading when initialTab="login" (default)', () => {
    renderAuth('login');
    expect(screen.getAllByText('Iniciar Sesión').length).toBeGreaterThan(0);
  });

  it('shows "Crear Cuenta" heading when initialTab="register"', () => {
    renderAuth('register');
    expect(screen.getByText('Crear Cuenta')).toBeTruthy();
  });

  it('tapping "Registrarse" tab shows "Crear Cuenta" heading', () => {
    renderAuth('login');
    fireEvent.press(screen.getByText('Registrarse'));
    expect(screen.getByText('Crear Cuenta')).toBeTruthy();
  });

  it('tapping "Entrar" tab shows "Iniciar Sesión" heading', () => {
    renderAuth('register');
    fireEvent.press(screen.getByText('Entrar'));
    expect(screen.getAllByText('Iniciar Sesión').length).toBeGreaterThan(0);
  });

  it('login submit button calls setSession', () => {
    renderAuth('login');
    fireEvent.press(screen.getByTestId('login-button'));
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'mock-user' }),
      'mock-token',
    );
  });

  it('register submit button calls setSession', () => {
    renderAuth('register');
    fireEvent.press(screen.getByTestId('register-button'));
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'mock-user' }),
      'mock-token',
    );
  });
});
