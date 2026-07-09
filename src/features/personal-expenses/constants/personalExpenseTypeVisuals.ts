import type { PersonalExpenseType, PersonalExpenseTypeFilter } from "../types";

export const PERSONAL_EXPENSE_TYPE_LABELS: Record<PersonalExpenseType, string> =
	{
		variable: "Variable",
		fixed: "Fijo",
	};

export const PERSONAL_EXPENSE_TYPE_FILTER_OPTIONS: Array<{
	value: PersonalExpenseTypeFilter;
	label: string;
	testID: string;
}> = [
	{ value: "all", label: "Todos", testID: "personal-expense-filter-all" },
	{ value: "fixed", label: "Fijos", testID: "personal-expense-filter-fixed" },
	{
		value: "variable",
		label: "Variables",
		testID: "personal-expense-filter-variable",
	},
];

export const PERSONAL_EXPENSE_TYPE_FILTER_COLORS = {
	selectedBackgroundColor: "#012d1d",
	selectedTextColor: "#ffffff",
	unselectedBackgroundColor: "#e7e9e8",
	unselectedTextColor: "#434a46",
};

export const PERSONAL_EXPENSE_TYPE_BADGE_COLORS: Record<
	PersonalExpenseType,
	{ backgroundColor: string; textColor: string }
> = {
	variable: {
		backgroundColor: "#b8ebc9",
		textColor: "#1b6a49",
	},
	fixed: {
		backgroundColor: "#e7e9e8",
		textColor: "#4b5563",
	},
};
