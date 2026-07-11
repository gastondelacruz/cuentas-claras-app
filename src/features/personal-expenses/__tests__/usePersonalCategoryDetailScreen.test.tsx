import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as ReactNavigation from "@react-navigation/native";
import { Alert } from "react-native";

import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuthStore } from "../../../shared/store/authStore";
import {
	deletePersonalTransaction,
	getPersonalTransactions,
} from "../api/personalTransactionsApi";
import { usePersonalCategoryDetailScreen } from "../hooks/usePersonalCategoryDetailScreen";

jest.mock("../api/personalTransactionsApi", () => ({
	deletePersonalTransaction: jest.fn(),
	getPersonalTransactions: jest.fn(),
}));

jest.mock("@react-navigation/native", () => {
	const actual = jest.requireActual("@react-navigation/native");
	return {
		...actual,
		useRoute: jest.fn(),
		useNavigation: jest.fn(),
	};
});

const mockDeletePersonalTransaction = jest.mocked(deletePersonalTransaction);
const mockGetPersonalTransactions = jest.mocked(getPersonalTransactions);
const mockUseRoute = jest.mocked(ReactNavigation.useRoute);
const mockUseNavigation = jest.mocked(ReactNavigation.useNavigation);

let testClient: QueryClient;

function Wrapper({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
	);
}

const FAKE_NOW = new Date("2026-06-29T12:00:00.000Z");

