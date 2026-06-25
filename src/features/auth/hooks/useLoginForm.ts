import { useState } from 'react';
import Toast from 'react-native-toast-message';

import { useAuthStore } from '../../../shared/store/authStore';
import { setRefreshToken } from '../../../shared/api/tokenStorage';
import { loginSchema, LoginFormValues } from '../schemas/loginSchema';
import { useLogin } from './useLogin';

export function useLoginForm() {
  const setSession = useAuthStore((s) => s.setSession);
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});

  function handleLogin() {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }
    setErrors({});
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (response) => {
          const { accessToken, refreshToken, user } = response.data;
          await setRefreshToken(refreshToken);
          setSession(user, accessToken);
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Error al iniciar sesión',
            text2: 'Verificá tus credenciales',
          });
        },
      },
    );
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    isPending: loginMutation.isPending,
    handleLogin,
  };
}
