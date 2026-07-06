import { useNavigation, useRoute } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react-native";

import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuthStore } from "../../../shared/store/authStore";
import { verifyEmail } from "../api/authApi";
import { VerifyEmailScreen } from "../screens/VerifyEmailScreen";

jest.mock("../api/authApi", () => ({
	verifyEmail: jest.fn(),
	getEmailVerificationStatus: jest.fn(),
	resendEmailVerification: jest.fn(),
}));

const mockVerifyEmail = jest.mocked(verifyEmail);

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: Infinity },
			mutations: { retry: false, gcTime: Infinity },
		},
	});
}

function renderScreen(queryClient = createTestQueryClient()) {
	return render(
		<QueryClientProvider client={queryClient}>
			<VerifyEmailScreen />
		</QueryClientProvider>,
	);
}

describe("VerifyEmailScreen", () => {
	const navigationMock = { navigate: jest.fn() };

	beforeEach(() => {
		useAuthStore.getState().clearSession();
		jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { token: "verify-token" } } as ReturnType<
				typeof useRoute
			>);
		mockVerifyEmail.mockReset();
		navigationMock.navigate.mockReset();
	});

	it("shows an invalid-link message and does not verify when token is missing", () => {
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: undefined } as ReturnType<typeof useRoute>);

		renderScreen();

		expect(
			screen.getByText("El enlace de verificación no es válido"),
		).toBeTruthy();
		expect(
			screen.getByText(
				"El enlace puede estar vencido o ya fue usado. Reenviá el email de verificación e intentá nuevamente.",
			),
		).toBeTruthy();
		expect(mockVerifyEmail).not.toHaveBeenCalled();
	});

	it("shows expired-or-consumed token copy and lets the user retry when verification fails", async () => {
		mockVerifyEmail
			.mockRejectedValueOnce(new Error("network error"))
			.mockResolvedValueOnce(undefined);

		renderScreen();

		await waitFor(() => {
			expect(screen.getByText("No pudimos verificar tu email")).toBeTruthy();
		});
		expect(
			screen.getByText(
				"El enlace puede estar vencido o ya fue usado. Reenviá el email de verificación e intentá nuevamente.",
			),
		).toBeTruthy();

		fireEvent.press(screen.getByLabelText("Reintentar verificación de email"));

		await waitFor(() => {
			expect(mockVerifyEmail).toHaveBeenCalledTimes(2);
			expect(navigationMock.navigate).toHaveBeenCalledWith("Main", {
				screen: "GroupsList",
			});
		});
	});

	it("verifies the token, refreshes status state, invalidates status query, and navigates home", async () => {
		const queryClient = createTestQueryClient();
		const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
		mockVerifyEmail.mockResolvedValueOnce(undefined);

		renderScreen(queryClient);

		await waitFor(() => {
			expect(mockVerifyEmail).toHaveBeenCalledWith("verify-token");
		});
		await waitFor(() => {
			expect(useAuthStore.getState().emailVerified).toBe(true);
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: queryKeys.auth.emailVerificationStatus(),
			});
			expect(navigationMock.navigate).toHaveBeenCalledWith("Main", {
				screen: "GroupsList",
			});
		});
	});

	it("resumes a pending group invitation after verifying email", async () => {
		useAuthStore
			.getState()
			.setPendingGroupInvitationToken("pending-invite-token");
		mockVerifyEmail.mockResolvedValueOnce(undefined);

		renderScreen();

		await waitFor(() => {
			expect(navigationMock.navigate).toHaveBeenCalledWith(
				"AcceptGroupInvitation",
				{ token: "pending-invite-token" },
			);
		});
	});
});
