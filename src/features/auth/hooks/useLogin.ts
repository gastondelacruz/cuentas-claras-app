import { useMutation } from '@tanstack/react-query';

import { loginUser } from '../api/authApi';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
  });
}
