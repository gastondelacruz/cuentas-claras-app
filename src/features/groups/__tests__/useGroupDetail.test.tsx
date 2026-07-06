import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { PropsWithChildren } from "react";

import {
	getGroup,
	getGroupBalances,
	GetGroupsResponse,
} from "../api/groupsApi";
import { useGroupDetail } from "../hooks/useGroupDetail";
import { useGroups } from "../hooks/useGroups";
import { useAuthStore } from "../../../shared/store/authStore";
import { useGroupExpenses } from "../../expenses/hooks/useGroupExpenses";

jest.mock("../api/groupsApi", () => ({
	getGroups: jest.fn(),
	createGroup: jest.fn(),
	getGroup: jest.fn(),
	getGroupBalances: jest.fn(),
}));

jest.mock("../hooks/useGroups");
jest.mock("../../expenses/hooks/useGroupExpenses");

const mockGetGroup = jest.mocked(getGroup);
const mockGetGroupBalances = jest.mocked(getGroupBalances);
const mockUseGroups = jest.mocked(useGroups);
const mockUseGroupExpenses = jest.mocked(useGroupExpenses);

// Fixtures matching real backend DTOs
const groupDetailResponse = {
	id: "g1",
	name: "Viaje a Mendoza",
	type: "trip" as const,
	currency: "ARS",
	currentUserBalance: 60.25,
	totalAmount: 240,
	expensesCount: 2,
	members: [
		{ id: "m1", displayName: "Vos", isCurrentUser: true },
		{ id: "m2", displayName: "Ana", isCurrentUser: false },
	],
};

const balancesResponse = {
	balances: [
		{ memberId: "m1", displayName: "Vos", balance: 60.25, currency: "ARS" },
		{ memberId: "m2", displayName: "Ana", balance: -60.25, currency: "ARS" },
	],
};

const expensesResponse = [
	{
		id: "e1",
		groupId: "g1",
		title: "Gahhvaa",
		amount: 10000,
		currency: "ARS",
		paidBy: { id: "m1", displayName: "Gaston" },
		participantsCount: 2,
		category: "FOOD",
		expenseDate: "2026-06-27T11:57:48.434Z",
		createdAt: "2026-06-27T11:57:58.926Z",
	},
];

