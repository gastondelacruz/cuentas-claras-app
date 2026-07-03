import { act, renderHook, waitFor } from '@testing-library/react-native';

import { prefetchInitialAppData } from '../../../shared/api/prefetchInitialAppData';
import { useAuthStore } from '../../../shared/store/authStore';
import { setRefreshToken } from '../../../shared/api/tokenStorage';
import { useLoginForm } from '../hooks/useLoginForm';
import { useLogin } from '../hooks/useLogin';

jest.mock('../hooks/useLogin');
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));
jest.mock('../../../shared/api/prefetchInitialAppData');
jest.mock('../../../shared/api/tokenStorage', () => ({
  setRefreshToken: jest.fn(async () => undefined),
}));

const mockUseLogin = jest.mocked(useLogin);
const mockSetRefreshToken = jest.mocked(setRefreshToken);
const mockPrefetchInitialAppData = jest.mocked(prefetchInitialAppData);

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().clearSession();
    mockUseLogin.mockReturnValue({
      isPending: false,
      mutate: jest.fn((_variables, options) => {
        void options?.onSuccess?.({
          data: {
            accessToken: 'access-token-1',
            refreshToken: 'refresh-token-1',
            user: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
          },
        } as never);
      }),
    } as never);
  });

  it('starts initial app data prefetch after successful login without delaying the auth session', async () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('ada@example.com');
      result.current.setPassword('Password123!');
    });

    act(() => {
      result.current.handleLogin();
    });

    await waitFor(() => {
      expect(mockSetRefreshToken).toHaveBeenCalledWith('refresh-token-1');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    expect(useAuthStore.getState().accessToken).toBe('access-token-1');
    expect(mockPrefetchInitialAppData).toHaveBeenCalledTimes(1);
  });
});
