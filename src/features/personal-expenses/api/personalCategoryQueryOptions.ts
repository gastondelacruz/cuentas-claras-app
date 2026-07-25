import { queryOptions } from "@tanstack/react-query";

import { getPersonalCategories } from "./personalCategoriesApi";

export const personalCategoriesQueryKey = ["personal-categories"] as const;

export function personalCategoriesQueryOptions() {
	return queryOptions({
		queryKey: personalCategoriesQueryKey,
		queryFn: getPersonalCategories,
	});
}
