import { useQuery } from "@tanstack/react-query";

import { useProtectedDataEnabled } from "../../../shared/hooks/useProtectedDataEnabled";
import { groupsListQueryOptions } from "../api/groupQueryOptions";

export function useGroups() {
	const protectedDataEnabled = useProtectedDataEnabled();
	const query = useQuery({
		...groupsListQueryOptions(),
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