describe("useGroupDetail", () => {
	let testClient: QueryClient;

	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
		);
	}

	beforeEach(() => {
		jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
		jest.clearAllMocks();
		testClient = new QueryClient({
			defaultOptions: { queries: { retry: false, gcTime: Infinity } },
		});
		useAuthStore
			.getState()
			.setSession({ id: "current-user", email: "you@example.com" }, "tok");
		useAuthStore
			.getState()
			.setEmailVerification({ verified: true, verifiedAt: null });
		mockUseGroups.mockReturnValue({
			data: { data: [] } as GetGroupsResponse,
			isLoading: false,
		} as unknown as ReturnType<typeof useGroups>);
		mockUseGroupExpenses.mockReturnValue({
			expenses: [],
			fetchNextPage: jest.fn(),
			hasNextPage: false,
			isFetchingNextPage: false,
			isLoading: false,
			error: null,
		});
	});

	afterEach(() => {
		act(() => {
			useAuthStore.getState().clearSession();
		});
		testClient.clear();
		jest.useRealTimers();
	});

	it("returns null while loading and groupId is provided", () => {
		mockGetGroup.mockImplementation(() => new Promise(() => {}));
		mockGetGroupBalances.mockImplementation(() => new Promise(() => {}));

		const { result } = renderHook(() => useGroupDetail("g1"), {
			wrapper: Wrapper,
		});

		expect(result.current.isLoading).toBe(true);
		expect(result.current.group).toBeNull();
		expect(result.current.memberBalances).toEqual([]);
	});

	it("returns group and member balances after both queries resolve", async () => {
		mockGetGroup.mockResolvedValueOnce(groupDetailResponse);
		mockGetGroupBalances.mockResolvedValueOnce(balancesResponse);
		mockUseGroupExpenses.mockReturnValue({
			expenses: expensesResponse,
			fetchNextPage: jest.fn(),
			hasNextPage: false,
			isFetchingNextPage: false,
			isLoading: false,
			error: null,
		});

		const { result } = renderHook(() => useGroupDetail("g1"), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.group).toMatchObject({
			id: "g1",
			name: "Viaje a Mendoza",
			category: "TRAVEL",
			totalExpense: 240,
			owedToYou: 60.25,
			youOwe: 0,
		});
		expect(result.current.memberBalances).toHaveLength(2);
		expect(result.current.memberBalances[0]).toMatchObject({
			id: "m1",
			name: "Vos",
			balance: 60.25,
		});
		expect(result.current.recentExpenses).toEqual([
			expect.objectContaining({
				id: "e1",
				title: "Gahhvaa",
				paidByLabel: "Pagado por Gaston",
				totalAmount: 10000,
				category: "FOOD",
				paidById: "m1",
				participantIds: [],
				date: "2026-06-27T11:57:48.434Z",
				userRelation: { type: "none", amount: 0 },
			}),
		]);
		expect(result.current.totalExpensesCount).toBe(2);
	});

	it("uses prepopulated detail cache during the creation navigation transition without returning unavailable state", async () => {
		testClient.setQueryData(["groups", "new-group-id"], {
			...groupDetailResponse,
			id: "new-group-id",
			name: "Grupo recién creado",
			expensesCount: 0,
			totalAmount: 0,
			currentUserBalance: 0,
		});
		mockGetGroupBalances.mockImplementation(() => new Promise(() => {}));
		mockUseGroupExpenses.mockReturnValue({
			expenses: [],
			fetchNextPage: jest.fn(),
			hasNextPage: false,
			isFetchingNextPage: false,
			isLoading: true,
			error: null,
		});

		const { result } = renderHook(() => useGroupDetail("new-group-id"), {
			wrapper: Wrapper,
		});

		expect(result.current.group).toMatchObject({
			id: "new-group-id",
			name: "Grupo recién creado",
			totalExpense: 0,
		});
		expect(result.current.isLoading).toBe(true);
	});

	it("derives summary totals from expenses and current member balance when group aggregates are missing", async () => {
		mockGetGroup.mockResolvedValueOnce({
			...groupDetailResponse,
			currentUserBalance: null,
			totalAmount: null,
			expensesCount: null,
		});
		mockGetGroupBalances.mockResolvedValueOnce(balancesResponse);
		mockUseGroupExpenses.mockReturnValue({
			expenses: [
				expensesResponse[0],
				{
					...expensesResponse[0],
					id: "e2",
					title: "Cena",
					amount: 5000,
				},
			],
			fetchNextPage: jest.fn(),
			hasNextPage: false,
			isFetchingNextPage: false,
			isLoading: false,
			error: null,
		});

		const { result } = renderHook(() => useGroupDetail("g1"), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.group).toMatchObject({
			totalExpense: 15000,
			owedToYou: 60.25,
			youOwe: 0,
		});
		expect(result.current.memberBalances[0]).toMatchObject({
			id: "m1",
			isCurrentUser: true,
		});
		expect(result.current.totalExpensesCount).toBe(2);
	});

	it("does not fetch protected group detail when email is not verified", () => {
		useAuthStore
			.getState()
			.setEmailVerification({ verified: false, verifiedAt: null });

		const { result } = renderHook(() => useGroupDetail("g1"), {
			wrapper: Wrapper,
		});

		expect(result.current.group).toBeNull();
		expect(result.current.isLoading).toBe(false);
		expect(mockGetGroup).not.toHaveBeenCalled();
		expect(mockGetGroupBalances).not.toHaveBeenCalled();
	});

	it("returns null for an undefined groupId", () => {
		const { result } = renderHook(() => useGroupDetail(undefined), {
			wrapper: Wrapper,
		});

		expect(result.current.group).toBeNull();
		expect(result.current.isLoading).toBe(false);
		expect(mockGetGroup).not.toHaveBeenCalled();
	});

	it("exposes an error state when the detail query fails", async () => {
		mockGetGroup.mockRejectedValueOnce(new Error("Network error"));
		mockGetGroupBalances.mockResolvedValueOnce(balancesResponse);

		const { result } = renderHook(() => useGroupDetail("g1"), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.group).toBeNull();
	});
});
