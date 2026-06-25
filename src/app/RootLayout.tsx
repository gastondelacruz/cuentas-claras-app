import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { RootNavigator } from "./navigation/RootNavigator";
import { AppProviders } from "./providers/AppProviders";
import { ErrorBoundary } from "./ErrorBoundary";

export function RootLayout() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
        <Toast position="bottom" />
      </AppProviders>
    </ErrorBoundary>
  );
}
