import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { updatePersonalTransaction } from '../api/personalTransactionsApi';
import type { UpdatePersonalTransactionInput } from '../schemas/personalTransactionSchema';

type UpdatePersonalTransactionVariables = UpdatePersonalTransactionInput & {
  transactionId: string;
};

export function useUpdatePersonalTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, ...input }: UpdatePersonalTransactionVariables) =>
      updatePersonalTransaction(transactionId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.personalTransactions.all() });
    },
  });
}
