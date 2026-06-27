import { useMutation } from '@tanstack/react-query';

import { logoutUser } from '../api/authApi';
import { queryClient } from '../../../shared/api/queryClient';
import { useAuthStore } from '../../../shared/store/authStore';

export function useLogout() {
  return useMutation({
    mutationFn: logoutUser,
    onMutate: () => {
      useAuthStore.getState().clearSession();
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}
