import {
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react-native";

import { usePersonalCategoryDetailScreen } from "../hooks/usePersonalCategoryDetailScreen";
import { PersonalCategoryDetailScreen } from "../screens/PersonalCategoryDetailScreen";

jest.mock("../hooks/usePersonalCategoryDetailScreen");

const mockUsePersonalCategoryDetailScreen = jest.mocked(
	usePersonalCategoryDetailScreen,
);

const baseReturnValue = {
	category: "Comida",
	type: "expense" as const,
	rangeLabel: "29 jun – 5 jul",
	expenseKindFilter: "all" as const,
	setExpenseKindFilter: jest.fn(),
	categoryVisual: {
		color: "#f59e0b",
		Icon: (() => null) as never,
	},
	transactions: [
		{
			id: "ptx-1",
			type: "expense" as const,
			expenseKind: "variable" as const,
			amount: 3200,
			currency: "ARS",
			category: "Comida",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-29T12:00:00.000Z",
			note: null,
			createdAt: "2026-06-29T12:00:00.000Z",
			updatedAt: "2026-06-29T12:00:00.000Z",
		},
	],
	displayTotal: 3200,
	displayCurrency: "ARS",
	displayTotalLabel: "3.200 $",
	displayShareLabel: "18% del total",
	isLoading: false,
	isError: false,
	error: null,
	hasFetchedTransactions: true,
	navigateToEditTransaction: jest.fn(),
	formatDate: () => "29 de jun de 2026",
};

describe("PersonalCategoryDetailScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUsePersonalCategoryDetailScreen.mockReturnValue(baseReturnValue);
	});

	it("renders the expense category detail with the centered summary card and external chips", () => {
		render(<PersonalCategoryDetailScreen />);

		const summaryCard = screen.getByTestId("personal-category-summary-card");
		const transactionsSection = screen.getByTestId(
			"personal-category-transactions-section",
		);
		const transactionItem = screen.getByTestId(
			"personal-category-transaction-item-ptx-1",
		);
		const sectionChildren = (
			Array.isArray(transactionsSection.props.children)
				? transactionsSection.props.children
				: [transactionsSection.props.children]
		) as unknown[];
		const getChildTestId = (child: unknown) =>
			typeof child === "object" &&
			child !== null &&
			"props" in child &&
			typeof (child as { props?: { testID?: string } }).props?.testID ===
				"string"
				? (child as { props?: { testID?: string } }).props?.testID
				: undefined;
		const headingIndex = sectionChildren.findIndex(
			(child) =>
				getChildTestId(child) === "personal-category-transactions-heading",
		);
		const filtersIndex = sectionChildren.findIndex(
			(child) =>
				getChildTestId(child) === "personal-category-expense-filter-container",
		);
		const transactionChildren = Array.isArray(transactionItem.props.children)
			? transactionItem.props.children
			: [transactionItem.props.children];
		const rightSideChildren = Array.isArray(
			transactionChildren[1].props.children,
		)
			? transactionChildren[1].props.children
			: [transactionChildren[1].props.children];

		expect(screen.getAllByText("Comida")).toHaveLength(2);
		expect(
			within(summaryCard).getByText("Gasto · 29 jun – 5 jul"),
		).toBeTruthy();
		expect(within(summaryCard).getByText("3.200 $")).toBeTruthy();
		expect(within(summaryCard).getByText("18% del total")).toBeTruthy();
		expect(
			within(summaryCard).queryByTestId("personal-expense-type-filters"),
		).toBeNull();
		expect(screen.getByTestId("personal-expense-type-filters")).toBeTruthy();
		expect(screen.getByText("Transacciones")).toBeTruthy();
		expect(headingIndex).toBeGreaterThanOrEqual(0);
		expect(filtersIndex).toBeGreaterThan(headingIndex);
		expect(rightSideChildren).toHaveLength(1);
		expect(screen.queryByText("Movimientos")).toBeNull();
		expect(screen.getByText("29 de jun de 2026")).toBeTruthy();
		expect(screen.getByText("VARIABLE")).toBeTruthy();

		fireEvent.press(
			screen.getByLabelText("Editar gasto personal Comida por 3.200 $"),
		);

		expect(baseReturnValue.navigateToEditTransaction).toHaveBeenCalled();
	});

	it("hides the fixed/variable chips for income categories", () => {
		mockUsePersonalCategoryDetailScreen.mockReturnValueOnce({
			...baseReturnValue,
			type: "income",
			expenseKindFilter: "all",
			transactions: [
				{
					id: "ptx-income-1",
					type: "income" as const,
					expenseKind: null,
					amount: 500000,
					currency: "ARS",
					category: "Salario",
					accountId: "account-ars",
					accountName: "Pesos",
					occurredAt: "2026-06-29T12:00:00.000Z",
					note: null,
					createdAt: "2026-06-29T12:00:00.000Z",
					updatedAt: "2026-06-29T12:00:00.000Z",
				},
			],
			displayTotalLabel: "500.000 $",
			displayShareLabel: "100% del total",
		});

		render(<PersonalCategoryDetailScreen />);

		expect(
			screen.queryByTestId("personal-category-expense-filter-container"),
		).toBeNull();
		expect(screen.getByText("500.000 $")).toBeTruthy();
		expect(screen.getByText("100% del total")).toBeTruthy();
		expect(
			screen.getByLabelText("Editar ingreso personal Salario por 500.000 $"),
		).toBeTruthy();
	});
});
