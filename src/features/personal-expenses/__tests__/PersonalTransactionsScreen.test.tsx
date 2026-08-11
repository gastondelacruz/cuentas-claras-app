import { useNavigation } from "@react-navigation/native";
import {
	fireEvent,
	render,
	renderHook,
	screen,
	within,
} from "@testing-library/react-native";

import { PersonalTransactionsScreen } from "../screens/PersonalTransactionsScreen";
import { usePersonalTransactions } from "../hooks/usePersonalTransactions";
import { usePersonalTransactionsScreen } from "../hooks/usePersonalTransactionsScreen";
import { usePersonalTransactionsSummary } from "../hooks/usePersonalTransactionsSummary";
import { isEnhancedInitialLoadingEnabled } from "../../../shared/feature-flags/initialLoadingFlags";
import { prefetchAlternatePersonalTransactions } from "../api/personalTransactionPrefetch";
import { usePersonalCategories } from "../hooks/usePersonalCategories";
import { PERSONAL_CATEGORY_ICON_COMPONENTS } from "../constants/personalTransactionCategoryVisuals";

jest.mock("../hooks/usePersonalTransactions");
jest.mock("../hooks/usePersonalTransactionsSummary");
jest.mock("../../../shared/feature-flags/initialLoadingFlags");
jest.mock("../api/personalTransactionPrefetch");
jest.mock("../hooks/usePersonalCategories", () => ({
	usePersonalCategories: jest.fn(),
}));

const mockUseNavigation = jest.mocked(useNavigation);
const mockUsePersonalTransactions = jest.mocked(usePersonalTransactions);
const mockUsePersonalTransactionsSummary = jest.mocked(
	usePersonalTransactionsSummary,
);
const mockIsEnhancedInitialLoadingEnabled = jest.mocked(
	isEnhancedInitialLoadingEnabled,
);
const mockPrefetchAlternatePersonalTransactions = jest.mocked(
	prefetchAlternatePersonalTransactions,
);
const mockUsePersonalCategories = jest.mocked(usePersonalCategories);

// Pin "today" to 2026-06-29 (Monday) so the dynamic rangeLabel is deterministic.
// Expected default month label: "jun 2026"
const FAKE_NOW = new Date("2026-06-29T12:00:00.000Z");

