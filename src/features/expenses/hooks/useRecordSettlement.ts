import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recordGroupSettlement } from '../../groups/api/groupsApi';
import { queryKeys } from '../../../shared/api/queryKeys';
import { RecordSettlementInputDto } from '../../groups/schemas/groupSchema';

export function useRecordSettlement(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecordSettlementInputDto) => recordGroupSettlement(groupId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.balances(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.settlements(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
