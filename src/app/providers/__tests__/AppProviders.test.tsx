import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { configureGoogleAuthFailureReporter } from "../../../features/auth/utils/googleAuthTelemetry";
import { AppProviders } from "../AppProviders";

jest.mock("../../../features/auth/utils/googleAuthTelemetry", () => ({
	configureGoogleAuthFailureReporter: jest.fn(),
}));

jest.mock("react-native-gesture-handler", () => ({
	GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
	SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../FontGate", () => ({
	FontGate: ({ children }: { children: React.ReactNode }) => children,
}));

const mockConfigureGoogleAuthFailureReporter = jest.mocked(
	configureGoogleAuthFailureReporter,
);

describe("AppProviders", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("configures an operator-visible allowlisted Google auth failure reporter", async () => {
		const consoleErrorSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		render(
			<AppProviders>
				<Text>App</Text>
			</AppProviders>,
		);

		expect(mockConfigureGoogleAuthFailureReporter).toHaveBeenCalledWith(
			expect.any(Function),
		);
		const reporter = mockConfigureGoogleAuthFailureReporter.mock.calls[0][0];
		await reporter?.({
			provider: "google",
			code: "INVALID_GOOGLE_TOKEN",
			status: 401,
			reason: "INVALID_GOOGLE_TOKEN",
			timestamp: "2026-07-10T00:00:00.000Z",
		});

		expect(consoleErrorSpy).toHaveBeenCalledWith("[GoogleAuthFailure]", {
			provider: "google",
			code: "INVALID_GOOGLE_TOKEN",
			status: 401,
			reason: "INVALID_GOOGLE_TOKEN",
			timestamp: "2026-07-10T00:00:00.000Z",
		});
		consoleErrorSpy.mockRestore();
	});
});
