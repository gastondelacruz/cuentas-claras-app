import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../shared/api/queryKeys";
import { deletePersonalTransaction } from "../api/personalTransactionsApi";

export function useDeletePersonalTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deletePersonalTransaction,
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: queryKeys.personalTransactions.all(),
			}),
	});
}
