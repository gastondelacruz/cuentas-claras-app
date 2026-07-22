import { fireEvent, render, screen } from "@testing-library/react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Pressable, StyleSheet } from "react-native";

jest.mock("react-native", () => {
	const actual = jest.requireActual("react-native");
	const React = jest.requireActual("react");
	const ActualPressable = actual.Pressable;

	function PressableProbe(props: Record<string, unknown>) {
		return React.createElement(ActualPressable, props);
	}

	return new Proxy(actual, {
		get(target, property) {
			return property === "Pressable"
				? PressableProbe
				: Reflect.get(target, property);
		},
	});
});
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CalculatorScreen } from "../screens/CalculatorScreen";

function resolvedStyle(testId: string) {
	return StyleSheet.flatten(screen.getByTestId(testId).props.style);
}

function pressableStyle(testId: string) {
	const pressable = screen
		.UNSAFE_getAllByType(Pressable)
		.find((candidate) => candidate.props.testID === testId);

	expect(pressable).toBeDefined();
	expect(typeof pressable?.props.style).not.toBe("function");
	return StyleSheet.flatten(pressable?.props.style);
}

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

		for (const bottomNavLabel of ["Inicio", "Gastos", "Grupos", "Perfil"]) {
			expect(screen.queryByText(bottomNavLabel)).toBeNull();
		}
	});

	it("renders the compact calculator-only header without a divider", () => {
		render(<CalculatorScreen />);

		expect(resolvedStyle("calculator-header")).toEqual(
			expect.objectContaining({
				height: 56,
				flexDirection: "row",
				alignItems: "center",
				paddingHorizontal: 20,
				columnGap: 16,
			}),
		);
		expect(resolvedStyle("calculator-header")).not.toHaveProperty(
			"borderBottomWidth",
		);
		expect(pressableStyle("calculator-header-back")).toEqual(
			expect.objectContaining({
				width: 44,
				height: 44,
				alignItems: "center",
				justifyContent: "center",
			}),
		);
		expect(resolvedStyle("calculator-header-title")).toEqual(
			expect.objectContaining({
				fontSize: 24,
				lineHeight: 32,
				textAlign: "left",
			}),
		);
		expect(screen.getByLabelText("Volver").props.hitSlop).toBe(8);
	});

	it("uses exact bounded semantic styles for every calculator action", () => {
		render(<CalculatorScreen />);

		expect(pressableStyle("calculator-key-clear")).toEqual(
			expect.objectContaining({
				backgroundColor: "#ffdad6",
				borderRadius: 8,
			}),
		);
		expect(pressableStyle("calculator-key-backspace")).toEqual(
			expect.objectContaining({
				backgroundColor: "#e7e8e9",
				borderRadius: 8,
			}),
		);
		expect(pressableStyle("calculator-key-add")).toEqual(
			expect.objectContaining({
				backgroundColor: "#e7e8e9",
				borderRadius: 8,
			}),
		);
		expect(pressableStyle("calculator-key-7")).toEqual(
			expect.objectContaining({
				backgroundColor: "#ffffff",
				borderColor: "#c1c8c2",
				borderWidth: 1,
				borderRadius: 8,
			}),
		);
		expect(pressableStyle("calculator-key-equals")).toEqual(
			expect.objectContaining({
				backgroundColor: "#1b4332",
				borderRadius: 8,
			}),
		);
		expect(screen.getByText("C").props.style).toEqual(
			expect.objectContaining({ color: "#ba1a1a" }),
		);
		expect(screen.getByText("=").props.style).toEqual(
			expect.objectContaining({ color: "#ffffff" }),
		);

		expect(pressableStyle("calculator-accept")).toEqual(
			expect.objectContaining({
				width: "100%",
				minHeight: 44,
				height: 54,
				backgroundColor: "#1b4332",
				alignItems: "center",
				justifyContent: "center",
			}),
		);
		expect(screen.getByText("ACEPTAR").props.style).toEqual(
			expect.objectContaining({ color: "#ffffff", textAlign: "center" }),
		);
	});

	it("keeps the display compact and the scroll content top-aligned", () => {
		render(<CalculatorScreen />);

		expect(resolvedStyle("calculator-display-card")).toEqual(
			expect.objectContaining({
				minHeight: 88,
				borderRadius: 12,
				borderWidth: 1,
				borderColor: "#c1c8c2",
				backgroundColor: "#ffffff",
				alignItems: "flex-end",
				elevation: 2,
			}),
		);
		expect(screen.getByText("Monto actual").props.style).toEqual(
			expect.objectContaining({ textAlign: "right" }),
		);
		expect(resolvedStyle("calculator-display")).toEqual(
			expect.objectContaining({ width: "100%", textAlign: "right" }),
		);

		const contentStyle = StyleSheet.flatten(
			screen.getByTestId("calculator-scroll").props.contentContainerStyle,
		);
		expect(contentStyle).toEqual(
			expect.objectContaining({
				flexGrow: 1,
				justifyContent: "flex-start",
				paddingTop: 12,
				paddingHorizontal: 20,
				paddingBottom: 20,
			}),
		);
	});

	it("lays out every key in five deterministic responsive rows", () => {
		render(<CalculatorScreen />);

		const expectedRows = [
			["clear", "backspace", "percent", "divide"],
			["7", "8", "9", "multiply"],
			["4", "5", "6", "subtract"],
			["1", "2", "3", "add"],
			["parentheses", "0", "decimal", "equals"],
		];

		for (const [index, expectedKeys] of expectedRows.entries()) {
			const row = screen.getByTestId(`calculator-row-${index + 1}`);
			expect(row.props.style).toEqual(
				expect.objectContaining({ flexDirection: "row", columnGap: 16 }),
			);
			expect(row.props.children).toHaveLength(4);
			expect(
				row.props.children.map(
					(child: { props: { testID: string } }) => child.props.testID,
				),
			).toEqual(expectedKeys.map((key) => `calculator-key-${key}`));
		}

		const keypad = screen.getByTestId("calculator-keypad");
		expect(keypad.props.style).toEqual(expect.objectContaining({ rowGap: 16 }));

		const keyStyle = pressableStyle("calculator-key-7");
		expect(keyStyle).toEqual(
			expect.objectContaining({
				flex: 1,
				maxWidth: 64,
				minWidth: 44,
				height: 64,
				minHeight: 44,
			}),
		);
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
