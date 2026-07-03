import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const appLogo = require("../../../assets/app-logo.png");

export function AppTopBar() {
  return (
    <View className="bg-neutral100">
      <SafeAreaView edges={["top"]} className="bg-neutral100" />
      <View className="border-b border-neutral200 bg-white">
        <View className="h-16 flex-row items-center gap-4 px-5">
          <View className="h-10 w-10 items-center justify-center rounded-md bg-white">
            <Image
              source={appLogo}
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              className="h-9 w-9"
            />
          </View>

          <Text className="flex-1 text-xl font-bold text-neutral900">
            Cuentas Claras
          </Text>
        </View>
      </View>
    </View>
  );
}
