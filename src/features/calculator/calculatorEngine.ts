export const MAX_EXPRESSION_LENGTH = 64;
const MAX_RESULT = Number.MAX_SAFE_INTEGER;

export type CalculatorKey =
	| "0"
	| "1"
	| "2"
	| "3"
	| "4"
	| "5"
	| "6"
	| "7"
	| "8"
	| "9"
	| "."
	| "+"
	| "−"
	| "-"
	| "×"
	| "÷"
	| "%"
	| "()"
	| "clear"
	| "backspace"
	| "=";

export type CalculatorState = {
	expression: string;
	display: string;
	error?: string;
	justEvaluated: boolean;
	canonicalResult?: string;
};

export type CalculationResult =
	| { ok: true; value: number; canonical: string }
	| { ok: false; error: string };

const operators = new Set(["+", "−", "-", "×", "÷"]);

export function createCalculatorState(initialAmount: string): CalculatorState {
	const expression = normalizeInitialAmount(initialAmount);
	return {
		expression,
		display: expression,
		error: undefined,
		justEvaluated: false,
		canonicalResult: undefined,
	};
}

export function pressCalculatorKey(
	state: CalculatorState,
	key: CalculatorKey,
): CalculatorState {
	if (key === "clear") return createCalculatorState("0");

	if (key === "backspace") {
		const expression =
			state.expression.length > 1 ? state.expression.slice(0, -1) : "0";
		return { expression, display: expression, justEvaluated: false };
	}

	if (key === "=") {
		const result = evaluateExpression(state.expression);
		if (!result.ok) {
			return { ...state, error: result.error, canonicalResult: undefined };
		}
		return {
			expression: result.canonical,
			display: result.canonical,
			justEvaluated: true,
			canonicalResult: result.canonical,
		};
	}

	let expression = state.expression;
	const digit = /^\d$/.test(key);
	if (state.justEvaluated && digit) expression = "0";

	if (digit) {
		expression = expression === "0" ? key : `${expression}${key}`;
	} else if (key === ".") {
		if (state.justEvaluated) expression = "0";
		if (!currentNumber(expression).includes(".")) {
			expression = `${expression}.`;
		}
	} else if (operators.has(key)) {
		const normalizedKey = key === "−" ? "-" : key;
		const last = expression.at(-1);
		if (last && operators.has(last)) {
			expression = `${expression.slice(0, -1)}${normalizedKey}`;
		} else if (last !== "(" && last !== ".") {
			expression = `${expression}${normalizedKey}`;
		}
	} else if (key === "%") {
		const last = expression.at(-1);
		if (last && (/\d/.test(last) || last === ")") && last !== "%") {
			expression = `${expression}%`;
		}
	} else if (key === "()") {
		expression = toggleParenthesis(expression);
	}

	if (expression.length > MAX_EXPRESSION_LENGTH) {
		return { ...state, error: "La operación es demasiado larga" };
	}

	return {
		expression,
		display: expression,
		justEvaluated: false,
		error: undefined,
		canonicalResult: undefined,
	};
}

export function evaluateExpression(expression: string): CalculationResult {
	if (!expression || expression.length > MAX_EXPRESSION_LENGTH) {
		return failure(
			expression.length > MAX_EXPRESSION_LENGTH
				? "La operación es demasiado larga"
				: undefined,
		);
	}

	try {
		const parser = new Parser(expression);
		const rawValue = parser.parse();
		if (
			!Number.isFinite(rawValue) ||
			rawValue <= 0 ||
			Math.abs(rawValue) > MAX_RESULT
		) {
			return failure("El resultado debe ser un monto positivo y válido");
		}
		const value = Math.round((rawValue + Number.EPSILON) * 100) / 100;
		if (!Number.isFinite(value) || value <= 0 || value > MAX_RESULT)
			return failure();
		const canonical = trimDecimalZeros(value.toFixed(2));
		return { ok: true, value, canonical };
	} catch {
		return failure();
	}
}

function failure(
	error = "Revisá la operación e intentá de nuevo",
): CalculationResult {
	return { ok: false, error };
}

function normalizeInitialAmount(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return "0";
	const normalized = trimmed.includes(",")
		? trimmed.replace(/\./g, "").replace(",", ".")
		: trimmed;
	return /^\d+(?:\.\d{0,2})?$/.test(normalized)
		? trimDecimalZeros(normalized)
		: "0";
}

function trimDecimalZeros(value: string): string {
	return value.includes(".")
		? value.replace(/0+$/, "").replace(/\.$/, "")
		: value;
}

function currentNumber(expression: string): string {
	return expression.split(/[+\-×÷()%]/).at(-1) ?? "";
}

function toggleParenthesis(expression: string): string {
	const openings = [...expression].filter(
		(character) => character === "(",
	).length;
	const closings = [...expression].filter(
		(character) => character === ")",
	).length;
	const last = expression.at(-1);
	const shouldClose =
		openings > closings &&
		last !== "(" &&
		last !== undefined &&
		!operators.has(last);

	if (shouldClose) return `${expression})`;
	if (expression === "0") return "(";
	if (last && (/\d/.test(last) || last === ")" || last === "%"))
		return `${expression}×(`;
	return `${expression}(`;
}

class Parser {
	private position = 0;

	constructor(private readonly source: string) {}

	parse(): number {
		const value = this.parseSum();
		if (this.position !== this.source.length)
			throw new Error("Unexpected token");
		return value;
	}

	private parseSum(): number {
		let value = this.parseProduct();
		while (this.peek() === "+" || this.peek() === "-" || this.peek() === "−") {
			const operator = this.consume();
			const right = this.parseProduct();
			value = operator === "+" ? value + right : value - right;
		}
		return value;
	}

	private parseProduct(): number {
		let value = this.parsePostfix();
		while (
			this.peek() === "×" ||
			this.peek() === "÷" ||
			this.peek() === "*" ||
			this.peek() === "/"
		) {
			const operator = this.consume();
			const right = this.parsePostfix();
			if ((operator === "÷" || operator === "/") && right === 0)
				throw new Error("Division by zero");
			value =
				operator === "×" || operator === "*" ? value * right : value / right;
		}
		return value;
	}

	private parsePostfix(): number {
		let value = this.parsePrimary();
		while (this.peek() === "%") {
			this.consume();
			value /= 100;
		}
		return value;
	}

	private parsePrimary(): number {
		if (this.peek() === "(") {
			this.consume();
			const value = this.parseSum();
			if (this.consume() !== ")") throw new Error("Missing parenthesis");
			return value;
		}

		const start = this.position;
		let decimalCount = 0;
		while (/\d|\./.test(this.peek() ?? "")) {
			if (this.peek() === ".") decimalCount += 1;
			this.consume();
		}
		const token = this.source.slice(start, this.position);
		if (!token || decimalCount > 1 || token === "." || token.endsWith("."))
			throw new Error("Invalid number");
		const value = Number(token);
		if (!Number.isFinite(value)) throw new Error("Invalid number");
		return value;
	}

	private peek(): string | undefined {
		return this.source[this.position];
	}

	private consume(): string | undefined {
		const token = this.peek();
		this.position += 1;
		return token;
	}
}
