import { useAuthStore } from '../authStore';
import { useSettingsStore } from '../settingsStore';

describe('zustand stores', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    useSettingsStore.setState({ theme: 'light', language: 'es' });
  });

  it('starts unauthenticated and updates session state', () => {
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null, isAuthenticated: false });

    useAuthStore.getState().setSession({ id: '1', email: 'a@b.com' }, 'tok-abc');
    expect(useAuthStore.getState()).toMatchObject({
      user: { id: '1', email: 'a@b.com' },
      accessToken: 'tok-abc',
      isAuthenticated: true,
    });

    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null, isAuthenticated: false });
  });

  it('updates settings store state', () => {
    expect(useSettingsStore.getState()).toMatchObject({ theme: 'light', language: 'es' });

    useSettingsStore.getState().setTheme('dark');
    useSettingsStore.getState().setLanguage('en');

    expect(useSettingsStore.getState()).toMatchObject({ theme: 'dark', language: 'en' });
  });
});
