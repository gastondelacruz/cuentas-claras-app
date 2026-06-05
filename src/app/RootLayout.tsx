import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';
import { ErrorBoundary } from './ErrorBoundary';

export function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
      </AppProviders>
    </ErrorBoundary>
  );
}
