import { queryOptions } from "@tanstack/react-query";

import { queryKeys } from "../../../shared/api/queryKeys";
import type {
	PersonalTransactionCategoryDetailFilters,
	PersonalTransactionListFilters,
	PersonalTransactionSummaryFilters,
} from "../types";
import {
	getPersonalTransactions,
	getPersonalTransactionsSummary,
} from "./personalTransactionsApi";

export const DEFAULT_PERSONAL_TRANSACTION_LIMIT = 20;
export const PERSONAL_CATEGORY_DETAIL_LIMIT = 100;

export function personalTransactionsListQueryOptions(
	filters: PersonalTransactionListFilters,
) {
	return queryOptions({
		queryKey: queryKeys.personalTransactions.list(filters),
		queryFn: () =>
			getPersonalTransactions({
				...filters,
				limit: DEFAULT_PERSONAL_TRANSACTION_LIMIT,
			}),
	});
}

export function personalTransactionsSummaryQueryOptions(
	filters: PersonalTransactionSummaryFilters,
) {
	return queryOptions({
		queryKey: queryKeys.personalTransactions.summary(filters),
		queryFn: () => getPersonalTransactionsSummary(filters),
	});
}

export function personalTransactionsCategoryDetailQueryOptions(
	filters: PersonalTransactionCategoryDetailFilters,
) {
	const { expenseKind, ...queryFilters } = filters;

	return queryOptions({
		queryKey: queryKeys.personalTransactions.categoryDetail(filters),
		queryFn: () =>
			getPersonalTransactions({
				...queryFilters,
				limit: PERSONAL_CATEGORY_DETAIL_LIMIT,
				category: filters.category,
				expenseKind:
					expenseKind && expenseKind !== "all" ? expenseKind : undefined,
			}),
	});
}
