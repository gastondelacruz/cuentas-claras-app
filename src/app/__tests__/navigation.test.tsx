import {
	createNavigationContainerRef,
	NavigationContainer,
	useNavigation,
	useRoute,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { RootNavigator } from "../navigation/RootNavigator";
import { registeredRouteNames, RootStackParamList } from "../navigation/types";
import { useLogin } from "../../features/auth/hooks/useLogin";
import { useGroups } from "../../features/groups/hooks/useGroups";
import { useGroupsStore } from "../../features/groups/store/groupsStore";
import { acceptGroupInvitation } from "../../features/groups/api/groupsApi";
import { useAuthStore } from "../../shared/store/authStore";
import { emitAuthLogout } from "../../shared/api/authEvents";
import { useGroupDetail } from "../../features/groups/hooks/useGroupDetail";
import { useGroupDetailActions } from "../../features/groups/hooks/useGroupDetailActions";
import { useAccountSummary } from "../../features/account/hooks/useAccountSummary";
import { usePersonalTransactions } from "../../features/personal-expenses/hooks/usePersonalTransactions";
import { usePersonalTransactionsSummary } from "../../features/personal-expenses/hooks/usePersonalTransactionsSummary";
import { useEmailVerificationStatus } from "../../features/auth/hooks/useEmailVerification";

jest.mock("../../features/auth/hooks/useLogin", () => ({
	useLogin: jest.fn(() => ({
		mutate: jest.fn(),
		isPending: false,
		error: null,
	})),
}));

jest.mock("../../features/auth/hooks/useRegister", () => ({
	useRegister: jest.fn(() => ({
		mutate: jest.fn(),
		isPending: false,
		error: null,
	})),
}));

jest.mock("../../features/groups/hooks/useGroups");
jest.mock("../../features/auth/hooks/useEmailVerification", () => ({
	...jest.requireActual("../../features/auth/hooks/useEmailVerification"),
	useEmailVerificationStatus: jest.fn(),
}));
jest.mock("../../features/account/hooks/useAccountSummary");
jest.mock("../../features/personal-expenses/hooks/usePersonalTransactions");
jest.mock(
	"../../features/personal-expenses/hooks/usePersonalTransactionsSummary",
);
jest.mock("../../features/groups/hooks/useGroupDetail");
jest.mock("../../features/groups/hooks/useGroupDetailActions");
jest.mock("../../features/groups/api/groupsApi", () => ({
	acceptGroupInvitation: jest.fn(),
}));

jest.mock("../../features/profile/hooks/useProfileData", () => ({
	useProfileData: jest.fn(() => ({
		user: {
			name: "Alex Thompson",
			email: "alex@example.com",
			status: "Verificado",
			avatarUrl: "",
		},
		summary: {
			activeDebtGroupsCount: 0,
			totalExpenseCount: 3,
			totalExpenses: 450,
			owedToYou: 0,
			youOwe: 0,
			netBalance: 0,
			currency: "ARS",
		},
		summaryError: null,
		summaryStatus: "success",
	})),
}));

jest.mock("react-native-toast-message", () => ({
	__esModule: true,
	default: {
		show: jest.fn(),
	},
}));

const actualNavigation = jest.requireActual<
	typeof import("@react-navigation/native")
>("@react-navigation/native");

const mainTabLabels = ["Grupos", "Gastos", "Perfil"] as const;
const mockUseLogin = jest.mocked(useLogin);
const mockUseGroups = jest.mocked(useGroups);
const mockUseAccountSummary = jest.mocked(useAccountSummary);
const mockUsePersonalTransactions = jest.mocked(usePersonalTransactions);
const mockUsePersonalTransactionsSummary = jest.mocked(
	usePersonalTransactionsSummary,
);
const mockAcceptGroupInvitation = jest.mocked(acceptGroupInvitation);
const mockUseEmailVerificationStatus = jest.mocked(useEmailVerificationStatus);

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: Infinity },
			mutations: { retry: false, gcTime: Infinity },
		},
	});
}

let testClient: QueryClient;

function createGroup(name: string, invitedEmails: string[]) {
	return useGroupsStore.getState().createGroup({
		name,
		category: "TRAVEL",
		image: { type: "default", uri: null },
		invitedEmails,
		owner: {
			id: "1",
			name: "Vos",
			email: "a@b.com",
			initials: "YO",
			avatarUrl: null,
		},
	});
}

