import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as ReactNavigation from "@react-navigation/native";
import { Alert } from "react-native";

import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuthStore } from "../../../shared/store/authStore";
import {
	deletePersonalTransaction,
	getPersonalTransactions,
	getPersonalTransactionsSummary,
} from "../api/personalTransactionsApi";
import { usePersonalCategoryDetailScreen } from "../hooks/usePersonalCategoryDetailScreen";

jest.mock("../api/personalTransactionsApi", () => ({
	deletePersonalTransaction: jest.fn(),
	getPersonalTransactions: jest.fn(),
	getPersonalTransactionsSummary: jest.fn(),
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
const mockGetPersonalTransactionsSummary = jest.mocked(
	getPersonalTransactionsSummary,
);
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
		mockGetPersonalTransactionsSummary.mockResolvedValue({
			total: 0,
			incomeTotal: 0,
			expenseTotal: 0,
			currency: "ARS",
			breakdown: [],
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

	it("shows Ocio's exact percentage from the matching summary breakdown", async () => {
		mockUseRoute.mockReturnValue({
			params: {
				type: "expense",
				category: "Ocio",
				range: "week",
				percentage: 12,
			},
		} as never);
		mockGetPersonalTransactionsSummary.mockResolvedValue({
			total: -5700,
			incomeTotal: 0,
			expenseTotal: 5700,
			currency: "ARS",
			breakdown: [
				{ category: "Ocio", type: "expense", amount: 5100, percentage: 89.47 },
			],
		});
		mockGetPersonalTransactions.mockImplementation(async (filters) => ({
			transactions: filters.category
				? [
						{
							id: "leisure-expense",
							type: "expense" as const,
							expenseKind: "variable" as const,
							amount: 5100,
							currency: "ARS",
							category: "Ocio",
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
			total: filters.category ? 5100 : 100,
			incomeTotal: 0,
			expenseTotal: filters.category ? 5100 : 100,
			currency: "ARS",
		}));

		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.displayTotal).toBe(5100);
		expect(result.current.displayShareLabel).toBe("89.47% del total");
	});

	it("keeps loaded transactions usable with the route percentage when summary loading fails", async () => {
		mockGetPersonalTransactionsSummary.mockRejectedValueOnce(
			new Error("summary unavailable"),
		);

		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(1));
		expect(result.current.displayTotal).toBe(10000);
		expect(result.current.displayShareLabel).toBe("100% del total");
		expect(result.current.isLoading).toBe(false);
		expect(result.current.isError).toBe(false);
		expect(result.current.error).toBeNull();
	});

	it("keeps the route percentage after changing the expense filter", async () => {
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
			expect(result.current.displayShareLabel).toBe("100% del total");
		});
		expect(mockGetPersonalTransactions).toHaveBeenCalledWith(
			expect.objectContaining({
				category: "Café",
				expenseKind: "variable",
				limit: 100,
			}),
		);
	});

	it("uses the route percentage instead of calculating from global totals", async () => {
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
			expect(result.current.displayShareLabel).toBe("100% del total"),
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

	it("uses the refreshed summary percentage after a non-last deletion", async () => {
		let deleted = false;
		mockDeletePersonalTransaction.mockImplementationOnce(async () => {
			deleted = true;
		});
		const transaction = (id: string, amount: number) => ({
			id,
			type: "expense" as const,
			expenseKind: "fixed" as const,
			amount,
			currency: "ARS",
			category: "Café",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-27T12:00:00.000Z",
			note: null,
			createdAt: "2026-06-27T12:00:00.000Z",
			updatedAt: "2026-06-27T12:00:00.000Z",
		});
		mockGetPersonalTransactions.mockImplementation(async () => ({
			transactions: deleted
				? [transaction("remaining-cafe", 10000)]
				: [
						transaction("deleted-cafe", 10000),
						transaction("remaining-cafe", 10000),
					],
			nextCursor: null,
			total: deleted ? 10000 : 20000,
			incomeTotal: 0,
			expenseTotal: deleted ? 10000 : 20000,
			currency: "ARS",
		}));
		mockGetPersonalTransactionsSummary.mockImplementation(async () => ({
			total: deleted ? -50000 : -80000,
			incomeTotal: 0,
			expenseTotal: deleted ? 50000 : 80000,
			currency: "ARS",
			breakdown: [
				{
					category: "Café",
					type: "expense" as const,
					amount: deleted ? 10000 : 20000,
					percentage: deleted ? 20 : 25,
				},
			],
		}));
		const alertSpy = jest.spyOn(Alert, "alert");
		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});
		await waitFor(() =>
			expect(result.current.displayShareLabel).toBe("25% del total"),
		);

		act(() => result.current.deleteTransaction("deleted-cafe"));
		const buttons = alertSpy.mock.calls.at(-1)?.[2] as Array<{
			text: string;
			onPress?: () => void;
		}>;
		await act(async () => {
			buttons.find((button) => button.text === "Eliminar")?.onPress?.();
		});

		await waitFor(() => {
			expect(result.current.displayTotal).toBe(10000);
			expect(result.current.displayShareLabel).toBe("20% del total");
		});
		alertSpy.mockRestore();
	});

	it("navigates back when deleting the only transaction even if refetch empties the category before caller success", async () => {
		const goBack = jest.fn();
		let deleted = false;
		mockUseNavigation.mockReturnValue({ navigate: jest.fn(), goBack } as never);
		mockDeletePersonalTransaction.mockImplementationOnce(async () => {
			deleted = true;
			testClient.setQueriesData(
				{ queryKey: queryKeys.personalTransactions.all() },
				(existing: unknown) =>
					existing && typeof existing === "object"
						? {
								...existing,
								transactions: [],
								total: 0,
								expenseTotal: 0,
							}
						: existing,
			);
			await Promise.resolve();
		});
		mockGetPersonalTransactions.mockImplementation(async (filters) => ({
			transactions:
				deleted || !filters.category
					? []
					: [
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
						],
			nextCursor: null,
			total: deleted ? 0 : 10000,
			incomeTotal: 0,
			expenseTotal: deleted ? 0 : 10000,
			currency: "ARS",
		}));
		const alertSpy = jest.spyOn(Alert, "alert");
		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});
		await waitFor(() => expect(result.current.transactions).toHaveLength(1));

		act(() => result.current.deleteTransaction("fixed-cafe"));
		const buttons = alertSpy.mock.calls.at(-1)?.[2] as Array<{
			text: string;
			onPress?: () => void;
		}>;
		await act(async () => {
			buttons.find((button) => button.text === "Eliminar")?.onPress?.();
		});

		await waitFor(() => expect(result.current.transactions).toHaveLength(0));
		expect(goBack).toHaveBeenCalledTimes(1);
		alertSpy.mockRestore();
	});

	it("stays on category detail after successfully deleting one of multiple displayed transactions", async () => {
		const goBack = jest.fn();
		mockUseNavigation.mockReturnValue({ navigate: jest.fn(), goBack } as never);
		mockDeletePersonalTransaction.mockResolvedValueOnce(undefined);
		mockGetPersonalTransactions.mockResolvedValue({
			transactions: [
				{
					id: "fixed-cafe-1",
					type: "expense",
					expenseKind: "fixed",
					amount: 6000,
					currency: "ARS",
					category: "Café",
					accountId: "account-ars",
					accountName: "Pesos",
					occurredAt: "2026-06-27T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-27T12:00:00.000Z",
					updatedAt: "2026-06-27T12:00:00.000Z",
				},
				{
					id: "fixed-cafe-2",
					type: "expense",
					expenseKind: "fixed",
					amount: 4000,
					currency: "ARS",
					category: "Café",
					accountId: "account-ars",
					accountName: "Pesos",
					occurredAt: "2026-06-26T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-26T12:00:00.000Z",
					updatedAt: "2026-06-26T12:00:00.000Z",
				},
			],
			nextCursor: null,
			total: 10000,
			incomeTotal: 0,
			expenseTotal: 10000,
			currency: "ARS",
		});
		const alertSpy = jest.spyOn(Alert, "alert");
		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});
		await waitFor(() => expect(result.current.transactions).toHaveLength(2));

		act(() => result.current.deleteTransaction("fixed-cafe-1"));
		const buttons = alertSpy.mock.calls.at(-1)?.[2] as Array<{
			text: string;
			onPress?: () => void;
		}>;
		await act(async () => {
			buttons.find((button) => button.text === "Eliminar")?.onPress?.();
		});

		await waitFor(() =>
			expect(mockDeletePersonalTransaction).toHaveBeenCalled(),
		);
		expect(goBack).not.toHaveBeenCalled();
		alertSpy.mockRestore();
	});

	it("carries PersonalExpenses return intent when editing the sole displayed transaction", async () => {
		const navigate = jest.fn();
		mockUseNavigation.mockReturnValue({ navigate } as never);
		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});
		await waitFor(() => expect(result.current.transactions).toHaveLength(1));

		act(() =>
			result.current.navigateToEditTransaction(result.current.transactions[0]),
		);

		expect(navigate).toHaveBeenCalledWith("AddPersonalTransaction", {
			type: "expense",
			transactionId: "fixed-cafe",
			returnToPersonalExpenses: true,
		});
	});

	it("does not carry PersonalExpenses return intent when editing one of multiple displayed transactions", async () => {
		const navigate = jest.fn();
		mockUseNavigation.mockReturnValue({ navigate } as never);
		mockGetPersonalTransactions.mockResolvedValue({
			transactions: [
				{
					id: "fixed-cafe-1",
					type: "expense",
					expenseKind: "fixed",
					amount: 6000,
					currency: "ARS",
					category: "Café",
					accountId: "account-ars",
					accountName: "Pesos",
					occurredAt: "2026-06-27T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-27T12:00:00.000Z",
					updatedAt: "2026-06-27T12:00:00.000Z",
				},
				{
					id: "fixed-cafe-2",
					type: "expense",
					expenseKind: "fixed",
					amount: 4000,
					currency: "ARS",
					category: "Café",
					accountId: "account-ars",
					accountName: "Pesos",
					occurredAt: "2026-06-26T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-26T12:00:00.000Z",
					updatedAt: "2026-06-26T12:00:00.000Z",
				},
			],
			nextCursor: null,
			total: 10000,
			incomeTotal: 0,
			expenseTotal: 10000,
			currency: "ARS",
		});
		const { result } = renderHook(() => usePersonalCategoryDetailScreen(), {
			wrapper: Wrapper,
		});
		await waitFor(() => expect(result.current.transactions).toHaveLength(2));

		act(() =>
			result.current.navigateToEditTransaction(result.current.transactions[0]),
		);

		expect(navigate).toHaveBeenCalledWith("AddPersonalTransaction", {
			type: "expense",
			transactionId: "fixed-cafe-1",
		});
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
