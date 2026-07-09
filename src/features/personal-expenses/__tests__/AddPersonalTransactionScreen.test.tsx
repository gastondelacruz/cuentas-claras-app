import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AddPersonalTransactionScreen } from "../screens/AddPersonalTransactionScreen";
import {
	createPersonalTransaction,
	updatePersonalTransaction,
} from "../api/personalTransactionsApi";
import { PERSONAL_CATEGORY_CONFIGS } from "../constants/personalTransactionCategoryVisuals";
import { getMockEditablePersonalTransaction } from "../mocks/personalTransactionEditMock";

jest.mock("../api/personalTransactionsApi", () => ({
	createPersonalTransaction: jest.fn(),
	updatePersonalTransaction: jest.fn(),
}));

jest.mock("../mocks/personalTransactionEditMock", () => ({
	getMockEditablePersonalTransaction: jest.fn(),
}));

const mockCreatePersonalTransaction = jest.mocked(createPersonalTransaction);
const mockUpdatePersonalTransaction = jest.mocked(updatePersonalTransaction);
const mockGetMockEditablePersonalTransaction = jest.mocked(
	getMockEditablePersonalTransaction,
);

let testClient: QueryClient;
let navigationMock: { goBack: jest.Mock };

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
		testClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false, gcTime: Infinity },
				mutations: { retry: false, gcTime: Infinity },
			},
		});
		navigationMock = { goBack: jest.fn() };
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
		// The Pressable onPress is consumed internally; verify tappability by opening the picker.
		fireEvent.press(calendarButton);
		expect(screen.getByTestId("personal-date-picker")).toBeTruthy();
	});

	it("opens the date picker when the calendar button is pressed", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-date-calendar"));

		expect(screen.getByTestId("personal-date-picker")).toBeTruthy();
	});

	it("renders a selected custom chip after choosing a date from the picker", () => {
		render(<AddPersonalTransactionScreen />, { wrapper: Wrapper });

		fireEvent.press(screen.getByTestId("personal-date-calendar"));

		const picker = screen.getByTestId("personal-date-picker");
		const chosenDate = new Date("2026-06-25T12:00:00.000Z");
		act(() => {
			picker.props.onChange({}, chosenDate);
		});

		const customChip = screen.getByTestId("date-chip-custom");
		expect(customChip).toBeTruthy();
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

		const picker = screen.getByTestId("personal-date-picker");
		const chosenDate = new Date("2026-06-25T12:00:00.000Z");
		act(() => {
			picker.props.onChange({}, chosenDate);
		});

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
});
