import Toast from 'react-native-toast-message';

import { useAuthStore } from '../store/authStore';

export function useEmailVerificationGate() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const emailVerified = useAuthStore((state) => state.emailVerified);
  const isEmailVerified = !isAuthenticated || emailVerified;

  function guard(action: () => void) {
    if (!isEmailVerified) {
      Toast.show({
        type: 'info',
        text1: 'Verificá tu email',
        text2: 'Necesitás verificar tu email para usar esta función.',
      });
      return;
    }

    action();
  }

  return { isEmailVerified, guard };
}
