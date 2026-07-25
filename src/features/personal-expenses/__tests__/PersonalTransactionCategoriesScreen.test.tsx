import { fireEvent, render, screen } from "@testing-library/react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { PersonalTransactionCategoriesScreen } from "../screens/PersonalTransactionCategoriesScreen";
jest.mock("../hooks/usePersonalCategories", () => ({
	usePersonalCategories: jest.fn(() => ({
		categories: [
			{
				id: "1",
				name: "Salud",
				type: "expense",
				icon: "Heart",
				isDefault: true,
			},
			{
				id: "2",
				name: "Transporte",
				type: "expense",
				icon: "Bus",
				isDefault: true,
			},
			{
				id: "3",
				name: "Salario",
				type: "income",
				icon: "Banknote",
				isDefault: true,
			},
			{
				id: "4",
				name: "Intereses",
				type: "income",
				icon: "TrendingUp",
				isDefault: true,
			},
		],
		isLoading: false,
		isError: false,
		error: null,
	})),
	useCreatePersonalCategory: jest.fn(),
}));
import {
	getSelectedPersonalCategory,
	resetPersonalCategoryVisibility,
} from "../constants/personalTransactionCategoryVisibility";

jest.mock("@react-navigation/native", () => ({
	...jest.requireActual("@react-navigation/native"),
	useNavigation: jest.fn(),
	useRoute: jest.fn(),
}));

describe("PersonalTransactionCategoriesScreen", () => {
	beforeEach(() => {
		resetPersonalCategoryVisibility();
		jest
			.mocked(useNavigation)
			.mockReturnValue({ navigate: jest.fn(), goBack: jest.fn() } as never);
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { type: "expense" } } as never);
	});

	it("shows the personal expense categories and create action", () => {
		render(<PersonalTransactionCategoriesScreen />);

		expect(screen.getByText("Categorías de Gastos")).toBeTruthy();
		expect(screen.getByText("Salud")).toBeTruthy();
		expect(screen.getByTestId("personal-category-create-button")).toBeTruthy();
	});

	it("previews a category returned by the local create flow without duplicating it", () => {
		jest
			.mocked(useRoute)
			.mockReturnValue({ params: { type: "income" } } as never);

		render(<PersonalTransactionCategoriesScreen />);

		expect(screen.getByText("Salario")).toBeTruthy();
	});

	it("records a selected hidden category before going back", () => {
		const goBack = jest.fn();
		jest
			.mocked(useNavigation)
			.mockReturnValue({ navigate: jest.fn(), goBack } as never);
		render(<PersonalTransactionCategoriesScreen />);

		fireEvent.press(screen.getByTestId("personal-full-category-Transporte"));

		expect(getSelectedPersonalCategory("expense")).toBe("Transporte");
		expect(goBack).toHaveBeenCalledTimes(1);
	});

	it("returns directly to the originating add form after selecting a created category", () => {
		const popTo = jest.fn();
		const goBack = jest.fn();
		jest
			.mocked(useNavigation)
			.mockReturnValue({ navigate: jest.fn(), popTo, goBack } as never);
		jest.mocked(useRoute).mockReturnValue({
			params: {
				type: "income",
				returnToAddPersonalTransaction: true,
			},
		} as never);

		render(<PersonalTransactionCategoriesScreen />);
		fireEvent.press(screen.getByTestId("personal-full-category-Salario"));

		expect(getSelectedPersonalCategory("income")).toBe("Salario");
		expect(popTo).toHaveBeenCalledWith("AddPersonalTransaction", {
			type: "income",
		});
		expect(goBack).not.toHaveBeenCalled();
	});

	it("opens the local create screen", () => {
		const navigate = jest.fn();
		jest.mocked(useNavigation).mockReturnValue({ navigate } as never);
		render(<PersonalTransactionCategoriesScreen />);

		fireEvent.press(screen.getByTestId("personal-category-create-button"));

		expect(navigate).toHaveBeenCalledWith("CreatePersonalTransactionCategory", {
			type: "expense",
		});
	});
});
