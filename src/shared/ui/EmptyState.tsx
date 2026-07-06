import { Image, Pressable, Text, View } from 'react-native';

const emptyGroupsIllustration = require('../../../assets/empty-groups-illustration.png');

type EmptyStateProps = {
  buttonLabel: string;
  description: string;
  disabled?: boolean;
  onPress: () => void;
  title: string;
};

function EmptyStateIllustration() {
  return (
    <View className="mb-5 h-36 w-36 items-center justify-center">
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Ilustración de persona usando el celular con dinero y monedas"
        className="h-36 w-36"
        resizeMode="contain"
        source={emptyGroupsIllustration}
      />
    </View>
  );
}

export function EmptyState({ buttonLabel, description, disabled = false, onPress, title }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-5 pb-12 pt-8">
      <View
        className="w-full items-center rounded-lg bg-white px-5 pb-6 pt-5"
        style={{ boxShadow: '0 16px 28px rgba(17, 24, 39, 0.16)' }}
        testID="empty-state-card"
      >
        <EmptyStateIllustration />
        <View className="items-center gap-3">
          <Text className="text-center text-xl font-bold leading-6 text-neutral900">{title}</Text>
          <Text className="text-center text-sm leading-5 text-neutral500">{description}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          accessibilityState={{ disabled }}
          disabled={disabled}
          className={`mt-5 h-12 w-full items-center justify-center rounded-full px-6 shadow-sm ${disabled ? 'bg-neutral300' : 'bg-primary'}`}
          onPress={onPress}
        >
          <Text className="text-base font-bold text-white">{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
