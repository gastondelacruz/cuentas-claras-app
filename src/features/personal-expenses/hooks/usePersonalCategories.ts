import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useProtectedDataEnabled } from "../../../shared/hooks/useProtectedDataEnabled";
import { createPersonalCategory } from "../api/personalCategoriesApi";
import {
	personalCategoriesQueryKey,
	personalCategoriesQueryOptions,
} from "../api/personalCategoryQueryOptions";

const EMPTY_CATEGORIES: never[] = [];

export function usePersonalCategories() {
	const enabled = useProtectedDataEnabled();
	const query = useQuery({
		...personalCategoriesQueryOptions(),
		enabled,
	});
	return {
		categories: enabled ? (query.data ?? EMPTY_CATEGORIES) : EMPTY_CATEGORIES,
		isLoading: enabled && query.isLoading,
		isError: enabled && query.isError,
		error: enabled ? query.error : null,
	};
}

export function useCreatePersonalCategory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createPersonalCategory,
		onSuccess: (createdCategory) => {
			queryClient.setQueryData(
				personalCategoriesQueryKey,
				(current: (typeof createdCategory)[] | undefined) =>
					current?.some((category) => category.id === createdCategory.id)
						? current
						: [...(current ?? []), createdCategory],
			);
			queryClient.invalidateQueries({ queryKey: personalCategoriesQueryKey });
		},
	});
}
