import { useQuery } from "@tanstack/react-query";

import { useProtectedDataEnabled } from "../../../shared/hooks/useProtectedDataEnabled";
import { accountSummaryQueryOptions } from "../api/accountQueryOptions";

export function useAccountSummary() {
	const protectedDataEnabled = useProtectedDataEnabled();
	const query = useQuery({
		...accountSummaryQueryOptions(),
		enabled: protectedDataEnabled,
	});

	if (protectedDataEnabled) return query;

	return {
		...query,
		data: undefined,
		isLoading: false,
		isError: false,
		error: null,
	};
}
