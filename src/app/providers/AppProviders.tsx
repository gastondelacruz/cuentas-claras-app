import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '../../shared/api/queryClient';
import { colors } from '../../shared/theme/colors';
import { FontGate } from './FontGate';

function NativeWindThemeProvider({ children }: PropsWithChildren) {
  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.neutral100 }}>
      <SafeAreaProvider>
        <FontGate>
          <QueryClientProvider client={queryClient}>
            <NativeWindThemeProvider>{children}</NativeWindThemeProvider>
          </QueryClientProvider>
        </FontGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
