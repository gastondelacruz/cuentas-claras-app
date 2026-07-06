import { useAuthStore } from '../authStore';
import { useSettingsStore } from '../settingsStore';

describe('zustand stores', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    useSettingsStore.setState({ theme: 'light', language: 'es' });
  });

  it('starts unauthenticated and updates session state', () => {
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null, isAuthenticated: false, emailVerified: false });

    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok-abc');
    expect(useAuthStore.getState()).toMatchObject({
      user: { id: '1', email: 'a@b.com' },
      accessToken: 'tok-abc',
      isAuthenticated: true,
      emailVerified: false,
    });

    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null, isAuthenticated: false, emailVerified: false });
  });

  it('derives email verification from JWT claims when setting a session', () => {
    const payload = btoa(JSON.stringify({ emailVerified: true }));
    const token = `header.${payload}.signature`;

    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, token);

    expect(useAuthStore.getState()).toMatchObject({ emailVerified: true });
  });

  it('allows the email verification status to be refreshed without replacing the session', () => {
    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok-abc');

    useAuthStore.getState().setEmailVerification({ verified: true, verifiedAt: '2026-07-05T10:00:00.000Z' });

    expect(useAuthStore.getState()).toMatchObject({
      user: { id: '1', email: 'a@b.com' },
      accessToken: 'tok-abc',
      isAuthenticated: true,
      emailVerified: true,
      emailVerifiedAt: '2026-07-05T10:00:00.000Z',
    });
  });

  it('updates settings store state', () => {
    expect(useSettingsStore.getState()).toMatchObject({ theme: 'light', language: 'es' });

    useSettingsStore.getState().setTheme('dark');
    useSettingsStore.getState().setLanguage('en');

    expect(useSettingsStore.getState()).toMatchObject({ theme: 'dark', language: 'en' });
  });
});
