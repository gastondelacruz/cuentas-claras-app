import { Image, Text, View } from 'react-native';

type AvatarProps = {
  name: string;
  initials: string;
  sourceUrl?: string;
  overlap?: boolean;
};

export function Avatar({ name, initials, sourceUrl, overlap = false }: AvatarProps) {
  if (sourceUrl) {
    return (
      <Image
        accessibilityLabel={name}
        className={overlap ? '-ml-3 h-8 w-8 rounded-full border-2 border-white bg-neutral200' : 'h-8 w-8 rounded-full border-2 border-white bg-neutral200'}
        source={{ uri: sourceUrl }}
      />
    );
  }

  return (
    <View
      className={
        overlap
          ? '-ml-3 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary'
          : 'h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary'
      }
    >
      <Text className="text-xs font-bold text-white">{initials}</Text>
    </View>
  );
}