describe("usePersonalCategoryDetailScreen", () => {
	beforeEach(() => {
		jest.useFakeTimers({ now: FAKE_NOW });
		jest.clearAllMocks();
		useAuthStore.getState().clearSession();
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "verified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
			);
		mockUseNavigation.mockReturnValue({ navigate: jest.fn() } as never);
		mockUseRoute.mockReturnValue({
			params: {
				type: "expense",
				category: "Café",
				range: "week",
				expenseKind: "fixed",
				percentage: 100,
			},
		} as never);
		testClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false, gcTime: Infinity },
				mutations: { retry: false, gcTime: Infinity },
			},
		});
		mockGetPersonalTransactions.mockResolvedValue({
			transactions: [
				{
					id: "fixed-cafe",
					type: "expense",
					expenseKind: "fixed",
					amount: 10000,
					currency: "ARS",
					category: "Café",
					accountId: "account-ars",
					accountName: "Pesos",
					occurredAt: "2026-06-27T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-27T12:00:00.000Z",
					updatedAt: "2026-06-27T12:00:00.000Z",
				},
			],
			nextCursor: null,
			total: 10000,
			incomeTotal: 0,
			expenseTotal: 10000,
			currency: "ARS",
		});
	});

	afterEach(() => {
		testClient.clear();
		jest.useRealTimers();
	});

	it("shows the overview percentage when the filtered response total is only the category total", async () => {
		mockUseRoute.mockReturnValue({
			params: {
				type: "income",
				category: "Intereses",
				range: "week",
				percentage: 9.09,
			},
		} as never);
		mockGetPersonalTransactions.mockResolvedValue({
			transactions: [
				{
					id: "interest-income",
					type: "income",
					amount: 50000,
					currency: "ARS",
					category: "Intereses",
					accountId: "account-ars",
					accountName: "Pesos",
					occurredAt: "2026-06-27T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-27T12:00:00.000Z",
					updatedAt: "2026-06-27T12:00:00.000Z",
				},
			],
			nextCursor: null,
			total: 50000,
			incomeTotal: 50000,
			expenseTotal: 0,
			currency: "ARS",
		});

		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.displayTotal).toBe(50000);
		expect(result.current.displayShareLabel).toBe("9.09% del total");
	});

	it("recomputes the category share against the global total after changing the expense filter", async () => {
		mockGetPersonalTransactions.mockImplementation(async (filters) => {
			const isCategoryQuery = filters.category === "Café";
			const isVariable = filters.expenseKind === "variable";
			const amount = isVariable ? (isCategoryQuery ? 20000 : 100000) : 10000;

			return {
				transactions: isCategoryQuery
					? [
							{
								id: isVariable ? "variable-cafe" : "fixed-cafe",
								type: "expense" as const,
								expenseKind: isVariable
									? ("variable" as const)
									: ("fixed" as const),
								amount,
								currency: "ARS",
								category: "Café",
								accountId: "account-ars",
								accountName: "Pesos",
								occurredAt: "2026-06-27T12:00:00.000Z",
								note: null,
								createdAt: "2026-06-27T12:00:00.000Z",
								updatedAt: "2026-06-27T12:00:00.000Z",
							},
						]
					: [],
				nextCursor: null,
				total: amount,
				incomeTotal: 0,
				expenseTotal: amount,
				currency: "ARS",
			};
		});

		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});

		await waitFor(() =>
			expect(result.current.displayShareLabel).toBe("100% del total"),
		);

		act(() => result.current.setExpenseKindFilter("variable"));

		await waitFor(() => {
			expect(result.current.displayTotal).toBe(20000);
			expect(result.current.displayShareLabel).toBe("20% del total");
		});
		expect(mockGetPersonalTransactions.mock.calls).toContainEqual([
			expect.not.objectContaining({ category: expect.anything() }),
		]);
		expect(mockGetPersonalTransactions).toHaveBeenCalledWith(
			expect.objectContaining({ expenseKind: "variable", limit: 1 }),
		);
	});

	it("uses refreshed global totals instead of the stale route percentage", async () => {
		mockGetPersonalTransactions.mockImplementation(async (filters) => ({
			transactions: filters.category
				? [
						{
							id: "fixed-cafe",
							type: "expense" as const,
							expenseKind: "fixed" as const,
							amount: 10000,
							currency: "ARS",
							category: "Café",
							accountId: "account-ars",
							accountName: "Pesos",
							occurredAt: "2026-06-27T12:00:00.000Z",
							note: null,
							createdAt: "2026-06-27T12:00:00.000Z",
							updatedAt: "2026-06-27T12:00:00.000Z",
						},
					]
				: [],
			nextCursor: null,
			total: filters.category ? 10000 : 40000,
			incomeTotal: 0,
			expenseTotal: filters.category ? 10000 : 40000,
			currency: "ARS",
		}));

		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});

		await waitFor(() =>
			expect(result.current.displayShareLabel).toBe("25% del total"),
		);
	});

	it("shows deletion failure feedback in category detail", async () => {
		mockDeletePersonalTransaction.mockRejectedValueOnce(new Error("network"));
		const alertSpy = jest.spyOn(Alert, "alert");
		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		act(() => result.current.deleteTransaction("fixed-cafe"));
		const buttons = alertSpy.mock.calls.at(-1)?.[2] as Array<{
			text: string;
			onPress?: () => void;
		}>;
		await act(async () => {
			buttons.find((button) => button.text === "Eliminar")?.onPress?.();
		});

		await waitFor(() =>
			expect(alertSpy).toHaveBeenLastCalledWith(
				"No pudimos eliminar la transacción",
				"Intentá de nuevo.",
			),
		);
		alertSpy.mockRestore();
	});

	it("fetches category detail data with the shared query options and backend filters", async () => {
		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(mockGetPersonalTransactions).toHaveBeenCalledWith({
			type: "expense",
			range: "week",
			from: undefined,
			to: undefined,
			category: "Café",
			expenseKind: "fixed",
			limit: 100,
		});
		expect(result.current.transactions).toHaveLength(1);
		expect(result.current.transactions[0]?.id).toBe("fixed-cafe");
		expect(result.current.displayTotalLabel).toBe("10.000 $");
		expect(result.current.displayShareLabel).toBe("100% del total");
		expect(result.current.expenseKindFilter).toBe("fixed");
		expect(result.current.rangeLabel).toBe("29 jun – 5 jul");
		expect(
			testClient.getQueryState(
				queryKeys.personalTransactions.categoryDetail({
					type: "expense",
					category: "Café",
					range: "week",
					expenseKind: "fixed",
				}),
			),
		).toBeTruthy();
	});
});
