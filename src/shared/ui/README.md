# Shared UI Form Pattern

Use Zod as the form contract, pass it to `useForm` through `zodResolver`, and connect fields with `Controller` so shared inputs stay presentation-only.

```tsx
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from './Input';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { control } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  return (
    <Controller
      control={control}
      name="email"
      render={({ field, fieldState }) => (
        <Input
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          placeholder="Email"
          errorMessage={fieldState.error?.message}
          testID="email-input"
        />
      )}
    />
  );
}
```
