import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuthStore } from "../../../shared/store/authStore";
import {
	getPersonalTransactions,
	getPersonalTransactionsSummary,
} from "../api/personalTransactionsApi";
import { useCreatePersonalTransaction } from "../hooks/useCreatePersonalTransaction";
import { usePersonalTransactions } from "../hooks/usePersonalTransactions";
import { usePersonalTransactionsSummary } from "../hooks/usePersonalTransactionsSummary";
import type { PersonalTransactionViewItem } from "../types";

jest.mock("../api/personalTransactionsApi", () => ({
	getPersonalTransactions: jest.fn(),
	getPersonalTransactionsSummary: jest.fn(),
	createPersonalTransaction: jest.fn(async (input) => ({
		id: "ptx-created",
		...input,
		note: input.note ?? null,
		createdAt: "2026-06-27T12:00:00.000Z",
		updatedAt: "2026-06-27T12:00:00.000Z",
	})),
}));

const mockGetPersonalTransactions = jest.mocked(getPersonalTransactions);
const mockGetPersonalTransactionsSummary = jest.mocked(
	getPersonalTransactionsSummary,
);

let testClient: QueryClient;

function Wrapper({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
	);
}

describe("usePersonalTransactions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useAuthStore.getState().clearSession();
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "verified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
			);
		testClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false, gcTime: Infinity },
				mutations: { retry: false, gcTime: Infinity },
			},
		});
		mockGetPersonalTransactions.mockResolvedValue({
			transactions: [],
			nextCursor: null,
			total: 876371,
			incomeTotal: 876371,
			expenseTotal: 0,
			currency: "ARS",
		});
		mockGetPersonalTransactionsSummary.mockResolvedValue({
			total: 876371,
			incomeTotal: 876371,
			expenseTotal: 0,
			currency: "ARS",
			breakdown: [],
		});
	});

	afterEach(() => {
		testClient.clear();
	});

	it("does not expose cached personal transactions while email is not verified", () => {
		const filters = {
			type: "income" as const,
			range: "week" as const,
			from: "2026-06-22",
			to: "2026-06-28",
		};
		testClient.setQueryData(queryKeys.personalTransactions.list(filters), {
			transactions: [{ id: "cached" }],
			nextCursor: null,
			total: 1,
			incomeTotal: 1,
			expenseTotal: 0,
			currency: "ARS",
		});
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "unverified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);

		const { result } = renderHook(() => usePersonalTransactions(filters), {
			wrapper: Wrapper,
		});

		expect(result.current.transactions).toEqual([]);
		expect(result.current.hasFetchedTransactions).toBe(false);
		expect(result.current.total).toBe(0);
		expect(mockGetPersonalTransactions).not.toHaveBeenCalled();
	});

	it("does not fetch protected personal transactions while email is not verified", () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "unverified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);
		const filters = {
			type: "income" as const,
			range: "week" as const,
			from: "2026-06-22",
			to: "2026-06-28",
		};

		const { result } = renderHook(() => usePersonalTransactions(filters), {
			wrapper: Wrapper,
		});

		expect(result.current.isLoading).toBe(false);
		expect(mockGetPersonalTransactions).not.toHaveBeenCalled();
	});

	it("does not expose cached personal transaction summary while email is not verified", () => {
		const filters = {
			range: "week" as const,
			from: "2026-06-22",
			to: "2026-06-28",
		};
		testClient.setQueryData(queryKeys.personalTransactions.summary(filters), {
			total: 1,
			incomeTotal: 1,
			expenseTotal: 0,
			currency: "ARS",
			breakdown: [],
		});
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "unverified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);

		const { result } = renderHook(
			() => usePersonalTransactionsSummary(filters),
			{ wrapper: Wrapper },
		);

		expect(result.current.summary).toBeUndefined();
		expect(result.current.hasFetchedSummary).toBe(false);
		expect(mockGetPersonalTransactionsSummary).not.toHaveBeenCalled();
	});

	it("does not fetch the protected personal summary while email is not verified", () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "unverified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);
		const filters = {
			range: "week" as const,
			from: "2026-06-22",
			to: "2026-06-28",
		};

		const { result } = renderHook(
			() => usePersonalTransactionsSummary(filters),
			{ wrapper: Wrapper },
		);

		expect(result.current.isLoading).toBe(false);
		expect(mockGetPersonalTransactionsSummary).not.toHaveBeenCalled();
	});

	it("fetches personal transactions with a stable personal-expenses query key", async () => {
		const filters = {
			type: "income" as const,
			range: "week" as const,
			from: "2026-06-22",
			to: "2026-06-28",
		};

		const { result } = renderHook(() => usePersonalTransactions(filters), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(mockGetPersonalTransactions).toHaveBeenCalledWith({
			...filters,
			limit: 20,
		});
		expect(
			testClient.getQueryState(queryKeys.personalTransactions.list(filters)),
		).toBeTruthy();
		expect(result.current.transactions).toEqual([]);
		expect(result.current.hasFetchedTransactions).toBe(true);
		expect(result.current.total).toBe(876371);
	});

	it("preserves backend expense kind and defaults nullable expense kinds to variable", async () => {
		const transactions: PersonalTransactionViewItem[] = [
			{
				id: "fixed-expense",
				type: "expense",
				expenseKind: "fixed",
				amount: 1000,
				currency: "ARS",
				category: "Alquiler",
				accountId: "account-ars",
				accountName: "Pesos",
				occurredAt: "2026-06-27T12:00:00.000Z",
				note: null,
			},
			{
				id: "legacy-expense",
				type: "expense",
				expenseKind: null,
				amount: 500,
				currency: "ARS",
				category: "Café",
				accountId: "account-ars",
				accountName: "Pesos",
				occurredAt: "2026-06-27T12:00:00.000Z",
				note: null,
			},
		];
		mockGetPersonalTransactions.mockResolvedValueOnce({
			transactions,
			nextCursor: null,
			total: 1500,
			incomeTotal: 0,
			expenseTotal: 1500,
			currency: "ARS",
		});

		const { result } = renderHook(
			() => usePersonalTransactions({ type: "expense", range: "week" }),
			{ wrapper: Wrapper },
		);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.transactions).toEqual([
			expect.objectContaining({ id: "fixed-expense", expenseKind: "fixed" }),
			expect.objectContaining({
				id: "legacy-expense",
				expenseKind: "variable",
			}),
		]);
	});

	it("invalidates personal transaction lists after a successful create mutation", async () => {
		const invalidateSpy = jest.spyOn(testClient, "invalidateQueries");
		const { result } = renderHook(() => useCreatePersonalTransaction(), {
			wrapper: Wrapper,
		});

		result.current.mutate({
			type: "expense",
			expenseKind: "variable",
			amount: 1200,
			currency: "ARS",
			category: "Café",
			accountId: "account-ars",
			occurredAt: "2026-06-27T12:00:00.000Z",
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: queryKeys.personalTransactions.all(),
		});
	});
});
