import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { getEmailVerificationStatus } from "../../auth/api/authApi";
import { useAuthStore } from "../../../shared/store/authStore";
import { useProfileData } from "../hooks/useProfileData";

jest.mock("../../auth/api/authApi", () => ({
	getEmailVerificationStatus: jest.fn(),
}));

const mockedGetEmailVerificationStatus = jest.mocked(
	getEmailVerificationStatus,
);

describe("useProfileData", () => {
	let testClient: QueryClient;
	let unmount: (() => void) | undefined;
	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
		);
	}

	function renderProfileData() {
		const rendered = renderHook(() => useProfileData(), { wrapper: Wrapper });
		unmount = rendered.unmount;
		return rendered;
	}

	beforeEach(() => {
		jest.clearAllMocks();
		useAuthStore.getState().clearSession();
		useAuthStore
			.getState()
			.setSession({ id: "current-user", email: "you@example.com" }, "tok");
		testClient = new QueryClient({
			defaultOptions: { queries: { retry: false, gcTime: 0 } },
		});
		mockedGetEmailVerificationStatus.mockResolvedValue({
			verified: true,
			verifiedAt: null,
		});
	});

	afterEach(async () => {
		unmount?.();
		await testClient.cancelQueries();
		testClient.clear();
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
	});

	it("uses the authenticated user from authStore and the verification endpoint for status", async () => {
		useAuthStore
			.getState()
			.setSession({ id: "u1", email: "alex@example.com" }, "tok");

		const { result } = renderProfileData();

		await waitFor(() => expect(result.current.user.status).toBe("Verificado"));
		expect(mockedGetEmailVerificationStatus).toHaveBeenCalledTimes(1);
		expect(result.current.user).toMatchObject({
			email: "alex@example.com",
			status: "Verificado",
			statusTone: "success",
			statusAccessibilityLabel: "Email verificado",
		});
	});

	it("shows an unverified status when the verification endpoint says the email is not verified", async () => {
		mockedGetEmailVerificationStatus.mockResolvedValueOnce({
			verified: false,
			verifiedAt: null,
		});
		useAuthStore
			.getState()
			.setSession({ id: "u1", email: "alex@example.com" }, "tok");

		const { result } = renderProfileData();

		await waitFor(() =>
			expect(result.current.user.status).toBe("No verificado"),
		);
		expect(result.current.user).toMatchObject({
			status: "No verificado",
			statusTone: "danger",
			statusAccessibilityLabel: "Email no verificado",
		});
	});

	it("uses the authenticated user name and initials when available", async () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", name: "Ana López", email: "ana@example.com" },
				"tok",
			);

		const { result } = renderProfileData();

		await waitFor(() => expect(result.current.user.status).toBe("Verificado"));
		expect(result.current.user).toMatchObject({
			name: "Ana López",
			email: "ana@example.com",
			initials: "AL",
		});
	});

	it("falls back to the authenticated email as display name", async () => {
		useAuthStore
			.getState()
			.setSession({ id: "u1", email: "alex@example.com" }, "tok");

		const { result } = renderProfileData();

		await waitFor(() => expect(result.current.user.status).toBe("Verificado"));
		expect(result.current.user.name).toBe("alex@example.com");
		expect(result.current.user.initials).toBe("A");
	});

	it("falls back to a generic user when there is no authenticated user", () => {
		useAuthStore.getState().clearSession();

		const { result } = renderProfileData();

		expect(result.current.user).toMatchObject({
			name: "Usuario",
			email: "",
			initials: "U",
			status: "No verificado",
			statusTone: "danger",
		});
	});
});
