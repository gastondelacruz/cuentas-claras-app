import { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

type CardVariant = 'default' | 'groupPreview' | 'activityList' | 'summary' | 'centered' | 'centeredError';

type CardProps = Omit<ComponentProps<typeof View>, 'className'> & {
  children: ReactNode;
  variant?: CardVariant;
};

const cardClassNames: Record<CardVariant, string> = {
  default: 'rounded-lg border border-neutral200 bg-white',
  groupPreview: 'w-64 overflow-hidden rounded-lg border border-neutral200 bg-white',
  activityList: 'overflow-hidden rounded-lg border border-neutral200 bg-white',
  summary: 'flex-1 rounded-lg border border-neutral200 bg-white p-4',
  centered: 'items-center rounded-lg border border-neutral200 bg-white p-6',
  centeredError: 'items-center rounded-lg border border-debt bg-white p-6',
};

export function Card({ children, variant = 'default', ...props }: CardProps) {
  return (
    <View className={cardClassNames[variant]} {...props}>
      {children}
    </View>
  );
}
