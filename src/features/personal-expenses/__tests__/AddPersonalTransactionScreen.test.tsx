import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddPersonalTransactionScreen } from "../screens/AddPersonalTransactionScreen";
import {
	createPersonalTransaction,
	updatePersonalTransaction,
	deletePersonalTransaction,
} from "../api/personalTransactionsApi";
import { PERSONAL_CATEGORY_CONFIGS } from "../constants/personalTransactionCategoryVisuals";
import { getMockEditablePersonalTransaction } from "../mocks/personalTransactionEditMock";

jest.mock("../api/personalTransactionsApi", () => ({
	createPersonalTransaction: jest.fn(),
	updatePersonalTransaction: jest.fn(),
	deletePersonalTransaction: jest.fn(),
}));

jest.mock("../mocks/personalTransactionEditMock", () => ({
	getMockEditablePersonalTransaction: jest.fn(),
}));

const mockCreatePersonalTransaction = jest.mocked(createPersonalTransaction);
const mockUpdatePersonalTransaction = jest.mocked(updatePersonalTransaction);
const mockDeletePersonalTransaction = jest.mocked(deletePersonalTransaction);
const mockGetMockEditablePersonalTransaction = jest.mocked(
	getMockEditablePersonalTransaction,
);

let testClient: QueryClient;
let navigationMock: {
	goBack: jest.Mock;
	navigate: jest.Mock;
	setParams: jest.Mock;
};

// Pin "today" to 2026-06-29 (Monday) so date-chip labels are deterministic
const FAKE_NOW = new Date("2026-06-29T12:00:00.000Z");

function Wrapper({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
	);
}

