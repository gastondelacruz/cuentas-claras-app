import {
	MAX_EXPRESSION_LENGTH,
	createCalculatorState,
	evaluateExpression,
	pressCalculatorKey,
} from "../calculatorEngine";

describe("calculatorEngine", () => {
	it.each([
		["2+3×4", "14"],
		["(2+3)×4", "20"],
		["200×10%", "20"],
		["10+50%", "10.5"],
		["1.25+2.5", "3.75"],
		["0.1+0.2", "0.3"],
	])("evaluates %s with monetary precedence and rounding", (expression, canonical) => {
		expect(evaluateExpression(expression)).toEqual({
			ok: true,
			value: Number(canonical),
			canonical,
		});
	});

	it.each([
		"",
		"2+",
		"(2+3",
		"2..3",
		"2 3",
		"abc",
		"10÷0",
	])("rejects malformed, incomplete, or unsafe expression %s", (expression) => {
		expect(evaluateExpression(expression).ok).toBe(false);
	});

	it("rejects non-positive, overflowing, and overlong results", () => {
		expect(evaluateExpression("0").ok).toBe(false);
		expect(evaluateExpression("1-2").ok).toBe(false);
		expect(evaluateExpression("999999999999999×999999999999999").ok).toBe(
			false,
		);
		expect(evaluateExpression("1".repeat(MAX_EXPRESSION_LENGTH + 1)).ok).toBe(
			false,
		);
	});

	it("supports clear and backspace state behavior", () => {
		let state = createCalculatorState("123");
		state = pressCalculatorKey(state, "backspace");
		expect(state.display).toBe("12");
		state = pressCalculatorKey(state, "clear");
		expect(state).toMatchObject({
			expression: "0",
			display: "0",
			error: undefined,
		});
	});

	it("starts a new expression with a digit after equals and continues with an operator", () => {
		let state = createCalculatorState("2");
		state = pressCalculatorKey(state, "+");
		state = pressCalculatorKey(state, "3");
		state = pressCalculatorKey(state, "=");
		expect(state.display).toBe("5");
		expect(pressCalculatorKey(state, "7").display).toBe("7");
		expect(pressCalculatorKey(state, "×").expression).toBe("5×");
	});

	it("uses the parentheses key to open and close balanced groups", () => {
		let state = createCalculatorState("0");
		state = pressCalculatorKey(state, "()");
		state = pressCalculatorKey(state, "2");
		state = pressCalculatorKey(state, "+");
		state = pressCalculatorKey(state, "3");
		state = pressCalculatorKey(state, "()");
		expect(state.expression).toBe("(2+3)");
	});
});
