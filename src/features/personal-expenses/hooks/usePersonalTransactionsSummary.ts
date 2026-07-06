import { useQuery } from "@tanstack/react-query";

import { useProtectedDataEnabled } from "../../../shared/hooks/useProtectedDataEnabled";
import { personalTransactionsSummaryQueryOptions } from "../api/personalTransactionQueryOptions";
import type { PersonalTransactionSummaryFilters } from "../types";

export function usePersonalTransactionsSummary(
	filters: PersonalTransactionSummaryFilters,
) {
	const protectedDataEnabled = useProtectedDataEnabled();
	const query = useQuery({
		...personalTransactionsSummaryQueryOptions(filters),
		enabled: protectedDataEnabled,
	});

	const summary = protectedDataEnabled ? query.data : undefined;

	return {
		summary,
		hasFetchedSummary: summary !== undefined,
		isLoading: protectedDataEnabled && query.isLoading,
		isError: protectedDataEnabled && query.isError,
		error: protectedDataEnabled ? query.error : null,
	};
}
