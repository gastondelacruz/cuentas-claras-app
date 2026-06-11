import { Image, Pressable, Text, View } from 'react-native';

const emptyIllustration = require('../../../assets/empty.png');

type EmptyStateProps = {
  buttonLabel: string;
  description: string;
  onPress: () => void;
  title: string;
};

function EmptyStateIllustration() {
  return (
    <View className="relative mb-6 h-56 w-56 items-center justify-center">
      <View className="absolute h-56 w-56 rounded-full bg-primary/10" />
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Ilustración de billetera vacía"
        className="h-56 w-56"
        resizeMode="contain"
        source={emptyIllustration}
      />
    </View>
  );
}

export function EmptyState({ buttonLabel, description, onPress, title }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center px-7 pb-12 pt-8">
      <View className="items-center">
        <EmptyStateIllustration />
        <View className="items-center gap-4">
          <Text className="max-w-xs text-center text-4xl font-bold leading-tight text-neutral900">{title}</Text>
          <Text className="max-w-xs text-center text-xl leading-8 text-neutral700">{description}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        className="mt-10 h-20 w-full items-center justify-center rounded-2xl bg-primary shadow-sm"
        onPress={onPress}
      >
        <Text className="text-2xl font-bold text-white">{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}
