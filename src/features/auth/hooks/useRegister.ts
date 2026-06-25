import { useMutation } from '@tanstack/react-query';

import { registerUser } from '../api/authApi';

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      registerUser(name, email, password),
  });
}
