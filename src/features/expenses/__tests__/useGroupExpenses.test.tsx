import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { PropsWithChildren } from "react";

import { useAuthStore } from "../../../shared/store/authStore";
import { getGroupExpenses } from "../api/expensesApi";
import { useGroupExpenses } from "../hooks/useGroupExpenses";

jest.mock("../api/expensesApi", () => ({
	getGroupExpenses: jest.fn(),
}));

const mockGetGroupExpenses = jest.mocked(getGroupExpenses);

// Fixtures using real backend list item shape
const expensePageOne = {
	expenses: [
		{
			id: "e1",
			title: "Cena",
			amount: 120.5,
			currency: "ARS",
			paidBy: { id: "m1", displayName: "Vos" },
			participantsCount: 2,
			expenseDate: "2024-05-20T00:00:00.000Z",
		},
	],
	nextCursor: "cursor-1",
};

const expensePageTwo = {
	expenses: [
		{
			id: "e2",
			title: "Taxi",
			amount: 45,
			currency: "ARS",
			paidBy: { id: "m2", displayName: "Ana" },
			participantsCount: 1,
			expenseDate: "2024-05-21T00:00:00.000Z",
		},
	],
	nextCursor: null,
};

describe("useGroupExpenses", () => {
	let testClient: QueryClient;

	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
		);
	}

	beforeEach(() => {
		jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
		jest.clearAllMocks();
		useAuthStore
			.getState()
			.setSession({ id: "current-user", email: "you@example.com" }, "token");
		useAuthStore
			.getState()
			.setEmailVerification({ verified: true, verifiedAt: null });
		testClient = new QueryClient({
			defaultOptions: { queries: { retry: false, gcTime: Infinity } },
		});
	});

	afterEach(() => {
		act(() => {
			useAuthStore.getState().clearSession();
		});
		testClient.clear();
		jest.useRealTimers();
	});

	it("does not fetch when groupId is undefined", () => {
		renderHook(() => useGroupExpenses(undefined), { wrapper: Wrapper });

		expect(mockGetGroupExpenses).not.toHaveBeenCalled();
	});

	it("returns expenses after the first page resolves", async () => {
		mockGetGroupExpenses.mockResolvedValueOnce(expensePageOne);

		const { result } = renderHook(() => useGroupExpenses("g1"), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.expenses).toHaveLength(1);
		expect(result.current.expenses[0].id).toBe("e1");
		expect(result.current.hasNextPage).toBe(true);
		expect(result.current.isFetchingNextPage).toBe(false);
	});

	it("fetches the next page when fetchNextPage is called", async () => {
		mockGetGroupExpenses
			.mockResolvedValueOnce(expensePageOne)
			.mockResolvedValueOnce(expensePageTwo);

		const { result } = renderHook(() => useGroupExpenses("g1"), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		await result.current.fetchNextPage();

		await waitFor(() => expect(result.current.expenses).toHaveLength(2));

		expect(result.current.hasNextPage).toBe(false);
		expect(result.current.hasNextPage).toBe(false);
		expect(mockGetGroupExpenses).toHaveBeenLastCalledWith("g1", {
			cursor: "cursor-1",
			limit: 20,
		});
	});

	it("exposes an error state when the query fails", async () => {
		mockGetGroupExpenses.mockRejectedValueOnce(new Error("Network error"));

		const { result } = renderHook(() => useGroupExpenses("g1"), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.expenses).toHaveLength(0);
		expect(result.current.error).toBeInstanceOf(Error);
	});
});
