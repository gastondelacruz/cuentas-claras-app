import { useInfiniteQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../shared/api/queryKeys";
import { useProtectedDataEnabled } from "../../../shared/hooks/useProtectedDataEnabled";
import { getGroupExpenses } from "../api/expensesApi";
import { ExpenseListItemDto } from "../schemas/expenseSchema";

type UseGroupExpensesResult = {
	expenses: ExpenseListItemDto[];
	fetchNextPage: () => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	isLoading: boolean;
	error: Error | null;
};

const DEFAULT_PAGE_SIZE = 20;

export function useGroupExpenses(groupId?: string): UseGroupExpensesResult {
	const protectedDataEnabled = useProtectedDataEnabled();
	const query = useInfiniteQuery({
		queryKey: queryKeys.expenses.list(groupId ?? ""),
		queryFn: ({ pageParam }) =>
			getGroupExpenses(groupId!, {
				cursor: pageParam,
				limit: DEFAULT_PAGE_SIZE,
			}),
		enabled: Boolean(groupId) && protectedDataEnabled,
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	const pages = protectedDataEnabled ? query.data?.pages : undefined;
	const expenses = pages?.flatMap((page) => page.expenses) ?? [];

	return {
		expenses,
		fetchNextPage: query.fetchNextPage,
		hasNextPage: protectedDataEnabled ? (query.hasNextPage ?? false) : false,
		isFetchingNextPage: protectedDataEnabled && query.isFetchingNextPage,
		isLoading: protectedDataEnabled && query.isLoading,
		error: protectedDataEnabled ? query.error : null,
	};
}
