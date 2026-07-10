import { PropsWithChildren, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
	configureGoogleAuthFailureReporter,
	GoogleAuthFailureEntry,
} from "../../features/auth/utils/googleAuthTelemetry";
import { queryClient } from "../../shared/api/queryClient";
import { colors } from "../../shared/theme/colors";
import { FontGate } from "./FontGate";

function NativeWindThemeProvider({ children }: PropsWithChildren) {
	return children;
}

function reportGoogleAuthFailure(entry: GoogleAuthFailureEntry): void {
	console.error("[GoogleAuthFailure]", {
		provider: entry.provider,
		...(entry.code ? { code: entry.code } : {}),
		...(typeof entry.status === "number" ? { status: entry.status } : {}),
		...(entry.reason ? { reason: entry.reason } : {}),
		timestamp: entry.timestamp,
	});
}

export function AppProviders({ children }: PropsWithChildren) {
	useEffect(() => {
		configureGoogleAuthFailureReporter(reportGoogleAuthFailure);

		return () => configureGoogleAuthFailureReporter(null);
	}, []);

	return (
		<GestureHandlerRootView
			style={{ flex: 1, backgroundColor: colors.neutral100 }}
		>
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
