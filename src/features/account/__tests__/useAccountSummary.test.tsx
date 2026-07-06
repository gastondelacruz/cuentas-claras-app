import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useAuthStore } from "../../../shared/store/authStore";
import { getAccountSummary } from "../api/accountSummaryApi";
import { useAccountSummary } from "../hooks/useAccountSummary";

jest.mock("../api/accountSummaryApi", () => ({
	getAccountSummary: jest.fn(),
}));

const mockedGetAccountSummary = jest.mocked(getAccountSummary);

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: Infinity },
			mutations: { retry: false, gcTime: Infinity },
		},
	});
}

describe("useAccountSummary", () => {
	let testClient: QueryClient;

	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
		);
	}

	beforeEach(() => {
		jest.clearAllMocks();
		useAuthStore.getState().clearSession();
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "verified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
			);
		testClient = createTestQueryClient();
		mockedGetAccountSummary.mockResolvedValue({
			totalGroups: 12,
			totalExpenses: 2,
			totalsByCurrency: [
				{
					currency: "ARS",
					totalPaid: 57660,
					totalOwed: 1200,
					totalToReceive: 28830,
				},
			],
			activeSince: "2026-06-27T12:15:29.827Z",
		});
	});

	afterEach(() => {
		testClient.clear();
	});

	it("does not fetch the protected account summary while email is not verified", () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "unverified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);

		const { result } = renderHook(() => useAccountSummary(), {
			wrapper: Wrapper,
		});

		expect(result.current.fetchStatus).toBe("idle");
		expect(mockedGetAccountSummary).not.toHaveBeenCalled();
	});

	it("uses the stable account summary query key and fetcher", async () => {
		const { result } = renderHook(() => useAccountSummary(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockedGetAccountSummary).toHaveBeenCalledTimes(1);
		expect(testClient.getQueryData(["account", "summary"])).toEqual(
			expect.objectContaining({ totalGroups: 12 }),
		);
	});

	it("does not crash when activeSince is null", async () => {
		mockedGetAccountSummary.mockResolvedValue({
			totalGroups: 12,
			totalExpenses: 2,
			totalsByCurrency: [
				{
					currency: "ARS",
					totalPaid: 57660,
					totalOwed: 1200,
					totalToReceive: 28830,
				},
			],
			activeSince: null,
		});

		const { result } = renderHook(() => useAccountSummary(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data?.activeSince).toBeNull();
	});
});