describe("navigation shell", () => {
	let groupId: string;

	beforeEach(() => {
		useAuthStore.getState().clearSession();
		useGroupsStore.getState().reset();
		mockAcceptGroupInvitation.mockReset();
		mockAcceptGroupInvitation.mockResolvedValue(undefined);
		mockUseEmailVerificationStatus.mockReturnValue({
			data: { verified: true, verifiedAt: null },
			isLoading: false,
			isError: false,
			error: null,
		} as ReturnType<typeof useEmailVerificationStatus>);
		groupId = createGroup("Viaje a la costa", [
			"alex@example.com",
			"sarah@example.com",
		]).id;
		mockUseGroups.mockReturnValue({
			data: {
				data: [
					{
						id: groupId,
						name: "Viaje a la costa",
						description: "2 invitaciones pendientes",
						currency: "ARS",
						createdAt: "2026-06-26T00:00:00.000Z",
						updatedAt: "2026-06-26T00:00:00.000Z",
					},
				],
			},
			isLoading: false,
		} as unknown as ReturnType<typeof useGroups>);
		mockUseAccountSummary.mockReturnValue({
			data: {
				totalGroups: 1,
				totalExpenses: 0,
				totalsByCurrency: [
					{ currency: "ARS", totalPaid: 0, totalOwed: 0, totalToReceive: 0 },
				],
				activeSince: "2026-06-27T12:15:29.827Z",
			},
			isLoading: false,
			isError: false,
			error: null,
		} as ReturnType<typeof useAccountSummary>);
		mockUsePersonalTransactions.mockReturnValue({
			transactions: [],
			total: 876371,
			incomeTotal: 876371,
			expenseTotal: 0,
			currency: "ARS",
			hasFetchedTransactions: true,
			isLoading: false,
			isError: false,
			error: null,
		});
		mockUsePersonalTransactionsSummary.mockReturnValue({
			summary: {
				total: 876371,
				incomeTotal: 876371,
				expenseTotal: 0,
				currency: "ARS",
				breakdown: [
					{
						category: "Salario",
						type: "income",
						amount: 876371,
						percentage: 100,
					},
				],
			},
			hasFetchedSummary: true,
			isLoading: false,
			isError: false,
			error: null,
		});
		jest
			.mocked(useNavigation)
			.mockImplementation(actualNavigation.useNavigation as never);
		jest
			.mocked(useRoute)
			.mockImplementation(actualNavigation.useRoute as never);

		jest.mocked(useGroupDetail).mockImplementation((id?: string) => {
			const group = useGroupsStore.getState().groups.find((g) => g.id === id);
			return {
				group: group
					? {
							id: group.id,
							name: group.name,
							category: group.category,
							totalExpense: 0,
							totalExpenseChangePercent: 0,
							owedToYou: 0,
							youOwe: 0,
						}
					: null,
				memberBalances: [],
				recentExpenses: [],
				totalExpensesCount: 0,
				isLoading: false,
			} as unknown as ReturnType<typeof useGroupDetail>;
		});
		jest.mocked(useGroupDetailActions).mockReturnValue({
			handleOpenSettings: jest.fn(),
			handleOpenBalances: jest.fn(),
			handleConfirmDelete: jest.fn(),
		} as unknown as ReturnType<typeof useGroupDetailActions>);
	});

	afterEach(() => {
		testClient?.clear();
	});

	it("registers all route names expected by the bootstrap spec", () => {
		expect(registeredRouteNames).toEqual([
			"Onboarding",
			"Auth",
			"GroupsList",
			"PersonalExpenses",
			"GroupDetail",
			"NewGroup",
			"AddExpense",
			"AddPersonalTransaction",
			"Calculator",
			"PersonalCategoryDetail",
			"SettleDebts",
			"VerifyEmail",
			"AcceptGroupInvitation",
			"Profile",
		]);
	});

	it("gates protected stack screens while the authenticated user is unverified", async () => {
		mockUseEmailVerificationStatus.mockReturnValue({
			data: { verified: false, verifiedAt: null },
			isLoading: false,
			isError: false,
			error: null,
		} as ReturnType<typeof useEmailVerificationStatus>);
		useAuthStore
			.getState()
			.setSession(
				{ id: "1", email: "a@b.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);

		const navigationRef = createNavigationContainerRef<RootStackParamList>();
		testClient = createTestQueryClient();
		const { findByText } = render(
			<QueryClientProvider client={testClient}>
				<NavigationContainer ref={navigationRef}>
					<RootNavigator />
				</NavigationContainer>
			</QueryClientProvider>,
		);

		await waitFor(() => expect(navigationRef.isReady()).toBe(true));

		act(() => {
			navigationRef.navigate("AddExpense");
		});
		expect(await findByText("Verificá tu email")).toBeOnTheScreen();

		act(() => {
			navigationRef.navigate("Calculator", {
				initialAmount: "100",
				sourceParams: { type: "expense" },
			});
		});
		await waitFor(() => {
			expect(navigationRef.getCurrentRoute()?.name).toBe("Calculator");
		});
		expect(await findByText("Verificá tu email")).toBeOnTheScreen();
	});

	it("renders auth stack while unauthenticated", async () => {
		const navigationRef = createNavigationContainerRef<RootStackParamList>();
		testClient = createTestQueryClient();
		const { findAllByText, findByText } = render(
			<QueryClientProvider client={testClient}>
				<NavigationContainer ref={navigationRef}>
					<RootNavigator />
				</NavigationContainer>
			</QueryClientProvider>,
		);

		expect((await findAllByText("Iniciar Sesión")).length).toBeGreaterThan(0);

		await waitFor(() => expect(navigationRef.isReady()).toBe(true));

		act(() => {
			navigationRef.navigate("Auth", { initialTab: "register" });
		});
		expect(await findByText("Crear Cuenta")).toBeOnTheScreen();
	});

	it("keeps verification and invitation deep-link routes reachable while unauthenticated", async () => {
		const navigationRef = createNavigationContainerRef<RootStackParamList>();
		testClient = createTestQueryClient();
		const { findAllByText, findByText } = render(
			<QueryClientProvider client={testClient}>
				<NavigationContainer ref={navigationRef}>
					<RootNavigator />
				</NavigationContainer>
			</QueryClientProvider>,
		);

		expect((await findAllByText("Iniciar Sesión")).length).toBeGreaterThan(0);
		await waitFor(() => expect(navigationRef.isReady()).toBe(true));

		act(() => {
			navigationRef.navigate("VerifyEmail");
		});

		expect(
			await findByText("El enlace de verificación no es válido"),
		).toBeOnTheScreen();

		act(() => {
			navigationRef.navigate("AcceptGroupInvitation", {
				token: "invite-token",
			});
		});

		await waitFor(() => {
			expect(useAuthStore.getState().pendingGroupInvitationToken).toBe(
				"invite-token",
			);
		});
		expect((await findAllByText("Iniciar Sesión")).length).toBeGreaterThan(0);
	});

	it("resumes a pending invitation deep-link after successful login", async () => {
		mockUseLogin.mockReturnValue({
			isPending: false,
			mutate: jest.fn((_variables, options) => {
				void options?.onSuccess?.({
					data: {
						accessToken: `header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
						refreshToken: "refresh-token",
						user: {
							id: "user-1",
							name: "Ada Lovelace",
							email: "ada@example.com",
						},
					},
				} as never);
			}),
		} as never);

		const navigationRef = createNavigationContainerRef<RootStackParamList>();
		testClient = createTestQueryClient();
		useAuthStore.getState().setPendingGroupInvitationToken("invite-token");

		const { findAllByText, getAllByPlaceholderText, getByTestId } = render(
			<QueryClientProvider client={testClient}>
				<NavigationContainer ref={navigationRef}>
					<RootNavigator />
				</NavigationContainer>
			</QueryClientProvider>,
		);

		expect((await findAllByText("Iniciar Sesión")).length).toBeGreaterThan(0);
		await waitFor(() => expect(navigationRef.isReady()).toBe(true));

		fireEvent.changeText(
			getAllByPlaceholderText("juan@ejemplo.com")[0],
			"ada@example.com",
		);
		fireEvent.changeText(
			getAllByPlaceholderText("••••••••")[0],
			"Password123!",
		);
		fireEvent.press(getByTestId("login-button"));

		await waitFor(() => {
			expect(mockAcceptGroupInvitation).toHaveBeenCalledWith("invite-token");
		});
		await waitFor(() => {
			expect(useAuthStore.getState().pendingGroupInvitationToken).toBeNull();
			expect(navigationRef.getCurrentRoute()?.name).toBe("GroupsList");
		});
	});

	it("renders main tabs while authenticated", async () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "1", email: "a@b.com" },
				`header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
			);

		testClient = createTestQueryClient();
		const {
			findByText,
			findByTestId,
			getAllByText,
			getByLabelText,
			getByText,
			queryByText,
		} = render(
			<QueryClientProvider client={testClient}>
				<NavigationContainer>
					<RootNavigator />
				</NavigationContainer>
			</QueryClientProvider>,
		);

		expect(
			await findByText("Cuentas Claras", {}, { timeout: 3000 }),
		).toBeOnTheScreen();
		expect(await findByText("Balance Neto Total")).toBeOnTheScreen();

		for (const tabLabel of mainTabLabels) {
			expect(getAllByText(tabLabel).length).toBeGreaterThan(0);
		}

		expect(queryByText("Saldos")).toBeNull();

		fireEvent.press(getByText("Grupos"));
		expect(await findByText("Balance Neto Total")).toBeOnTheScreen();

		fireEvent.press(getByLabelText("Abrir menú de creación"));
		expect(await findByText("Crear nuevo gasto")).toBeOnTheScreen();

		fireEvent.press(getByText("Gastos"));
		expect(
			await findByTestId(
				"personal-transactions-donut-chart",
				{},
				{ timeout: 3000 },
			),
		).toBeOnTheScreen();

		fireEvent.press(getByText("Perfil"));
		expect(await findByText("Alex Thompson")).toBeOnTheScreen();
		expect(await findByText("Cerrar Sesión")).toBeOnTheScreen();
	});

	it("navigates to registered stack screens and switches stacks when auth state changes", async () => {
		const navigationRef = createNavigationContainerRef<RootStackParamList>();
		testClient = createTestQueryClient();
		const { findByText, findAllByText, queryByText } = render(
			<QueryClientProvider client={testClient}>
				<NavigationContainer ref={navigationRef}>
					<RootNavigator />
				</NavigationContainer>
			</QueryClientProvider>,
		);

		expect((await findAllByText("Iniciar Sesión")).length).toBeGreaterThan(0);

		act(() => {
			useAuthStore
				.getState()
				.setSession(
					{ id: "1", email: "a@b.com" },
					`header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
				);
		});

		expect(
			await findByText("Cuentas Claras", {}, { timeout: 3000 }),
		).toBeOnTheScreen();
		expect(queryByText("Iniciar Sesión")).toBeNull();

		await waitFor(() => expect(navigationRef.isReady()).toBe(true));

		act(() => {
			navigationRef.navigate("GroupDetail", { groupId });
		});

		expect(await findByText("Viaje a la costa")).toBeOnTheScreen();

		act(() => {
			navigationRef.navigate("AddExpense");
		});

		expect(await findByText("Crear gasto")).toBeOnTheScreen();

		act(() => {
			useAuthStore.getState().clearSession();
		});

		expect((await findAllByText("Iniciar Sesión")).length).toBeGreaterThan(0);
		expect(queryByText("Viaje a la costa")).toBeNull();
	});

	it("resets to the auth stack when auth:logout is emitted", async () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "1", email: "a@b.com" },
				`header.${btoa(JSON.stringify({ emailVerified: true }))}.signature`,
			);

		testClient = createTestQueryClient();
		const { findByText, findAllByText, queryByText } = render(
			<QueryClientProvider client={testClient}>
				<NavigationContainer>
					<RootNavigator />
				</NavigationContainer>
			</QueryClientProvider>,
		);

		expect(
			await findByText("Cuentas Claras", {}, { timeout: 3000 }),
		).toBeOnTheScreen();
		expect(queryByText("Iniciar Sesión")).toBeNull();

		act(() => {
			emitAuthLogout();
		});

		expect((await findAllByText("Iniciar Sesión")).length).toBeGreaterThan(0);
		expect(queryByText("Te deben")).toBeNull();
	});
});
