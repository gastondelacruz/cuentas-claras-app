import { ComponentProps } from 'react';
import { Text, View } from 'react-native';

type ChipTone = 'neutral' | 'success' | 'debt';

type ChipProps = Omit<ComponentProps<typeof View>, 'className'> & {
  label: string;
  tone?: ChipTone;
  variant?: 'default' | 'summary';
};

const chipClassNames: Record<'default' | 'summary', Record<ChipTone, { container: string; text: string }>> = {
  default: {
    neutral: { container: 'self-start rounded-full bg-neutral100 px-3 py-1', text: 'text-sm font-semibold text-neutral500' },
    success: { container: 'self-start rounded-full bg-green-50 px-3 py-1', text: 'text-sm font-semibold text-success' },
    debt: { container: 'self-start rounded-full bg-red-50 px-3 py-1', text: 'text-sm font-semibold text-debt' },
  },
  summary: {
    neutral: { container: 'mt-3 self-start rounded-full bg-neutral100 px-3 py-1', text: 'text-sm font-semibold text-neutral500' },
    success: { container: 'mt-3 self-start rounded-full bg-green-50 px-3 py-1', text: 'text-sm font-semibold text-success' },
    debt: { container: 'mt-3 self-start rounded-full bg-red-50 px-3 py-1', text: 'text-sm font-semibold text-debt' },
  },
};

export function Chip({ label, tone = 'neutral', variant = 'default', ...props }: ChipProps) {
  const toneClass = chipClassNames[variant][tone];

  return (
    <View className={toneClass.container} {...props}>
      <Text className={toneClass.text}>{label}</Text>
    </View>
  );
}