describe("AddPersonalTransactionScreen", () => {
	beforeEach(() => {
		jest.useFakeTimers({ now: FAKE_NOW });
		jest.clearAllMocks();
		jest.mocked(useSafeAreaInsets).mockReturnValue({
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		});
		testClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false, gcTime: Infinity },
				mutations: { retry: false, gcTime: Infinity },
			},
		});
		navigationMock = {
			goBack: jest.fn(),
			navigate: jest.fn(),
			setParams: jest.fn(),
		};
		jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { type: "expense" } } as never);
		mockCreatePersonalTransaction.mockResolvedValue({
			id: "ptx-1",
			type: "expense",
			expenseKind: "variable",
			amount: 12500,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-29T12:00:00.000Z",
			note: null,
			createdAt: "2026-06-29T12:00:00.000Z",
			updatedAt: "2026-06-29T12:00:00.000Z",
		});
		mockGetMockEditablePersonalTransaction.mockReturnValue(undefined);
		mockDeletePersonalTransaction.mockResolvedValue(undefined);
		mockUpdatePersonalTransaction.mockResolvedValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Updated note",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-29T12:00:00.000Z",
		});
	});

	afterEach(() => {
		jest.useRealTimers();
		testClient.clear();
	});

	it("renders the add expense form with Stitch categories, expense type selector, account, and date chips", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		// Header title
		expect(screen.getByText("Añadir transacciones")).toBeTruthy();
		// Account section: label + value as separate elements
		expect(screen.getByText("Cuenta")).toBeTruthy();
		expect(screen.getByText("Pesos")).toBeTruthy();
		// Expense categories
		for (const category of PERSONAL_CATEGORY_CONFIGS.expense) {
			expect(screen.getByText(category.name)).toBeTruthy();
		}
		// Expense-only type selector
		expect(screen.getByTestId("personal-expense-type-selector")).toBeTruthy();
		expect(screen.getByText("Tipo de Gasto")).toBeTruthy();
		expect(screen.getByText("Variable")).toBeTruthy();
		expect(screen.getByText("Fijo")).toBeTruthy();
		expect(
			screen.getByTestId("personal-expense-type-variable").props
				.accessibilityState,
		).toMatchObject({
			selected: true,
		});
		// Dynamic date chip labels derived from FAKE_NOW (2026-06-29)
		expect(screen.getByText("29/6 hoy")).toBeTruthy();
		expect(screen.getByText("28/6 ayer")).toBeTruthy();
		expect(screen.getByText("14/9 último")).toBeTruthy();
		// Submit button copy for expense
		expect(screen.getByText("Añadir")).toBeTruthy();
	});

	it("updates the expense type selector when tapping fixed", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-expense-type-fixed"));

		expect(
			screen.getByTestId("personal-expense-type-fixed").props
				.accessibilityState,
		).toMatchObject({
			selected: true,
		});
		expect(
			screen.getByTestId("personal-expense-type-variable").props
				.accessibilityState,
		).toMatchObject({
			selected: false,
		});
	});

	it("submits an expense transaction payload and navigates back", async () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"12.500",
		);
		fireEvent.press(screen.getByTestId("personal-category-Café"));

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "expense",
					amount: 12500,
					currency: "ARS",
					category: "Café",
				}),
				expect.any(Object),
			);
		});
		// Regression: the frontend must never send a hardcoded fake accountId.
		// The backend defaults to the user's default account when accountId is omitted.
		const submittedPayload = mockCreatePersonalTransaction.mock.calls[0][0];
		expect(submittedPayload.accountId).toBeUndefined();
		expect(submittedPayload).not.toHaveProperty("accountId");
		expect(submittedPayload.expenseKind).toBe("variable");
		expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
	});

	it("submits the selected fixed expense kind on create", async () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-expense-type-fixed"));
		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"12.500",
		);
		fireEvent.press(screen.getByTestId("personal-category-Café"));

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "expense",
					expenseKind: "fixed",
					amount: 12500,
					category: "Café",
				}),
				expect.any(Object),
			);
		});
	});

	it("renders income categories and submit copy for the income route", () => {
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { type: "income" } } as never);

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(screen.getByText("Salario")).toBeTruthy();
		expect(screen.getByText("Regalos")).toBeTruthy();
		expect(screen.getByText("Intereses")).toBeTruthy();
		// Bug 3: the "Otros" category must not exist on the income form.
		expect(screen.queryByText("Otros")).toBeNull();
		expect(screen.queryByTestId("personal-category-Otros")).toBeNull();
		expect(screen.queryByTestId("personal-expense-type-selector")).toBeNull();
		expect(screen.queryByText("Tipo de Gasto")).toBeNull();
		expect(screen.getByText("Añadir Ingreso")).toBeTruthy();
		expect(
			screen.getByTestId("personal-form-tab-income").props.accessibilityState,
		).toMatchObject({ selected: true });
	});

	it("submits an income transaction payload", async () => {
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { type: "income" } } as never);

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"876.371",
		);
		fireEvent.press(screen.getByTestId("personal-category-Salario"));

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "income",
					amount: 876371,
					category: "Salario",
				}),
				expect.any(Object),
			);
		});
		expect(mockCreatePersonalTransaction.mock.calls[0][0]).not.toHaveProperty(
			"expenseKind",
		);
	});

	// ── Blocker 2 regression tests ───────────────────────────────────────────────

	it('tapping "hoy" chip submits occurredAt equal to today at noon UTC', async () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"100",
		);
		// "hoy" is selected by default — pressing it again keeps it selected
		fireEvent.press(screen.getByTestId("personal-date-today"));

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalledWith(
				expect.objectContaining({ occurredAt: "2026-06-29T12:00:00.000Z" }),
				expect.any(Object),
			);
		});
	});

	it('tapping "ayer" chip submits occurredAt equal to yesterday at noon UTC', async () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"100",
		);
		fireEvent.press(screen.getByTestId("personal-date-yesterday"));

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalledWith(
				expect.objectContaining({ occurredAt: "2026-06-28T12:00:00.000Z" }),
				expect.any(Object),
			);
		});
	});

	// ── Fix 2 regression tests: category selection state ─────────────────────────

	it("marks the tapped category as selected", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-category-Salud"));

		expect(
			screen.getByTestId("personal-category-Salud").props.accessibilityState,
		).toMatchObject({
			selected: true,
		});
	});

	it("deselects the previous category when a different one is tapped", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-category-Salud"));
		fireEvent.press(screen.getByTestId("personal-category-Ocio"));

		expect(
			screen.getByTestId("personal-category-Ocio").props.accessibilityState,
		).toMatchObject({
			selected: true,
		});
		expect(
			screen.getByTestId("personal-category-Salud").props.accessibilityState,
		).toMatchObject({
			selected: false,
		});
	});

	it("renders the selected category cell with a rounded-rectangle background color", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		const saludCell = screen.getByTestId("personal-category-Salud");
		expect(saludCell.props.style).toMatchObject({
			backgroundColor: "#ef4444",
			borderRadius: 16,
		});
	});

	it("selects the first expense category by default on initial render", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(
			screen.getByTestId("personal-category-Salud").props.accessibilityState,
		).toMatchObject({
			selected: true,
		});
	});

	it("selects the first income category by default on initial render", () => {
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { type: "income" } } as never);

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(
			screen.getByTestId("personal-category-Salario").props.accessibilityState,
		).toMatchObject({
			selected: true,
		});
	});

	it('does not render the "Más" category', () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(screen.queryByText("Más")).toBeNull();
		expect(screen.queryByTestId("personal-category-Más")).toBeNull();
	});

	it("keeps Otros available only for expenses", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(screen.getByTestId("personal-category-Otros")).toBeTruthy();

		fireEvent.press(screen.getByTestId("personal-form-tab-income"));

		expect(screen.queryByTestId("personal-category-Otros")).toBeNull();
	});

	it("selects the first income category automatically when switching from expense to income", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-form-tab-income"));

		expect(
			screen.getByTestId("personal-category-Salario").props.accessibilityState,
		).toMatchObject({
			selected: true,
		});
		expect(screen.queryByTestId("personal-expense-type-selector")).toBeNull();
	});

	// ── Fix 3 regression tests: calendar date picker and custom date chip ────────

	it("makes the calendar button tappable and no longer disabled", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		const calendarButton = screen.getByTestId("personal-date-calendar");
		expect(calendarButton.props.accessibilityState).not.toMatchObject({
			disabled: true,
		});
		expect(calendarButton.props.disabled).not.toBe(true);
		fireEvent.press(calendarButton);
		expect(screen.getByTestId("single-date-selection-modal")).toBeTruthy();
	});

	it("opens the single-date calendar without period fields", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-date-calendar"));

		expect(screen.getByTestId("single-date-selection-modal")).toBeTruthy();
		expect(screen.queryByText("Desde")).toBeNull();
		expect(screen.queryByText("Hasta")).toBeNull();
	});

	it("applies a selected date, closes the modal, and renders a selected custom chip", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-date-calendar"));
		fireEvent.press(screen.getByTestId("single-date-day-2026-06-25"));
		fireEvent.press(screen.getByTestId("single-date-apply-button"));

		expect(screen.queryByTestId("single-date-selection-modal")).toBeNull();
		const customChip = screen.getByTestId("date-chip-custom");
		expect(customChip.props.accessibilityState).toMatchObject({
			selected: true,
		});
	});

	it("submits the custom date as occurredAt when the custom chip is selected", async () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"100",
		);
		fireEvent.press(screen.getByTestId("personal-date-calendar"));
		fireEvent.press(screen.getByTestId("single-date-day-2026-06-25"));
		fireEvent.press(screen.getByTestId("single-date-apply-button"));

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalledWith(
				expect.objectContaining({ occurredAt: "2026-06-25T12:00:00.000Z" }),
				expect.any(Object),
			);
		});
	});

	// ── Descripción (note) field ──────────────────────────────────────────────

	it('renders a "Descripción" label and a note input', () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(screen.getByText("Descripción")).toBeTruthy();
		expect(screen.getByTestId("personal-note-input")).toBeTruthy();
	});

	it("shows the expense note placeholder on the GASTOS tab", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(screen.getByTestId("personal-note-input").props.placeholder).toBe(
			"¿En qué gastaste?",
		);
	});

	it("shows the income note placeholder after switching to the INGRESOS tab", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-form-tab-income"));

		expect(screen.getByTestId("personal-note-input").props.placeholder).toBe(
			"¿De qué es este ingreso?",
		);
	});

	it("submits the trimmed note in the create payload when provided", async () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"100",
		);
		fireEvent.changeText(
			screen.getByTestId("personal-note-input"),
			"  Farmacia  ",
		);

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalledWith(
				expect.objectContaining({ note: "Farmacia" }),
				expect.any(Object),
			);
		});
	});

	it("omits the note key from the payload when the note is empty", async () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"100",
		);

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalled();
		});

		const submittedPayload = mockCreatePersonalTransaction.mock.calls[0][0];
		expect("note" in submittedPayload).toBe(false);
		expect(submittedPayload.note).toBeUndefined();
	});

	it("pre-fills the selected expense when opened in edit mode", () => {
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", transactionId: "ptx-edit-expense" },
		} as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Farmacia",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-28T12:00:00.000Z",
		});

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(screen.getByText("Editar transacción")).toBeTruthy();
		expect(
			screen.getByTestId("personal-transaction-amount-input").props.value,
		).toBe("45.000");
		expect(screen.getByTestId("personal-note-input").props.value).toBe(
			"Farmacia",
		);
		expect(
			screen.getByTestId("personal-category-Salud").props.accessibilityState,
		).toMatchObject({
			selected: true,
		});
		expect(screen.getByTestId("personal-expense-type-selector")).toBeTruthy();
		expect(screen.getByText("Guardar cambios")).toBeTruthy();

		fireEvent.press(screen.getByTestId("personal-date-calendar"));
		expect(
			screen.getByTestId("single-date-day-2026-06-28").props.accessibilityState,
		).toMatchObject({ selected: true });
	});

	it("pre-fills the selected income when opened in edit mode", () => {
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "income", transactionId: "ptx-edit-income" },
		} as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-income",
			type: "income",
			expenseKind: null,
			amount: 500000,
			currency: "ARS",
			category: "Salario",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-29T12:00:00.000Z",
			note: "Junio",
			createdAt: "2026-06-29T12:00:00.000Z",
			updatedAt: "2026-06-29T12:00:00.000Z",
		});

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		expect(
			screen.getByTestId("personal-form-tab-income").props.accessibilityState,
		).toMatchObject({
			selected: true,
		});
		expect(
			screen.getByTestId("personal-transaction-amount-input").props.value,
		).toBe("500.000");
		expect(screen.getByTestId("personal-note-input").props.value).toBe("Junio");
		expect(
			screen.getByTestId("personal-category-Salario").props.accessibilityState,
		).toMatchObject({
			selected: true,
		});
	});

	it("submits edit mode through the real update endpoint without calling create", async () => {
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", transactionId: "ptx-edit-expense" },
		} as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Farmacia",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-28T12:00:00.000Z",
		});

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"46.000",
		);
		fireEvent.changeText(
			screen.getByTestId("personal-note-input"),
			"  Farmacia editada  ",
		);
		fireEvent.press(screen.getByTestId("personal-expense-type-fixed"));

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockUpdatePersonalTransaction).toHaveBeenCalledWith(
				"ptx-edit-expense",
				expect.objectContaining({
					type: "expense",
					expenseKind: "fixed",
					amount: 46000,
					category: "Salud",
					note: "Farmacia editada",
				}),
			);
		});
		expect(mockCreatePersonalTransaction).not.toHaveBeenCalled();
		expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
	});

	it("sends note: null to clear the note when the note field is emptied in edit mode", async () => {
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", transactionId: "ptx-edit-expense" },
		} as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Farmacia",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-28T12:00:00.000Z",
		});

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.changeText(screen.getByTestId("personal-note-input"), "");

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockUpdatePersonalTransaction).toHaveBeenCalledWith(
				"ptx-edit-expense",
				expect.objectContaining({ note: null }),
			);
		});
	});

	it("keeps edit-mode actions after the date controls in safe-area-aware scroll flow", () => {
		jest.mocked(useSafeAreaInsets).mockReturnValue({
			top: 0,
			right: 0,
			bottom: 34,
			left: 0,
		});
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", transactionId: "ptx-edit-expense" },
		} as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Farmacia",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-29T12:00:00.000Z",
		});

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		let actionGroup = screen.getByTestId(
			"submit-personal-transaction-button",
		).parent;
		while (
			actionGroup?.parent &&
			StyleSheet.flatten(actionGroup.props.style).paddingBottom === undefined
		) {
			actionGroup = actionGroup.parent;
		}
		const dateControl = screen.getByTestId("personal-date-calendar");
		const dateAncestors = [dateControl];
		let dateAncestor = dateControl.parent;
		while (dateAncestor) {
			dateAncestors.push(dateAncestor);
			dateAncestor = dateAncestor.parent;
		}
		const actionAncestors = actionGroup ? [actionGroup] : [];
		let actionAncestor = actionGroup?.parent;
		while (actionAncestor) {
			actionAncestors.push(actionAncestor);
			actionAncestor = actionAncestor.parent;
		}
		const commonAncestor = dateAncestors.find((ancestor) =>
			actionAncestors.includes(ancestor),
		);
		const dateBranch =
			dateAncestors[dateAncestors.indexOf(commonAncestor!) - 1];
		const actionsBranch =
			actionAncestors[actionAncestors.indexOf(commonAncestor!) - 1];

		expect(actionGroup).not.toBeNull();
		expect(commonAncestor).toBeDefined();
		const dateIndex = commonAncestor?.children.indexOf(dateBranch) ?? -1;
		const actionsIndex = commonAncestor?.children.indexOf(actionsBranch) ?? -1;
		expect(dateIndex).toBeGreaterThanOrEqual(0);
		expect(actionsIndex).toBeGreaterThan(dateIndex);
		expect(StyleSheet.flatten(actionGroup?.props.style)).toMatchObject({
			paddingBottom: 34,
		});
		expect(StyleSheet.flatten(actionGroup?.props.style).position).not.toBe(
			"absolute",
		);
	});

	it("renders and confirms delete in edit mode", async () => {
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", transactionId: "ptx-edit-expense" },
		} as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Farmacia",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-29T12:00:00.000Z",
		});
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });
		expect(
			screen.getByTestId("delete-personal-transaction-button"),
		).toBeTruthy();
		const alertButtons = jest.spyOn(require("react-native").Alert, "alert");
		fireEvent.press(screen.getByTestId("delete-personal-transaction-button"));
		expect(alertButtons).toHaveBeenCalled();
		const buttons = alertButtons.mock.calls.at(-1)?.[2] as Array<{
			text: string;
			onPress?: () => void;
		}>;
		buttons.find((button) => button.text === "Eliminar")?.onPress?.();
		await waitFor(() =>
			expect(mockDeletePersonalTransaction.mock.calls[0]?.[0]).toBe(
				"ptx-edit-expense",
			),
		);
		alertButtons.mockRestore();
	});

	it("shows deletion failure feedback and stays on the edit screen", async () => {
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", transactionId: "ptx-edit-expense" },
		} as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Farmacia",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-29T12:00:00.000Z",
		});
		mockDeletePersonalTransaction.mockRejectedValueOnce(new Error("network"));
		const alertSpy = jest.spyOn(require("react-native").Alert, "alert");
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("delete-personal-transaction-button"));
		const confirmationButtons = alertSpy.mock.calls.at(-1)?.[2] as Array<{
			text: string;
			onPress?: () => void;
		}>;
		await act(async () => {
			confirmationButtons
				.find((button) => button.text === "Eliminar")
				?.onPress?.();
		});

		await waitFor(() =>
			expect(alertSpy).toHaveBeenLastCalledWith(
				"No pudimos eliminar la transacción",
				"Intentá de nuevo.",
			),
		);
		expect(navigationMock.goBack).not.toHaveBeenCalled();
		alertSpy.mockRestore();
	});

	it("shows the update error message and does not navigate back when the update mutation fails", async () => {
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", transactionId: "ptx-edit-expense" },
		} as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Farmacia",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-28T12:00:00.000Z",
		});
		mockUpdatePersonalTransaction.mockRejectedValueOnce(
			new Error("network error"),
		);

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(
				screen.getByText("No pudimos guardar los cambios. Intentá de nuevo."),
			).toBeTruthy();
		});
		expect(navigationMock.goBack).not.toHaveBeenCalled();
	});

	it.each([
		"expense",
		"income",
	] as const)("opens the calculator for a %s with the current amount and source params", (transactionType) => {
		jest.mocked(useRoute).mockReturnValue({
			params: {
				type: transactionType,
				transactionId: "transaction-1",
				returnToPersonalExpenses: true,
			},
		} as never);

		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });
		fireEvent.changeText(
			screen.getByTestId("personal-transaction-amount-input"),
			"12.500,25",
		);
		fireEvent.press(screen.getByTestId("personal-transaction-calculator"));

		expect(navigationMock.navigate).toHaveBeenCalledWith("Calculator", {
			initialAmount: "12.500,25",
			sourceParams: {
				type: transactionType,
				transactionId: "transaction-1",
				returnToPersonalExpenses: true,
			},
		});
	});

	it("consumes a calculator result once while preserving the rest of the form and edit mode", () => {
		const route = {
			params: {
				type: "expense" as const,
				transactionId: "ptx-edit-expense",
				returnToPersonalExpenses: true,
			},
		};
		jest.mocked(useRoute).mockImplementation(() => route as never);
		mockGetMockEditablePersonalTransaction.mockReturnValue({
			id: "ptx-edit-expense",
			type: "expense",
			expenseKind: "variable",
			amount: 45000,
			currency: "ARS",
			category: "Salud",
			accountId: "account-ars",
			accountName: "Pesos",
			occurredAt: "2026-06-28T12:00:00.000Z",
			note: "Farmacia",
			createdAt: "2026-06-28T12:00:00.000Z",
			updatedAt: "2026-06-28T12:00:00.000Z",
		});
		const rendered = render(<AddPersonalTransactionScreen />, {
			wrapper: Wrapper,
		});
		fireEvent.changeText(
			screen.getByTestId("personal-note-input"),
			"Nota intacta",
		);
		fireEvent.press(screen.getByTestId("personal-expense-type-fixed"));

		route.params = {
			...route.params,
			calculatorResult: "12345.67",
		} as typeof route.params;
		rendered.rerender(<AddPersonalTransactionScreen />);

		expect(
			screen.getByTestId("personal-transaction-amount-input").props.value,
		).toBe("12.345,67");
		expect(screen.getByTestId("personal-note-input").props.value).toBe(
			"Nota intacta",
		);
		expect(
			screen.getByTestId("personal-expense-type-fixed").props
				.accessibilityState,
		).toMatchObject({ selected: true });
		expect(
			screen.getByTestId("delete-personal-transaction-button"),
		).toBeTruthy();
		expect(navigationMock.setParams).toHaveBeenCalledTimes(1);
		expect(navigationMock.setParams).toHaveBeenCalledWith({
			calculatorResult: undefined,
		});
	});

	it("submits the calculated amount", async () => {
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "income", calculatorResult: "876371.25" },
		} as never);
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		await act(async () => {
			fireEvent.press(screen.getByTestId("submit-personal-transaction-button"));
		});

		await waitFor(() => {
			expect(mockCreatePersonalTransaction).toHaveBeenCalledWith(
				expect.objectContaining({ amount: 876371.25, type: "income" }),
				expect.any(Object),
			);
		});
	});
});
