import { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

type CardVariant = 'default' | 'groupPreview' | 'activityList' | 'summary' | 'centered' | 'centeredError';

type CardProps = Omit<ComponentProps<typeof View>, 'className'> & {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
};

const baseCardClassName = 'rounded-lg border border-neutral200 bg-white';

const cardClassNames: Record<CardVariant, string> = {
  default: '',
  groupPreview: 'overflow-hidden',
  activityList: 'overflow-hidden',
  summary: 'flex-1 p-4',
  centered: 'items-center p-6',
  centeredError: 'items-center border-debt p-6',
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  return (
    <View className={joinClassNames(baseCardClassName, cardClassNames[variant], className)} {...props}>
      {children}
    </View>
  );
}
