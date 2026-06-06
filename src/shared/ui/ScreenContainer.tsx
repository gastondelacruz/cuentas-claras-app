import { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

type ScreenContainerProps = Omit<ComponentProps<typeof View>, 'className'> & {
  children: ReactNode;
};

export function ScreenContainer({ children, ...props }: ScreenContainerProps) {
  return (
    <View className="flex-1 bg-neutral100" {...props}>
      {children}
    </View>
  );
}
