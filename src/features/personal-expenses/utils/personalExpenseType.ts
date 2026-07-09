import type {
	PersonalExpenseType,
	PersonalExpenseTypeFilter,
	PersonalTransactionViewItem,
} from "../types";

export const DEFAULT_PERSONAL_EXPENSE_TYPE: PersonalExpenseType = "variable";

export function resolvePersonalExpenseType(
	expenseKind?: PersonalExpenseType | null,
) {
	return expenseKind ?? DEFAULT_PERSONAL_EXPENSE_TYPE;
}

export function filterPersonalExpenseTransactions(
	transactions: PersonalTransactionViewItem[],
	expenseKindFilter: PersonalExpenseTypeFilter,
) {
	if (expenseKindFilter === "all") {
		return transactions;
	}

	return transactions.filter(
		(transaction) =>
			resolvePersonalExpenseType(transaction.expenseKind) === expenseKindFilter,
	);
}
