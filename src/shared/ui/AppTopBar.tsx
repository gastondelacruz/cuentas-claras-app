import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, WalletCards } from "lucide-react-native";

import { colors } from "../theme/colors";

type AppTopBarProps = {
  onSearchPress?: () => void;
};

export function AppTopBar({ onSearchPress }: AppTopBarProps) {
  return (
    <View className="border-b border-neutral200 bg-white">
      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="h-16 flex-row items-center gap-4 px-5">
          <View className="h-10 w-10 items-center justify-center rounded-md bg-primaryBg">
            <WalletCards color={colors.primary} size={22} strokeWidth={2.4} />
          </View>

          <Text className="flex-1 text-xl font-bold text-neutral900">
            Cuentas Claras
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buscar"
            className="h-11 w-11 items-center justify-center rounded-full"
            onPress={onSearchPress}
          >
            <Search color={colors.neutral900} size={22} strokeWidth={2.2} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
