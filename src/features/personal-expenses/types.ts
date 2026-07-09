import type { PersonalTransactionDto } from "./schemas/personalTransactionSchema";

export type PersonalTransactionType = "expense" | "income";

export type PersonalExpenseType = "variable" | "fixed";

export type PersonalExpenseTypeFilter = "all" | PersonalExpenseType;

export type PersonalTransactionRange =
	| "day"
	| "week"
	| "month"
	| "year"
	| "period";

export type PersonalTransactionViewItem = PersonalTransactionDto;

export type PersonalTransactionListFilters = {
	type: PersonalTransactionType;
	range: PersonalTransactionRange;
	from?: string;
	to?: string;
};

export type PersonalTransactionSummaryFilters = {
	range: PersonalTransactionRange;
	from?: string;
	to?: string;
};

export type PersonalTransactionQueryOptions = PersonalTransactionListFilters & {
	cursor?: string;
	limit?: number;
};

export type PersonalTransactionChartSegment = {
	color: string;
	dasharray: string;
	dashoffset?: string;
};
