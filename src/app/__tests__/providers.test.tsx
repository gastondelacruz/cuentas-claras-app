import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { useQueryClient } from '@tanstack/react-query';

import { AppProviders } from '../providers/AppProviders';
import { queryClient } from '../../shared/api/queryClient';
import { useAuthStore } from '../../shared/store/authStore';

function QueryClientProbe() {
  const client = useQueryClient();

  return <Text>{client === queryClient ? 'query-client-ready' : 'query-client-missing'}</Text>;
}

function AuthStoreProbe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return <Text>{isAuthenticated ? 'authenticated' : 'unauthenticated'}</Text>;
}

describe('AppProviders', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('mounts children and provides QueryClient/Auth store access', () => {
    const { getByTestId, getByText } = render(
      <AppProviders>
        <View testID="child" />
        <QueryClientProbe />
        <AuthStoreProbe />
      </AppProviders>,
    );

    expect(getByTestId('child')).toBeOnTheScreen();
    expect(getByText('query-client-ready')).toBeOnTheScreen();
    expect(getByText('unauthenticated')).toBeOnTheScreen();
  });

  it('throws a missing QueryClient context error outside AppProviders', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<QueryClientProbe />)).toThrow(/No QueryClient set/);

    consoleError.mockRestore();
  });
});
