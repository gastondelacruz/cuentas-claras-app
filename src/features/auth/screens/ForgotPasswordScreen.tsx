import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCircle2, Mail } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";

import type { RootStackParamList } from "../../../app/navigation/types";
import { colors } from "../../../shared/theme/colors";
import { AuthFooter } from "../../../shared/ui/AuthFooter";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { KeyboardAwareScrollView } from "../../../shared/ui/KeyboardAwareScrollView";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
	const {
		email,
		setEmail,
		errors,
		isSubmitted,
		isPending,
		cooldownSeconds,
		requestError,
		handleSubmit,
	} = useForgotPasswordForm();

	return (
		<View className="flex-1 bg-[#f7f7fa]">
			<InternalScreenHeader title="Cuentas Claras" />
			<KeyboardAwareScrollView
				contentContainerStyle={{ flexGrow: 1, padding: 20 }}
			>
				<View className="flex-1 justify-center">
					<View
						className="rounded-2xl bg-white p-5"
						style={{
							elevation: 2,
							shadowColor: "#000",
							shadowOpacity: 0.05,
							shadowRadius: 10,
						}}
					>
						<Text className="text-center text-2xl font-bold text-[#1a1c1e]">
							¿Olvidaste tu contraseña?
						</Text>
						<Text className="mt-2 text-center text-sm leading-5 text-[#4f5b52]">
							Ingresá tu correo electrónico y te enviaremos un enlace para que
							puedas restablecerla.
						</Text>
						<Text
							className={`mt-8 mb-1 text-xs font-semibold ${errors.email ? "text-red-600" : "text-[#38463c]"}`}
						>
							Correo Electrónico
						</Text>
						<View
							className={`flex-row items-center rounded-xl border bg-[#f8f8fb] px-3 ${errors.email ? "border-red-500" : "border-[#bbcbbb]"}`}
						>
							<Mail size={18} color="#78847a" />
							<TextInput
								className="flex-1 px-3 py-3 text-[#1a1c1e]"
								placeholder="ejemplo@correo.com"
								placeholderTextColor="#cbd4cc"
								keyboardType="email-address"
								autoCapitalize="none"
								accessibilityLabel="Correo electrónico"
								value={email}
								onChangeText={setEmail}
							/>
						</View>
						{errors.email ? (
							<Text className="mt-1 text-xs text-red-500">{errors.email}</Text>
						) : null}
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Enviar enlace de recuperación"
							testID="forgot-password-submit"
							onPress={() => void handleSubmit()}
							disabled={isPending || cooldownSeconds > 0}
							className="mt-5 items-center rounded-full bg-[#006d37] py-3"
						>
							<Text className="text-sm font-semibold text-white">
								{isPending
									? "Enviando…"
									: cooldownSeconds > 0
										? `Reenviar en ${cooldownSeconds}s`
										: "Enviar Enlace"}
							</Text>
						</Pressable>
						{requestError ? (
							<Text
								accessibilityRole="alert"
								className="mt-3 text-center text-sm text-red-600"
							>
								{requestError}
							</Text>
						) : null}
						{isSubmitted ? (
							<View
								accessibilityRole="alert"
								className="mt-4 flex-row items-center gap-2 rounded-lg bg-[#e4f7ea] p-3"
							>
								<CheckCircle2 size={18} color={colors.primary} />
								<Text className="flex-1 text-sm text-[#245b36]">
									Si el correo está registrado, recibirás un enlace para
									restablecer tu contraseña.
								</Text>
							</View>
						) : null}
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Volver al inicio de sesión"
							onPress={() =>
								navigation.navigate("Auth", { initialTab: "login" })
							}
							className="mt-6 items-center"
						>
							<Text className="text-sm font-semibold text-[#006d37]">
								Volver al inicio de sesión
							</Text>
						</Pressable>
					</View>
					<AuthFooter />
				</View>
			</KeyboardAwareScrollView>
		</View>
	);
}
