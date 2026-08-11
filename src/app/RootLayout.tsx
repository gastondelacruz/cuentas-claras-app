import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { RootNavigator } from "./navigation/RootNavigator";
import { linking } from "./navigation/linking";
import { AppProviders } from "./providers/AppProviders";
import { ErrorBoundary } from "./ErrorBoundary";

export function RootLayout() {
	return (
		<ErrorBoundary>
			<AppProviders>
				<NavigationContainer linking={linking}>
					<RootNavigator />
				</NavigationContainer>
				<StatusBar style="dark" />
				<Toast position="bottom" />
			</AppProviders>
		</ErrorBoundary>
	);
}
