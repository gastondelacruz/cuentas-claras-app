import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { getGroupExpenses } from '../api/expensesApi';
import { ExpenseListItemDto } from '../schemas/expenseSchema';

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
  const query = useInfiniteQuery({
    queryKey: queryKeys.expenses.list(groupId ?? ''),
    queryFn: ({ pageParam }) =>
      getGroupExpenses(groupId!, { cursor: pageParam, limit: DEFAULT_PAGE_SIZE }),
    enabled: Boolean(groupId),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const expenses = query.data?.pages.flatMap((page) => page.expenses) ?? [];

  return {
    expenses,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    error: query.error,
  };
}
