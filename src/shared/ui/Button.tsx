import { ComponentProps } from 'react';
import { Pressable, Text } from 'react-native';

type ButtonProps = Omit<ComponentProps<typeof Pressable>, 'children' | 'className'> & {
  label: string;
};

export function Button({ label, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={disabled ? 'items-center rounded-md bg-primary px-4 py-3 opacity-50' : 'items-center rounded-md bg-primary px-4 py-3'}
      {...props}
    >
      <Text className="text-base font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
