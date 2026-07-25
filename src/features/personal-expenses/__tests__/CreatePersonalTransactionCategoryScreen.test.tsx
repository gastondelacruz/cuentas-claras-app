import { fireEvent, render, screen } from "@testing-library/react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { CreatePersonalTransactionCategoryScreen } from "../screens/CreatePersonalTransactionCategoryScreen";

const mockMutate = jest.fn();
jest.mock("../hooks/usePersonalCategories", () => ({
	usePersonalCategories: jest.fn(),
	useCreatePersonalCategory: jest.fn(() => ({
		mutate: mockMutate,
		isPending: false,
		isError: false,
	})),
}));

jest.mock("@react-navigation/native", () => ({
	...jest.requireActual("@react-navigation/native"),
	useNavigation: jest.fn(),
	useRoute: jest.fn(),
}));

describe("CreatePersonalTransactionCategoryScreen", () => {
	function renderScreen() {
		jest.mocked(useNavigation).mockReturnValue({
			replace: jest.fn(),
			navigate: jest.fn(),
			goBack: jest.fn(),
		} as never);
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", returnToAddPersonalTransaction: true },
		} as never);
		return render(<CreatePersonalTransactionCategoryScreen />);
	}

	it("only renders the fixed preset color palette", () => {
		renderScreen();

		expect(screen.queryByTestId("personal-category-color-custom")).toBeNull();
		expect(screen.queryByTestId("personal-category-color-picker")).toBeNull();
		expect(screen.queryByText("Elegí un color personalizado")).toBeNull();
		expect(screen.getAllByTestId(/^personal-category-color-/)).toHaveLength(15);
	});

	it("selects a preset color and uses it in the create payload", () => {
		renderScreen();

		fireEvent.changeText(
			screen.getByTestId("personal-new-category-name"),
			"Viajes",
		);
		fireEvent.press(screen.getByTestId("personal-category-color-#22c55e"));
		fireEvent.press(screen.getByTestId("personal-save-category-button"));

		expect(mockMutate).toHaveBeenCalledWith(
			expect.objectContaining({ name: "Viajes", color: "#22c55e" }),
			expect.anything(),
		);
		expect(screen.getByTestId("personal-category-preview").props.style).toEqual(
			expect.objectContaining({ backgroundColor: "#22c55e" }),
		);
	});

	it("creates the entered category with a backend-supported icon", () => {
		const replace = jest.fn();
		jest.mocked(useNavigation).mockReturnValue({
			replace,
			navigate: jest.fn(),
			goBack: jest.fn(),
		} as never);
		jest.mocked(useRoute).mockReturnValue({
			params: { type: "expense", returnToAddPersonalTransaction: true },
		} as never);

		render(<CreatePersonalTransactionCategoryScreen />);

		expect(screen.getByText("Crear Nueva Categoría")).toBeTruthy();
		fireEvent.changeText(
			screen.getByTestId("personal-new-category-name"),
			"Viajes",
		);
		expect(screen.getByText("Viajes")).toBeTruthy();

		fireEvent.press(screen.getByTestId("personal-category-icon-Bus"));
		fireEvent.press(screen.getByTestId("personal-category-color-#f59e0b"));
		fireEvent.press(screen.getByTestId("personal-save-category-button"));

		expect(mockMutate).toHaveBeenCalledWith(
			{ name: "Viajes", type: "expense", icon: "Bus", color: "#f59e0b" },
			expect.anything(),
		);
		expect(screen.getAllByTestId(/^personal-category-icon-/)).toHaveLength(30);
		expect(
			screen.getByTestId("personal-category-color-#f59e0b").props
				.accessibilityState,
		).toMatchObject({ selected: true });
	});
});
