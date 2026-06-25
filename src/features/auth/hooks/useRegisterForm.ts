import { useState } from 'react';

import { useAuthStore } from '../../../shared/store/authStore';

export function useRegisterForm() {
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleRegister() {
    setSession(
      { id: 'mock-user', name: name || 'Mock User', email: email || 'user@example.com' },
      'mock-token',
    );
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleRegister,
  };
}
