import { Info } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useEmailVerificationBanner } from "../hooks/useEmailVerificationBanner";

type EmailVerificationBannerProps = {
	visible: boolean;
};

export function EmailVerificationBanner({
	visible,
}: EmailVerificationBannerProps) {
	const { handleResend, isResendDisabled } = useEmailVerificationBanner();

	if (!visible) return null;

	return (
		<View
			accessibilityRole="alert"
			className="mx-4 mt-3 flex-row items-center gap-3 rounded-2xl px-4 py-3"
			style={{ backgroundColor: "#ff9875" }}
			testID="email-verification-banner"
		>
			<Info color="#3b0900" size={20} />
			<View className="flex-1">
				<Text className="text-sm font-semibold" style={{ color: "#3b0900" }}>
					Verifica tu email para poder usar la app
				</Text>
			</View>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Reenviar email de verificación"
				accessibilityState={{ disabled: isResendDisabled }}
				disabled={isResendDisabled}
				onPress={handleResend}
				className="rounded-full bg-white/80 px-3 py-2"
			>
				<Text className="text-xs font-bold" style={{ color: "#3b0900" }}>
					Reenviar
				</Text>
			</Pressable>
		</View>
	);
}
