import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WalletCards } from "lucide-react-native";

import { colors } from "../theme/colors";

export function AppTopBar() {
  return (
    <View className="bg-neutral100">
      <SafeAreaView edges={["top"]} className="bg-neutral100" />
      <View className="border-b border-neutral200 bg-white">
        <View className="h-16 flex-row items-center gap-4 px-5">
          <View className="h-10 w-10 items-center justify-center rounded-md bg-primaryBg">
            <WalletCards color={colors.primary} size={22} strokeWidth={2.4} />
          </View>

          <Text className="flex-1 text-xl font-bold text-neutral900">
            Cuentas Claras
          </Text>
        </View>
      </View>
    </View>
  );
}
