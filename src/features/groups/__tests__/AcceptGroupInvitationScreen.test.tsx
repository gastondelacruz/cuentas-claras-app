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
import { acceptGroupInvitation } from "../api/groupsApi";
import { AcceptGroupInvitationScreen } from "../screens/AcceptGroupInvitationScreen";

jest.mock("../api/groupsApi", () => ({
	acceptGroupInvitation: jest.fn(),
}));

const mockAcceptGroupInvitation = jest.mocked(acceptGroupInvitation);

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
			<AcceptGroupInvitationScreen />
		</QueryClientProvider>,
	);
}

describe("AcceptGroupInvitationScreen", () => {
	const navigationMock = { navigate: jest.fn() };

	beforeEach(() => {
		useAuthStore.getState().clearSession();
		jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { token: "invite-token" } } as ReturnType<
				typeof useRoute
			>);
		mockAcceptGroupInvitation.mockReset();
		navigationMock.navigate.mockReset();
	});

	it("shows invalid invitation copy and does not accept when token is missing", () => {
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: undefined } as ReturnType<typeof useRoute>);

		renderScreen();

		expect(screen.getByText("La invitación no es válida")).toBeTruthy();
		expect(
			screen.getByText(
				"El enlace puede estar vencido o ya fue usado. Pedí una nueva invitación.",
			),
		).toBeTruthy();
		expect(mockAcceptGroupInvitation).not.toHaveBeenCalled();
	});

	it("preserves the invitation token and redirects unauthenticated users to login", async () => {
		renderScreen();

		await waitFor(() => {
			expect(useAuthStore.getState().pendingGroupInvitationToken).toBe(
				"invite-token",
			);
			expect(navigationMock.navigate).toHaveBeenCalledWith("Auth", {
				initialTab: "login",
			});
		});
		expect(mockAcceptGroupInvitation).not.toHaveBeenCalled();
	});

	it("blocks accepting invitations and preserves the token until the authenticated user verifies email", () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "1", email: "you@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);

		renderScreen();

		expect(
			screen.getByText("Verificá tu email para aceptar la invitación"),
		).toBeTruthy();
		expect(
			screen.getByText(
				"No vamos a aceptar la invitación hasta que completes la verificación.",
			),
		).toBeTruthy();
		expect(useAuthStore.getState().pendingGroupInvitationToken).toBe(
			"invite-token",
		);
		expect(mockAcceptGroupInvitation).not.toHaveBeenCalled();
	});

	it("shows expired-or-consumed invitation copy and lets the user retry when accepting fails", async () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "1", email: "you@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
			);
		mockAcceptGroupInvitation
			.mockRejectedValueOnce(new Error("network error"))
			.mockResolvedValueOnce(undefined);

		renderScreen();

		await waitFor(() => {
			expect(screen.getByText("No pudimos aceptar la invitación")).toBeTruthy();
		});
		expect(
			screen.getByText(
				"El enlace puede estar vencido o ya fue usado. Pedí una nueva invitación.",
			),
		).toBeTruthy();

		fireEvent.press(
			screen.getByLabelText("Reintentar aceptación de invitación"),
		);

		await waitFor(() => {
			expect(mockAcceptGroupInvitation).toHaveBeenCalledTimes(2);
			expect(navigationMock.navigate).toHaveBeenCalledWith("Main", {
				screen: "GroupsList",
			});
		});
	});

	it("accepts valid invitations, clears the preserved token, invalidates groups, and navigates home", async () => {
		const queryClient = createTestQueryClient();
		const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
		useAuthStore.getState().setPendingGroupInvitationToken("invite-token");
		useAuthStore
			.getState()
			.setSession(
				{ id: "1", email: "you@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
			);
		mockAcceptGroupInvitation.mockResolvedValueOnce(undefined);

		renderScreen(queryClient);

		await waitFor(() => {
			expect(mockAcceptGroupInvitation).toHaveBeenCalledWith("invite-token");
		});
		await waitFor(() => {
			expect(useAuthStore.getState().pendingGroupInvitationToken).toBeNull();
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: queryKeys.groups.all(),
			});
			expect(navigationMock.navigate).toHaveBeenCalledWith("Main", {
				screen: "GroupsList",
			});
		});
	});
});
