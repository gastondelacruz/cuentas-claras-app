import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof loginSchema>;

useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  mode: 'onBlur',
  defaultValues: { email: 'user@example.com', password: '12345678' },
});

// @ts-expect-error unknown fields are rejected by the inferred form contract.
const invalidDefaults: LoginFormValues = { email: 'user@example.com', password: '12345678', unknown: true };

void invalidDefaults;
