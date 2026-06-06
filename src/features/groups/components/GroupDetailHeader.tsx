import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Settings, WalletCards } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors } from "../../../shared/theme/colors";

type GroupDetailHeaderProps = {
  groupName: string;
  onPressSettings?: () => void;
};

export function GroupDetailHeader({
  groupName,
  onPressSettings,
}: GroupDetailHeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center justify-between border-b border-neutral200 bg-white px-4 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        hitSlop={8}
        onPress={() => navigation.goBack()}
        className="h-10 w-10 items-center justify-center"
      >
        <ChevronLeft color={colors.neutral900} />
      </Pressable>

      <View className="flex-1 flex-row items-center justify-center gap-2 px-2">
        <View className="h-8 w-8 items-center justify-center rounded-md bg-primaryBg">
          <WalletCards color={colors.primary} size={18} strokeWidth={2.4} />
        </View>
        <Text numberOfLines={1} className="text-lg font-bold text-neutral900">
          {groupName}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajustes del grupo"
        hitSlop={8}
        onPress={onPressSettings}
        className="h-10 w-10 items-center justify-center"
      >
        <Settings color={colors.neutral900} />
      </Pressable>
    </View>
  );
}
