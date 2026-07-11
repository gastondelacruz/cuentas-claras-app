import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, WalletCards } from "lucide-react-native";
import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

type InternalScreenHeaderProps = {
  title: string;
  rightAction?: ReactNode;
  onBackPress?: () => void;
};

export function InternalScreenHeader({
  title,
  rightAction,
  onBackPress,
}: InternalScreenHeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="bg-neutral100">
      <SafeAreaView edges={["top"]} className="bg-neutral100" />
      <View className="flex-row items-center justify-between border-b border-neutral200 bg-white px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
          onPress={onBackPress ?? (() => navigation.goBack())}
          className="h-10 w-10 items-center justify-center"
        >
          <ChevronLeft color={colors.neutral900} />
        </Pressable>

        <View className="flex-1 flex-row items-center justify-center gap-2 px-2">
          <Text numberOfLines={1} className="text-lg font-bold text-neutral900">
            {title}
          </Text>
        </View>

        {rightAction ?? <View className="h-10 w-10" />}
      </View>
    </View>
  );
}
