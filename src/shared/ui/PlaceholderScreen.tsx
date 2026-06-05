import { Text, View } from "react-native";

type PlaceholderScreenProps = {
  name: string;
};

export function PlaceholderScreen({ name }: PlaceholderScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral100 p-6">
      <Text className="text-h1 font-bold text-neutral900">{name}</Text>
      <Text className="mt-2 text-center text-base text-neutral500">
        Placeholder screen for the bootstrap navigation shell.
      </Text>
    </View>
  );
}
