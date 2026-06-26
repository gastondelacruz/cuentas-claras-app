import { useMutation } from '@tanstack/react-query';

import { createGroup, CreateGroupInput } from '../api/groupsApi';

export function useCreateGroup() {
  return useMutation({
    mutationFn: (input: CreateGroupInput) => createGroup(input),
  });
}
