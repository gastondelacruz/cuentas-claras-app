import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../../shared/api/queryKeys';
import { useAuthStore } from '../../../shared/store/authStore';
import {
  getEmailVerificationStatus,
  resendEmailVerification,
  verifyEmail,
} from '../api/authApi';

export function useEmailVerificationStatus() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setEmailVerification = useAuthStore((state) => state.setEmailVerification);

  return useQuery({
    queryKey: queryKeys.auth.emailVerificationStatus(),
    queryFn: async () => {
      const status = await getEmailVerificationStatus();
      setEmailVerification(status);
      return status;
    },
    enabled: isAuthenticated,
  });
}

export function useResendEmailVerification() {
  return useMutation({ mutationFn: resendEmailVerification });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  const setEmailVerification = useAuthStore((state) => state.setEmailVerification);

  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: async () => {
      setEmailVerification({ verified: true, verifiedAt: null });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.emailVerificationStatus() });
    },
  });
}
