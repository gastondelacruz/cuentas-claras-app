import { fireEvent, render, screen, act, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';

import { useAuthStore } from '../../../../shared/store/authStore';
import { setRefreshToken } from '../../../../shared/api/tokenStorage';
import { useLogin } from '../../hooks/useLogin';
import { AuthScreen } from '../AuthScreen';

jest.mock('../../../../shared/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../../shared/api/tokenStorage', () => ({
  setRefreshToken: jest.fn(),
}));

jest.mock('../../hooks/useLogin', () => ({
  useLogin: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedUseLogin = jest.mocked(useLogin);
const mockedToast = jest.mocked(Toast);
const mockedSetRefreshToken = jest.mocked(setRefreshToken);
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
  mockedUseLogin.mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  } as never);
});

describe('AuthScreen', () => {
  // --- Existing tests (preserved) ---

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

  it('register submit button calls setSession', () => {
    renderAuth('register');
    fireEvent.press(screen.getByTestId('register-button'));
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'mock-user', name: 'Mock User' }),
      'mock-token',
    );
  });

  // --- New validation tests (login tab) ---

  it('pressing login button with empty email shows email validation error and email label turns red', async () => {
    renderAuth('login');
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });
    expect(screen.getByText('Ingresá un email válido')).toBeTruthy();
    const emailLabel = screen.getByTestId('email-label');
    expect(emailLabel.props.className).toContain('text-red-600');
  });

  it('pressing login button with invalid email shows email validation error', async () => {
    renderAuth('login');
    fireEvent.changeText(screen.getByPlaceholderText('juan@ejemplo.com'), 'notanemail');
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });
    expect(screen.getByText('Ingresá un email válido')).toBeTruthy();
  });

  it('pressing login button with valid email but short password shows password error and password label turns red', async () => {
    renderAuth('login');
    fireEvent.changeText(screen.getByPlaceholderText('juan@ejemplo.com'), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'short');
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeTruthy();
    const passwordLabel = screen.getByTestId('password-label');
    expect(passwordLabel.props.className).toContain('text-red-600');
  });

  it('pressing login button with valid credentials calls useLogin mutate', async () => {
    const mockMutate = jest.fn();
    mockedUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as never);

    renderAuth('login');
    fireEvent.changeText(screen.getByPlaceholderText('juan@ejemplo.com'), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'validpassword');
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });
    expect(mockMutate).toHaveBeenCalledWith(
      { email: 'user@example.com', password: 'validpassword' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it('when useLogin mutation succeeds, setSession is called with user data and tokens are stored', async () => {
    let onSuccessCallback: ((response: { data: { accessToken: string; refreshToken: string; user: { id: string; name: string; email: string } } }) => void) | undefined;
    const mockMutate = jest.fn((_vars, options) => {
      onSuccessCallback = options?.onSuccess;
    });
    mockedUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as never);
    mockedSetRefreshToken.mockResolvedValue();

    renderAuth('login');
    fireEvent.changeText(screen.getByPlaceholderText('juan@ejemplo.com'), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'validpassword');
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });

    // Simulate mutation success with real API response structure
    const mockResponse = {
      data: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'user@example.com',
        },
      },
    };
    await act(async () => {
      await onSuccessCallback?.(mockResponse);
    });

    expect(mockedSetRefreshToken).toHaveBeenCalledWith('test-refresh-token');
    expect(setSession).toHaveBeenCalledWith(
      { id: 'user-123', name: 'Test User', email: 'user@example.com' },
      'test-access-token',
    );
  });

  it('when useLogin mutation fails, shows error toast and does NOT call setSession', async () => {
    let onErrorCallback: ((error: Error) => void) | undefined;
    const mockMutate = jest.fn((_vars, options) => {
      onErrorCallback = options?.onError;
    });
    mockedUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as never);

    renderAuth('login');
    fireEvent.changeText(screen.getByPlaceholderText('juan@ejemplo.com'), 'user@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'validpassword');
    await act(async () => {
      fireEvent.press(screen.getByTestId('login-button'));
    });

    // Simulate mutation error
    const mockError = new Error('Credenciales inválidas. Verificá tu email y contraseña.');
    act(() => {
      onErrorCallback?.(mockError);
    });

    expect(mockedToast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        text1: 'Error al iniciar sesión',
        text2: 'Verificá tus credenciales',
      }),
    );
    expect(setSession).not.toHaveBeenCalled();
  });
});
