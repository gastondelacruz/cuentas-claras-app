import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { useAuthStore } from '../../../shared/store/authStore';
import { LoginScreen } from '../screens/LoginScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

const mockedUseNavigation = jest.mocked(useNavigation);
const navigate = jest.fn();

describe('LoginScreen', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    jest.clearAllMocks();
    mockedUseNavigation.mockReturnValue({ navigate } as never);
  });

  it('renders without crashing', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Bienvenido de nuevo')).toBeTruthy();
  });

  it('renders login form elements', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Correo Electrónico')).toBeTruthy();
    expect(screen.getByText('Contraseña')).toBeTruthy();
    expect(screen.getByText('Iniciar Sesión')).toBeTruthy();
  });

  it('toggles password visibility', () => {
    render(<LoginScreen />);
    expect(screen.getByText('👁')).toBeTruthy();
    fireEvent.press(screen.getByText('👁'));
    expect(screen.getByText('🙈')).toBeTruthy();
  });

  it('Iniciar Sesión calls setSession', () => {
    const setSessionSpy = jest.spyOn(useAuthStore.getState(), 'setSession');

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('juan@ejemplo.com');
    fireEvent.changeText(emailInput, 'test@test.com');
    fireEvent.press(screen.getByText('Iniciar Sesión'));

    expect(setSessionSpy).toHaveBeenCalledWith(
      { id: 'mock-user', email: 'test@test.com' },
      'mock-token',
    );
  });

  it('Registrarse tab navigates to Register', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Registrarse'));
    expect(navigate).toHaveBeenCalledWith('Register');
  });
});
