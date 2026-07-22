import { fireEvent, render, screen } from "@testing-library/react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CalculatorScreen } from "../screens/CalculatorScreen";

const sourceParams = {
	type: "income" as const,
	transactionId: "transaction-1",
	returnToPersonalExpenses: true,
};

const navigationMock = {
	goBack: jest.fn(),
	popTo: jest.fn(),
};

describe("CalculatorScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.mocked(useNavigation).mockReturnValue(navigationMock as never);
		jest.mocked(useRoute).mockReturnValue({
			params: { initialAmount: "1.250,50", sourceParams },
		} as never);
		jest.mocked(useSafeAreaInsets).mockReturnValue({
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		});
	});

	it("starts from the current amount and renders the full native calculator without bottom navigation", () => {
		render(<CalculatorScreen />);

		expect(screen.getByText("Calculadora")).toBeTruthy();
		expect(screen.getByText("Monto actual")).toBeTruthy();
		expect(screen.getByTestId("calculator-display").props.children).toBe(
			"1250.5",
		);

		const controls = [
			"clear",
			"backspace",
			"percent",
			"divide",
			"7",
			"8",
			"9",
			"multiply",
			"4",
			"5",
			"6",
			"subtract",
			"1",
			"2",
			"3",
			"add",
			"parentheses",
			"0",
			"decimal",
			"equals",
		];
		for (const control of controls) {
			const key = screen.getByTestId(`calculator-key-${control}`);
			expect(key.props.accessibilityRole).toBe("button");
			expect(key.props.accessibilityLabel).toBeTruthy();
		}

		expect(screen.queryByText("Inicio")).toBeNull();
		expect(screen.queryByText("Grupos")).toBeNull();
		expect(screen.queryByText("Perfil")).toBeNull();
	});

	it("updates the display through all keypad behavior and accepts a valid positive result", () => {
		render(<CalculatorScreen />);

		fireEvent.press(screen.getByTestId("calculator-key-clear"));
		fireEvent.press(screen.getByTestId("calculator-key-2"));
		fireEvent.press(screen.getByTestId("calculator-key-0"));
		fireEvent.press(screen.getByTestId("calculator-key-0"));
		fireEvent.press(screen.getByTestId("calculator-key-multiply"));
		fireEvent.press(screen.getByTestId("calculator-key-parentheses"));
		fireEvent.press(screen.getByTestId("calculator-key-1"));
		fireEvent.press(screen.getByTestId("calculator-key-0"));
		fireEvent.press(screen.getByTestId("calculator-key-percent"));
		fireEvent.press(screen.getByTestId("calculator-key-parentheses"));
		fireEvent.press(screen.getByTestId("calculator-key-equals"));

		expect(screen.getByTestId("calculator-display").props.children).toBe("20");
		fireEvent.press(screen.getByTestId("calculator-accept"));
		expect(navigationMock.popTo).toHaveBeenCalledWith(
			"AddPersonalTransaction",
			{
				...sourceParams,
				calculatorResult: "20",
			},
		);
	});

	it("supports decimal, operators, backspace, and clear controls", () => {
		render(<CalculatorScreen />);

		fireEvent.press(screen.getByTestId("calculator-key-clear"));
		for (const key of [
			"7",
			"decimal",
			"5",
			"add",
			"2",
			"subtract",
			"1",
			"divide",
			"2",
		]) {
			fireEvent.press(screen.getByTestId(`calculator-key-${key}`));
		}
		fireEvent.press(screen.getByTestId("calculator-key-backspace"));
		expect(screen.getByTestId("calculator-display").props.children).toBe(
			"7.5+2-1÷",
		);
		fireEvent.press(screen.getByTestId("calculator-key-clear"));
		expect(screen.getByTestId("calculator-display").props.children).toBe("0");
	});

	it("shows accessible feedback and refuses Accept for invalid expressions", () => {
		render(<CalculatorScreen />);

		fireEvent.press(screen.getByTestId("calculator-key-clear"));
		fireEvent.press(screen.getByTestId("calculator-key-1"));
		fireEvent.press(screen.getByTestId("calculator-key-divide"));
		fireEvent.press(screen.getByTestId("calculator-key-0"));
		fireEvent.press(screen.getByTestId("calculator-key-equals"));

		const error = screen.getByRole("alert");
		expect(error.props.accessibilityLiveRegion).toBe("polite");
		fireEvent.press(screen.getByTestId("calculator-accept"));
		expect(navigationMock.popTo).not.toHaveBeenCalled();
	});

	it("goes back without returning a mutation", () => {
		render(<CalculatorScreen />);

		fireEvent.press(screen.getByLabelText("Volver"));
		expect(navigationMock.goBack).toHaveBeenCalledTimes(1);
		expect(navigationMock.popTo).not.toHaveBeenCalled();
	});
});
