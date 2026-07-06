import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

import { useAuthStore } from "../../../shared/store/authStore";
import { SettleDebtsScreen } from "../screens/SettleDebtsScreen";
import {
	getGroup,
	getGroupBalances,
	getGroupSettlements,
	recordGroupSettlement,
} from "../../groups/api/groupsApi";

jest.mock("../../groups/api/groupsApi", () => ({
	getGroup: jest.fn(),
	getGroupBalances: jest.fn(),
	getGroupSettlements: jest.fn(),
	recordGroupSettlement: jest.fn(),
}));

const mockGetGroup = jest.mocked(getGroup);
const mockGetGroupBalances = jest.mocked(getGroupBalances);
const mockGetGroupSettlements = jest.mocked(getGroupSettlements);
const mockRecordGroupSettlement = jest.mocked(recordGroupSettlement);

// Real backend balance shape
const currentUserBalance = {
	memberId: "m1",
	displayName: "Vos",
	balance: 0,
	currency: "ARS",
	isCurrentUser: true,
};
const anaBalance = {
	memberId: "m-ana",
	displayName: "Ana",
	balance: 50,
	currency: "ARS",
};

const mockPayment = {
	id: "pay1",
	groupId: "g1",
	fromMember: { id: "m-ana", displayName: "Ana" },
	toMember: { id: "m1", displayName: "Vos" },
	amount: 50,
	currency: "ARS",
	paidAt: "2026-06-26T12:00:00.000Z",
	notes: null,
	createdAt: "2026-06-26T12:00:00.000Z",
};

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { gcTime: Infinity, retry: false },
			mutations: { gcTime: Infinity, retry: false },
		},
	});
}

