import { useQuery } from "@tanstack/react-query";

import { useProtectedDataEnabled } from "../../../shared/hooks/useProtectedDataEnabled";
import { personalTransactionsListQueryOptions } from "../api/personalTransactionQueryOptions";
import type { PersonalTransactionListFilters } from "../types";

export function usePersonalTransactions(
	filters: PersonalTransactionListFilters,
) {
	const protectedDataEnabled = useProtectedDataEnabled();
	const query = useQuery({
		...personalTransactionsListQueryOptions(filters),
		enabled: protectedDataEnabled,
	});

	const data = protectedDataEnabled ? query.data : undefined;

	return {
		transactions: data?.transactions ?? [],
		total: data?.total ?? 0,
		incomeTotal: data?.incomeTotal ?? 0,
		expenseTotal: data?.expenseTotal ?? 0,
		currency: data?.currency ?? "ARS",
		hasFetchedTransactions: data !== undefined,
		isLoading: protectedDataEnabled && query.isLoading,
		isError: protectedDataEnabled && query.isError,
		error: protectedDataEnabled ? query.error : null,
	};
}
