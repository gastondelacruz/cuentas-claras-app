import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { useLogout } from '../useLogout';
import { logoutUser } from '../../api/authApi';
import { queryClient } from '../../../../shared/api/queryClient';
import { useAuthStore } from '../../../../shared/store/authStore';

jest.mock('../../api/authApi', () => ({
  logoutUser: jest.fn(),
}));

const mockLogoutUser = jest.mocked(logoutUser);

describe('useLogout', () => {
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.clearAllMocks();
    queryClient.clear();
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok');
  });

  afterEach(() => {
    queryClient.clear();
    jest.useRealTimers();
  });

  it('clears local auth state while the logout request is still pending', async () => {
    let resolveLogout: (() => void) | undefined;
    mockLogoutUser.mockImplementationOnce(
      () => new Promise<void>((resolve) => {
        resolveLogout = resolve;
      }),
    );

    const { result, unmount } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();
    await waitFor(() => expect(mockLogoutUser).toHaveBeenCalledTimes(1));

    expect(result.current.isPending).toBe(true);
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    resolveLogout?.();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    unmount();
  });

  it('calls POST /auth/logout, clears the session, and resets the query cache', async () => {
    mockLogoutUser.mockResolvedValueOnce(undefined);
    const clearSpy = jest.spyOn(queryClient, 'clear');

    const { result, unmount } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockLogoutUser).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    expect(clearSpy).toHaveBeenCalledTimes(1);

    clearSpy.mockRestore();
    unmount();
  });

  it('still clears the session and cache when the logout request fails', async () => {
    mockLogoutUser.mockRejectedValueOnce(new Error('Network error'));
    const clearSpy = jest.spyOn(queryClient, 'clear');

    const { result, unmount } = renderHook(() => useLogout(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    expect(clearSpy).toHaveBeenCalledTimes(1);

    clearSpy.mockRestore();
    unmount();
  });
});
