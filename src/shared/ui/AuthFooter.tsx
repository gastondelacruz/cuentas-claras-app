import { Text, View } from "react-native";

export function AuthFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<View className="items-center gap-2 pb-2 pt-8">
			<Text className="text-xs font-semibold text-[#303b32]">
				Cuentas Claras
			</Text>
			<Text className="text-center text-xs text-[#303b32]">
				© {currentYear} Cuentas Claras. De La Cruz Bayugar Gaston.
			</Text>
		</View>
	);
}
