import { ComponentProps } from 'react';
import { Pressable, Text } from 'react-native';

type ButtonProps = Omit<ComponentProps<typeof Pressable>, 'children'> & {
  label: string;
};

export function Button({ label, disabled, className, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`items-center rounded-md bg-primary px-4 py-3 ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...props}
    >
      <Text className="text-base font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
