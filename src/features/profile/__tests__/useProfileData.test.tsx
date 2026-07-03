import { renderHook } from '@testing-library/react-native';

import { useAuthStore } from '../../../shared/store/authStore';
import { useProfileData } from '../hooks/useProfileData';

describe('useProfileData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'tok');
  });

  it('uses the authenticated user from authStore', () => {
    useAuthStore.getState().setSession({ id: 'u1', email: 'alex@example.com' }, 'tok');

    const { result } = renderHook(() => useProfileData());

    expect(result.current.user).toMatchObject({
      email: 'alex@example.com',
      status: 'Verificado',
    });
  });

  it('uses the authenticated user name and initials when available', () => {
    useAuthStore.getState().setSession({ id: 'u1', name: 'Ana López', email: 'ana@example.com' }, 'tok');

    const { result } = renderHook(() => useProfileData());

    expect(result.current.user).toMatchObject({
      name: 'Ana López',
      email: 'ana@example.com',
      initials: 'AL',
    });
  });

  it('falls back to the authenticated email as display name', () => {
    useAuthStore.getState().setSession({ id: 'u1', email: 'alex@example.com' }, 'tok');

    const { result } = renderHook(() => useProfileData());

    expect(result.current.user.name).toBe('alex@example.com');
    expect(result.current.user.initials).toBe('A');
  });

  it('falls back to a generic user when there is no authenticated user', () => {
    useAuthStore.getState().clearSession();

    const { result } = renderHook(() => useProfileData());

    expect(result.current.user).toMatchObject({
      name: 'Usuario',
      email: '',
      initials: 'U',
      status: 'Verificado',
    });
  });
});
