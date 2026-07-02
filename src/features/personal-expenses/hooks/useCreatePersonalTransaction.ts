import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { createPersonalTransaction } from '../api/personalTransactionsApi';

export function useCreatePersonalTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPersonalTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalTransactions.all() });
    },
  });
}