describe("PersonalTransactionsScreen", () => {
	beforeEach(() => {
		jest.useFakeTimers({ now: FAKE_NOW });
		jest.clearAllMocks();
		mockIsEnhancedInitialLoadingEnabled.mockReturnValue(false);
		mockUsePersonalCategories.mockReturnValue({
			categories: [],
			isLoading: false,
			isError: false,
			error: null,
		});
		mockUseNavigation.mockReturnValue({
			getParent: () => ({ navigate: jest.fn() }),
		} as never);
		mockUsePersonalTransactions.mockReturnValue({
			transactions: [],
			total: 12500,
			incomeTotal: 0,
			expenseTotal: 12500,
			currency: "ARS",
			hasFetchedTransactions: true,
			isLoading: false,
			isError: false,
			error: null,
		});
		mockUsePersonalTransactionsSummary.mockReturnValue({
			summary: {
				total: 123629,
				incomeTotal: 500000,
				expenseTotal: 376371,
				currency: "ARS",
				breakdown: [
					{
						category: "Comida",
						type: "expense",
						amount: 15000,
						percentage: 75,
					},
					{
						category: "Salario",
						type: "income",
						amount: 500000,
						percentage: 100,
					},
				],
			},
			hasFetchedSummary: true,
			isLoading: false,
			isError: false,
			error: null,
		});
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("defaults to the month range for controls and initial queries", () => {
		render(<PersonalTransactionsScreen />);

		expect(
			screen.getByTestId("personal-range-month").props.accessibilityState,
		).toMatchObject({ selected: true });
		expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
			expect.objectContaining({ range: "month" }),
		);
		expect(mockUsePersonalTransactionsSummary).toHaveBeenLastCalledWith(
			expect.objectContaining({ range: "month" }),
		);
	});

	it("renders an honest expense empty state when the backend returns an empty list", () => {
		render(<PersonalTransactionsScreen />);

		// Total section: "Total" label + formatted amount
		expect(screen.getAllByText("Total")).toHaveLength(2);
		expect(screen.getByText("123.629 $")).toBeTruthy();
		expect(screen.getByText("376.371 $")).toBeTruthy();
		// Dynamic date range label: current month
		expect(screen.getByText("jun 2026")).toBeTruthy();
		expect(
			screen.getByLabelText("Ver detalle de la categoría Comida"),
		).toBeTruthy();
		expect(
			screen.getByLabelText("Comida representa 75% del total"),
		).toBeTruthy();
		expect(
			screen.getByTestId("personal-transactions-donut-chart"),
		).toBeTruthy();
		// Expense tab selected by default
		expect(
			screen.getByTestId("personal-tab-expense").props.accessibilityState,
		).toMatchObject({ selected: true });
	});

	it("uses the backend icon for a default category absent from the local catalog", () => {
		mockUsePersonalCategories.mockReturnValue({
			categories: [
				{
					id: "backend-first",
					name: "Backend First",
					type: "expense",
					icon: "Heart",
					color: "#22c55e",
					isDefault: true,
				},
				{
					id: "default-backend",
					name: "Backend Default",
					type: "expense",
					icon: "Car",
					color: "#22c55e",
					isDefault: true,
				},
			],
			isLoading: false,
			isError: false,
			error: null,
		});
		mockUsePersonalTransactionsSummary.mockReturnValue({
			summary: {
				total: 100,
				incomeTotal: 0,
				expenseTotal: 100,
				currency: "ARS",
				breakdown: [
					{
						category: "Backend Default",
						type: "expense",
						amount: 100,
						percentage: 100,
					},
				],
			},
			hasFetchedSummary: true,
			isLoading: false,
			isError: false,
			error: null,
		});

		const { result } = renderHook(() => usePersonalTransactionsScreen());

		expect(result.current.categoryRows[0]).toMatchObject({
			color: "#22c55e",
			Icon: PERSONAL_CATEGORY_ICON_COMPONENTS.Car,
		});
		expect(result.current.chartSegments[0]?.color).toBe("#22c55e");
	});

	it("uses exact category amounts and percentages from the summary", () => {
		mockUsePersonalTransactionsSummary.mockReturnValue({
			summary: {
				total: -5700,
				incomeTotal: 0,
				expenseTotal: 5700,
				currency: "ARS",
				breakdown: [
					{
						category: "Ocio",
						type: "expense",
						amount: 5100,
						percentage: 89.47,
					},
				],
			},
			hasFetchedSummary: true,
			isLoading: false,
			isError: false,
			error: null,
		});

		const { result } = renderHook(() => usePersonalTransactionsScreen());

		expect(result.current.categoryRows[0]).toMatchObject({
			category: "Ocio",
			amount: 5100,
			percentage: 89.47,
		});
	});

	it("switches to the income tab and shows income category rows", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-tab-income"));

		expect(
			screen.getByLabelText("Ver detalle de la categoría Salario"),
		).toBeTruthy();
		expect(screen.getByText("Salario")).toBeTruthy();
		expect(screen.queryByText("Ingresos Recientes")).toBeNull();
		expect(screen.queryByTestId("personal-expense-type-filters")).toBeNull();
		expect(
			screen.getByTestId("personal-tab-income").props.accessibilityState,
		).toMatchObject({ selected: true });
		expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
			expect.objectContaining({ type: "income", range: "month" }),
		);
	});

	it("uses the summary total for the top total when selected-tab list totals differ", () => {
		mockUsePersonalTransactions.mockImplementation(({ type }) => ({
			transactions: [],
			total: type === "income" ? 10000 : 2500,
			incomeTotal: 10000,
			expenseTotal: 2500,
			currency: "ARS",
			hasFetchedTransactions: true,
			isLoading: false,
			isError: false,
			error: null,
		}));

		mockUsePersonalTransactionsSummary.mockReturnValue({
			summary: {
				total: 123629,
				incomeTotal: 10000,
				expenseTotal: 2500,
				currency: "ARS",
				breakdown: [
					{
						category: "Compras",
						type: "expense",
						amount: 2500,
						percentage: 100,
					},
					{
						category: "Salario",
						type: "income",
						amount: 10000,
						percentage: 100,
					},
				],
			},
			hasFetchedSummary: true,
			isLoading: false,
			isError: false,
			error: null,
		});

		render(<PersonalTransactionsScreen />);

		expect(
			within(screen.getByTestId("personal-transactions-total")).getByText(
				"123.629 $",
			),
		).toBeTruthy();
		expect(screen.getAllByText("2.500 $")).toHaveLength(2);

		fireEvent.press(screen.getByTestId("personal-tab-income"));

		expect(screen.getAllByText("10.000 $")).toHaveLength(2);
	});

	it("keeps the summary top total unchanged when switching tabs", () => {
		mockUsePersonalTransactions.mockImplementation(({ type }) => ({
			transactions: [],
			total: type === "income" ? 10000 : 2500,
			incomeTotal: type === "income" ? 10000 : 0,
			expenseTotal: type === "expense" ? 2500 : 0,
			currency: "ARS",
			hasFetchedTransactions: true,
			isLoading: false,
			isError: false,
			error: null,
		}));

		mockUsePersonalTransactionsSummary.mockReturnValue({
			summary: {
				total: 123629,
				incomeTotal: 10000,
				expenseTotal: 2500,
				currency: "ARS",
				breakdown: [
					{
						category: "Compras",
						type: "expense",
						amount: 2500,
						percentage: 100,
					},
					{
						category: "Salario",
						type: "income",
						amount: 10000,
						percentage: 100,
					},
				],
			},
			hasFetchedSummary: true,
			isLoading: false,
			isError: false,
			error: null,
		});

		render(<PersonalTransactionsScreen />);

		expect(
			within(screen.getByTestId("personal-transactions-total")).getByText(
				"123.629 $",
			),
		).toBeTruthy();

		fireEvent.press(screen.getByTestId("personal-tab-income"));

		expect(
			within(screen.getByTestId("personal-transactions-total")).getByText(
				"123.629 $",
			),
		).toBeTruthy();
	});

	it("marks time filters as accessible selectable controls", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-range-month"));

		expect(
			screen.getByTestId("personal-range-month").props.accessibilityState,
		).toMatchObject({ selected: true });
		expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
			expect.objectContaining({ range: "month" }),
		);
	});

	it("opens the category detail screen from a category row", () => {
		const rootNavigate = jest.fn();
		mockUseNavigation.mockReturnValue({
			getParent: () => ({ navigate: rootNavigate }),
		} as never);

		render(<PersonalTransactionsScreen />);

		fireEvent.press(
			screen.getByLabelText("Ver detalle de la categoría Comida"),
		);

		expect(rootNavigate).toHaveBeenCalledWith("PersonalCategoryDetail", {
			type: "expense",
			category: "Comida",
			range: "month",
			from: undefined,
			to: undefined,
			expenseKind: undefined,
			percentage: 75,
		});
	});

	it("passes the tapped overview percentage to income category detail", () => {
		const rootNavigate = jest.fn();
		mockUseNavigation.mockReturnValue({
			getParent: () => ({ navigate: rootNavigate }),
		} as never);
		mockUsePersonalTransactionsSummary.mockReturnValue({
			summary: {
				total: 550000,
				incomeTotal: 550000,
				expenseTotal: 0,
				currency: "ARS",
				breakdown: [
					{
						category: "Intereses",
						type: "income",
						amount: 50000,
						percentage: 9.09,
					},
				],
			},
			hasFetchedSummary: true,
			isLoading: false,
			isError: false,
			error: null,
		});

		render(<PersonalTransactionsScreen />);
		fireEvent.press(screen.getByTestId("personal-tab-income"));
		fireEvent.press(
			screen.getByLabelText("Ver detalle de la categoría Intereses"),
		);

		expect(rootNavigate).toHaveBeenCalledWith("PersonalCategoryDetail", {
			type: "income",
			category: "Intereses",
			range: "month",
			from: undefined,
			to: undefined,
			expenseKind: undefined,
			percentage: 9.09,
		});
	});

	it("renders category summary rows with percentage bars", () => {
		render(<PersonalTransactionsScreen />);

		expect(screen.queryByTestId("personal-expense-type-filters")).toBeNull();
		expect(
			screen.getByLabelText("Ver detalle de la categoría Comida"),
		).toBeTruthy();
		expect(
			screen.getByLabelText("Comida representa 75% del total"),
		).toBeTruthy();
		expect(screen.getByText("Comida")).toBeTruthy();
		expect(screen.getByText("15.000 $")).toBeTruthy();
		expect(
			screen.getByTestId("personal-transactions-donut-chart"),
		).toBeTruthy();
	});

	it("navigates between standard periods and disables forward navigation at present", () => {
		render(<PersonalTransactionsScreen />);

		const previous = screen.getByTestId("personal-period-previous");
		const next = screen.getByTestId("personal-period-next");
		const current = screen.queryByTestId("personal-period-current");

		expect(next.props.accessibilityState).toMatchObject({ disabled: true });
		expect(current).toBeNull();

		fireEvent.press(previous);

		expect(screen.getByText("may 2026")).toBeTruthy();
		expect(
			screen.getByTestId("personal-period-next").props.accessibilityState,
		).toMatchObject({ disabled: false });
		expect(screen.getByTestId("personal-period-current")).toBeTruthy();

		fireEvent.press(screen.getByTestId("personal-period-current"));

		expect(screen.getByText("jun 2026")).toBeTruthy();
		expect(screen.queryByTestId("personal-period-current")).toBeNull();
		expect(
			screen.getByTestId("personal-period-next").props.accessibilityState,
		).toMatchObject({ disabled: true });
	});

	it("navigates day, week, month, and year ranges with their period size", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-range-day"));
		fireEvent.press(screen.getByTestId("personal-period-previous"));
		expect(screen.getByText("28 jun")).toBeTruthy();
		expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
			expect.objectContaining({
				range: "day",
				from: "2026-06-28T00:00:00.000Z",
				to: "2026-06-28T23:59:59.999Z",
			}),
		);

		fireEvent.press(screen.getByTestId("personal-range-week"));
		fireEvent.press(screen.getByTestId("personal-period-previous"));
		expect(screen.getByText("22 jun – 28 jun")).toBeTruthy();

		fireEvent.press(screen.getByTestId("personal-range-month"));
		fireEvent.press(screen.getByTestId("personal-period-previous"));
		expect(screen.getByText("may 2026")).toBeTruthy();

		fireEvent.press(screen.getByTestId("personal-range-year"));
		fireEvent.press(screen.getByTestId("personal-period-previous"));
		expect(screen.getByText("2025")).toBeTruthy();
	});

	it("does not navigate custom periods", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-range-period"));
		fireEvent.press(screen.getByTestId("period-apply-button"));

		expect(
			screen.getByTestId("personal-period-previous").props.accessibilityState,
		).toMatchObject({ disabled: true });
		expect(
			screen.getByTestId("personal-period-next").props.accessibilityState,
		).toMatchObject({ disabled: true });
	});

	it("queries the backend day range without custom from/to dates", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-range-day"));

		expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
			expect.objectContaining({ range: "day", from: undefined, to: undefined }),
		);
		expect(mockUsePersonalTransactionsSummary).toHaveBeenLastCalledWith(
			expect.objectContaining({ range: "day", from: undefined, to: undefined }),
		);
	});

	it("navigates to the add personal transaction screen from the FAB", () => {
		const rootNavigate = jest.fn();
		mockUseNavigation.mockReturnValue({
			getParent: () => ({ navigate: rootNavigate }),
		} as never);

		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("add-personal-transaction-fab"));

		expect(rootNavigate).toHaveBeenCalledWith("AddPersonalTransaction", {
			type: "expense",
		});
	});

	it("passes the occurredAt date from the latest created or modified transaction", () => {
		const rootNavigate = jest.fn();
		mockUseNavigation.mockReturnValue({
			getParent: () => ({ navigate: rootNavigate }),
		} as never);
		mockUsePersonalTransactions.mockReturnValue({
			transactions: [
				{
					id: "older",
					type: "expense",
					expenseKind: "variable",
					amount: 100,
					currency: "ARS",
					category: "Comida",
					accountId: "account-1",
					accountName: "Pesos",
					occurredAt: "2026-06-28T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-28T12:00:00.000Z",
					updatedAt: "2026-06-30T12:00:00.000Z",
				},
				{
					id: "newer",
					type: "expense",
					expenseKind: "variable",
					amount: 200,
					currency: "ARS",
					category: "Comida",
					accountId: "account-1",
					accountName: "Pesos",
					occurredAt: "2026-06-27T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-29T12:00:00.000Z",
					updatedAt: "2026-06-29T12:00:00.000Z",
				},
			],
			total: 300,
			incomeTotal: 0,
			expenseTotal: 300,
			currency: "ARS",
			hasFetchedTransactions: true,
			isLoading: false,
			isError: false,
			error: null,
		});

		render(<PersonalTransactionsScreen />);
		fireEvent.press(screen.getByTestId("add-personal-transaction-fab"));

		expect(rootNavigate).toHaveBeenCalledWith("AddPersonalTransaction", {
			type: "expense",
			latestTransactionDate: "2026-06-28T12:00:00.000Z",
		});
	});

	it("renders the white card that wraps tabs, filters, date nav and content", () => {
		render(<PersonalTransactionsScreen />);

		expect(screen.getByTestId("personal-transactions-card")).toBeTruthy();
	});

	it("reuses the shared app top bar instead of rendering custom header actions", () => {
		render(<PersonalTransactionsScreen />);

		expect(screen.getByText("Cuentas Claras")).toBeTruthy();
		expect(screen.queryByLabelText("Buscar")).toBeNull();
		expect(screen.queryByLabelText("Ajustes")).toBeNull();
	});

	it("renders the total section outside the card, not as a child of it", () => {
		render(<PersonalTransactionsScreen />);

		const total = screen.getByTestId("personal-transactions-total");
		const card = screen.getByTestId("personal-transactions-card");

		expect(total).toBeTruthy();
		expect(card).toBeTruthy();
		// The total section must be a sibling before the card, not nested inside it.
		expect(
			within(card).queryByTestId("personal-transactions-total"),
		).toBeNull();
	});

	it("keeps the FAB visible after switching to the income tab", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-tab-income"));

		expect(screen.getByTestId("add-personal-transaction-fab")).toBeTruthy();
	});

	it("renders loading and error states inside the Stitch card content area", () => {
		mockUsePersonalTransactions.mockReturnValueOnce({
			transactions: [],
			total: 0,
			incomeTotal: 0,
			expenseTotal: 0,
			currency: "ARS",
			hasFetchedTransactions: false,
			isLoading: true,
			isError: false,
			error: null,
		});

		render(<PersonalTransactionsScreen />);
		expect(screen.getByText("Cargando movimientos...")).toBeTruthy();
		expect(screen.queryByText("123.629 $")).toBeNull();
		expect(screen.getByTestId("personal-transactions-total")).toBeTruthy();
		expect(
			within(screen.getByTestId("personal-transactions-total")).getByText(
				"0 $",
			),
		).toBeTruthy();

		mockUsePersonalTransactionsSummary.mockReturnValueOnce({
			summary: undefined,
			hasFetchedSummary: false,
			isLoading: false,
			isError: true,
			error: new Error("summary boom"),
		});
		mockUsePersonalTransactions.mockReturnValueOnce({
			transactions: [],
			total: 0,
			incomeTotal: 0,
			expenseTotal: 0,
			currency: "ARS",
			hasFetchedTransactions: false,
			isLoading: false,
			isError: true,
			error: new Error("boom"),
		});

		render(<PersonalTransactionsScreen />);
		expect(screen.getByText("No pudimos cargar tus movimientos")).toBeTruthy();
		expect(screen.queryByText("123.629 $")).toBeNull();
		expect(screen.queryByTestId("personal-transactions-total")).toBeNull();
	});

	it("renders stable skeleton placeholders instead of hiding large sections when enhanced loading is enabled", () => {
		mockIsEnhancedInitialLoadingEnabled.mockReturnValue(true);
		mockUsePersonalTransactions.mockReturnValue({
			transactions: [],
			total: 0,
			incomeTotal: 0,
			expenseTotal: 0,
			currency: "ARS",
			hasFetchedTransactions: false,
			isLoading: true,
			isError: false,
			error: null,
		});
		mockUsePersonalTransactionsSummary.mockReturnValue({
			summary: undefined,
			hasFetchedSummary: false,
			isLoading: true,
			isError: false,
			error: null,
		});

		render(<PersonalTransactionsScreen />);

		expect(
			screen.getByTestId("personal-transactions-loading-skeleton"),
		).toBeTruthy();
		expect(screen.getByTestId("personal-transactions-total")).toBeTruthy();
		expect(
			within(screen.getByTestId("personal-transactions-total")).getByText(
				"0 $",
			),
		).toBeTruthy();
		expect(
			screen.queryByTestId("personal-transactions-total-skeleton"),
		).toBeNull();
		expect(screen.queryByText("Gastos Recientes")).toBeNull();
		expect(
			screen.getByLabelText("Cargando transacciones personales"),
		).toBeTruthy();
		expect(screen.queryByText("Cargando movimientos...")).toBeNull();
	});

	it("prefetches the alternate default transaction type to warm the first tab switch", () => {
		mockIsEnhancedInitialLoadingEnabled.mockReturnValue(true);

		render(<PersonalTransactionsScreen />);

		expect(mockPrefetchAlternatePersonalTransactions).toHaveBeenCalledWith({
			type: "expense",
			range: "month",
			from: undefined,
			to: undefined,
		});

		fireEvent.press(screen.getByTestId("personal-tab-income"));

		expect(mockPrefetchAlternatePersonalTransactions).toHaveBeenLastCalledWith({
			type: "income",
			range: "month",
			from: undefined,
			to: undefined,
		});
	});

	it("passes the active range to the real summary query", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-range-month"));

		expect(mockUsePersonalTransactionsSummary).toHaveBeenLastCalledWith(
			expect.objectContaining({ range: "month" }),
		);
	});

	it("opens the period selector modal and applies a custom period range", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-range-period"));

		expect(screen.getByTestId("period-selection-modal")).toBeTruthy();
		expect(screen.getByText("Seleccionar Período")).toBeTruthy();
		expect(screen.getByTestId("period-from-field")).toBeTruthy();
		expect(screen.getByTestId("period-to-field")).toBeTruthy();
		expect(screen.getByTestId("period-calendar-grid")).toBeTruthy();

		fireEvent.press(screen.getByTestId("period-apply-button"));

		expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
			expect.objectContaining({
				range: "period",
				from: "2026-06-01T00:00:00.000Z",
				to: "2026-06-29T23:59:59.999Z",
			}),
		);
		expect(mockUsePersonalTransactionsSummary).toHaveBeenLastCalledWith(
			expect.objectContaining({
				range: "period",
				from: "2026-06-01T00:00:00.000Z",
				to: "2026-06-29T23:59:59.999Z",
			}),
		);
	});

	it("applies picker-selected period dates in chronological order", () => {
		render(<PersonalTransactionsScreen />);

		fireEvent.press(screen.getByTestId("personal-range-period"));

		fireEvent.press(screen.getByTestId("period-day-2026-06-10"));

		fireEvent.press(screen.getByTestId("period-from-field"));
		fireEvent.press(screen.getByTestId("period-day-2026-06-20"));

		fireEvent.press(screen.getByTestId("period-apply-button"));

		expect(mockUsePersonalTransactions).toHaveBeenLastCalledWith(
			expect.objectContaining({
				range: "period",
				from: "2026-06-10T00:00:00.000Z",
				to: "2026-06-20T23:59:59.999Z",
			}),
		);
	});
});
