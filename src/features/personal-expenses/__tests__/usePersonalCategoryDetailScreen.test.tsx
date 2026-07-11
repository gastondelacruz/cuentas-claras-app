import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as ReactNavigation from "@react-navigation/native";

import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuthStore } from "../../../shared/store/authStore";
import { getPersonalTransactions } from "../api/personalTransactionsApi";
import { usePersonalCategoryDetailScreen } from "../hooks/usePersonalCategoryDetailScreen";

jest.mock("../api/personalTransactionsApi", () => ({
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