describe("SettleDebtsScreen", () => {
	let testClient: QueryClient;

	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
		);
	}

	beforeEach(() => {
		jest.clearAllMocks();
		useAuthStore
			.getState()
			.setSession({ id: "current-user", email: "you@example.com" }, "token");
		useAuthStore
			.getState()
			.setEmailVerification({ verified: true, verifiedAt: null });
		testClient = createTestQueryClient();
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { groupId: "g1" } } as never);
		mockGetGroup.mockResolvedValue({ id: "g1", members: [] });
		mockGetGroupSettlements.mockResolvedValue({ settlements: [] });
		mockRecordGroupSettlement.mockResolvedValue({
			payment: mockPayment,
			balances: [],
		});
	});

	afterEach(async () => {
		await act(async () => {
			useAuthStore.getState().clearSession();
			await testClient.cancelQueries();
			testClient.clear();
		});
	});

	it("renders the internal header and uses natural back navigation", async () => {
		mockGetGroupBalances.mockResolvedValue({ balances: [] });
		const goBack = jest.fn();
		jest.mocked(useNavigation).mockReturnValue({ goBack } as never);

		const { unmount } = render(<SettleDebtsScreen />, { wrapper: Wrapper });

		expect(screen.getByText("Saldos")).toBeTruthy();

		fireEvent.press(screen.getByLabelText("Volver"));

		expect(goBack).toHaveBeenCalledTimes(1);

		await screen.findByText("Estás al día");

		unmount();
	});

	it("shows the empty state when there are no pending debts", async () => {
		mockGetGroupBalances.mockResolvedValue({ balances: [currentUserBalance] });

		render(<SettleDebtsScreen />, { wrapper: Wrapper });

		expect(screen.getByText("Resumen de saldos")).toBeTruthy();
		await screen.findByText("Estás al día");
	});

	it('shows a "Saldar" button on user-facing settlement rows and calls the mutation on press', async () => {
		mockGetGroupBalances.mockResolvedValue({
			balances: [currentUserBalance, anaBalance],
		});
		mockGetGroupSettlements.mockResolvedValue({
			settlements: [
				{
					fromMemberId: "m-ana",
					fromMemberName: "Ana",
					toMemberId: "m1",
					toMemberName: "Vos",
					amount: 50,
					currency: "ARS",
				},
			],
		});

		render(<SettleDebtsScreen />, { wrapper: Wrapper });

		const button = await screen.findByLabelText("Saldar deuda con Ana");
		fireEvent.press(button);

		await waitFor(() =>
			expect(mockRecordGroupSettlement).toHaveBeenCalledTimes(1),
		);
		await waitFor(() => expect(button).not.toBeDisabled());
		expect(mockRecordGroupSettlement).toHaveBeenCalledWith(
			"g1",
			expect.objectContaining({
				fromMemberId: "m-ana",
				toMemberId: "m1",
				amount: 50,
			}),
		);
	});

	it("renders the balances summary and settlement rows from real data", async () => {
		mockGetGroupBalances.mockResolvedValue({
			balances: [
				{ ...currentUserBalance, balance: 50 },
				{
					memberId: "m-ana",
					displayName: "ana@example.com",
					balance: -50,
					currency: "ARS",
				},
			],
		});
		mockGetGroupSettlements.mockResolvedValue({
			settlements: [
				{
					fromMemberId: "m-ana",
					fromMemberName: "ana@example.com",
					toMemberId: "m1",
					toMemberName: "Vos",
					amount: 50,
					currency: "ARS",
				},
			],
		});

		render(<SettleDebtsScreen />, { wrapper: Wrapper });

		expect(screen.getByText("Resumen de saldos")).toBeTruthy();
		expect(screen.getByText("Quién debe a quién")).toBeTruthy();
		await screen.findByText("ana@example.com te debe");
		expect(screen.getAllByText("$50,00")).toHaveLength(2);
		expect(screen.queryByText("Estás al día")).toBeNull();
	});

	it("keeps long summary amounts on a single responsive line", async () => {
		mockGetGroupBalances.mockResolvedValue({
			balances: [
				{ ...currentUserBalance, balance: 250670 },
				{
					memberId: "m-ana",
					displayName: "Ana",
					balance: -250670,
					currency: "ARS",
				},
			],
		});

		render(<SettleDebtsScreen />, { wrapper: Wrapper });

		const receivableAmount = await screen.findByText("$250.670,00");

		expect(receivableAmount.props.numberOfLines).toBe(1);
		expect(receivableAmount.props.adjustsFontSizeToFit).toBe(true);
		expect(receivableAmount.props.minimumFontScale).toBeGreaterThanOrEqual(0.7);
	});

	it("renders the you-owe direction with user-facing copy and settles from the current user", async () => {
		mockGetGroupBalances.mockResolvedValue({
			balances: [
				{ ...currentUserBalance, balance: -40 },
				{ memberId: "m-ana", displayName: "Ana", balance: 40, currency: "ARS" },
			],
		});
		mockGetGroupSettlements.mockResolvedValue({
			settlements: [
				{
					fromMemberId: "m1",
					fromMemberName: "Vos",
					toMemberId: "m-ana",
					toMemberName: "Ana",
					amount: 40,
					currency: "ARS",
				},
			],
		});

		render(<SettleDebtsScreen />, { wrapper: Wrapper });

		expect(screen.getByText("Resumen de saldos")).toBeTruthy();
		const rowCopy = await screen.findByText("Tú le debes a Ana");
		expect(rowCopy).toBeTruthy();
		expect(screen.getAllByText("$40,00")).toHaveLength(2);

		const button = screen.getByLabelText("Saldar deuda con Ana");
		expect(button).toBeTruthy();

		fireEvent.press(button);

		await waitFor(() =>
			expect(mockRecordGroupSettlement).toHaveBeenCalledTimes(1),
		);
		await waitFor(() => expect(button).not.toBeDisabled());
		expect(mockRecordGroupSettlement).toHaveBeenCalledWith(
			"g1",
			expect.objectContaining({
				fromMemberId: "m1",
				toMemberId: "m-ana",
				amount: 40,
			}),
		);
	});
});
