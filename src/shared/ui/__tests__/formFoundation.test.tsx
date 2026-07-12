import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, render, waitFor, waitForElementToBeRemoved } from '@testing-library/react-native';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';
import { z } from 'zod';

import { Input } from '../Input';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormProbe() {
  const { control, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '12345678' },
  });

  return (
    <>
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
      <Text testID="email-value">{watch('email')}</Text>
    </>
  );
}

describe('form foundation', () => {
  it('rejects an invalid email at runtime through the zod schema', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: '12345678' });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: ['email'] })]));
  });

  it('wires Controller, zodResolver, blur validation, and Input error state', async () => {
    const { getByTestId, getByText, queryByText } = render(<LoginFormProbe />);

    fireEvent.changeText(getByTestId('email-input'), 'bad');
    fireEvent(getByTestId('email-input'), 'blur');

    await waitFor(() => {
      expect(getByTestId('email-value')).toHaveTextContent('bad');
      expect(getByText('Enter a valid email')).toBeOnTheScreen();
    });

    const errorRemoved = waitForElementToBeRemoved(() => queryByText('Enter a valid email'));

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
    fireEvent(getByTestId('email-input'), 'blur');

    await errorRemoved;
    expect(getByTestId('email-value')).toHaveTextContent('user@example.com');
  });
});
