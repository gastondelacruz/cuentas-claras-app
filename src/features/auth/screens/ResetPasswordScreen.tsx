import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Eye, EyeOff, KeyRound } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";

import type { RootStackParamList } from "../../../app/navigation/types";
import { AuthFooter } from "../../../shared/ui/AuthFooter";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { KeyboardAwareScrollView } from "../../../shared/ui/KeyboardAwareScrollView";
import { useResetPasswordForm } from "../hooks/useResetPasswordForm";

type Props = NativeStackScreenProps<RootStackParamList, "ResetPassword">;

export function ResetPasswordScreen({}: Props) {
	const {
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		showPassword,
		setShowPassword,
		showConfirmPassword,
		setShowConfirmPassword,
		errors,
		isSubmitted,
		handleSubmit,
	} = useResetPasswordForm();

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
						<View className="mb-4 items-center">
							<View className="items-center justify-center rounded-full bg-[#d9f5e3] p-4">
								<KeyRound size={28} color="#006d37" />
							</View>
						</View>
						<Text className="text-center text-2xl font-bold text-[#1a1c1e]">
							Nueva Contraseña
						</Text>
						<Text className="mt-2 text-center text-sm leading-5 text-[#4f5b52]">
							Creá una contraseña segura para proteger tu cuenta.
						</Text>
						<PasswordField
							label="Nueva Contraseña"
							value={password}
							onChangeText={setPassword}
							visible={showPassword}
							onToggle={() => setShowPassword((value) => !value)}
							error={errors.password}
							testID="new-password-input"
						/>
						<PasswordField
							label="Confirmar Contraseña"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							visible={showConfirmPassword}
							onToggle={() => setShowConfirmPassword((value) => !value)}
							error={errors.confirmPassword}
							testID="confirm-password-input"
						/>
						<View className="mt-1 rounded-lg bg-[#f0f2f1] p-3">
							<Text className="text-xs font-medium text-[#435047]">
								ⓘ Mínimo 8 caracteres, incluye una letra y un número.
							</Text>
						</View>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Actualizar contraseña"
							testID="reset-password-submit"
							onPress={handleSubmit}
							className="mt-4 items-center rounded-lg bg-[#006d37] py-3"
						>
							<Text className="text-base font-semibold text-white">
								Actualizar Contraseña
							</Text>
						</Pressable>
						{isSubmitted ? (
							<Text
								accessibilityRole="alert"
								className="mt-3 text-center text-sm font-medium text-[#006d37]"
							>
								Contraseña lista para actualizar.
							</Text>
						) : null}
					</View>
					<AuthFooter />
				</View>
			</KeyboardAwareScrollView>
		</View>
	);
}

type PasswordFieldProps = {
	label: string;
	value: string;
	onChangeText: (value: string) => void;
	visible: boolean;
	onToggle: () => void;
	error?: string;
	testID: string;
};

function PasswordField({
	label,
	value,
	onChangeText,
	visible,
	onToggle,
	error,
	testID,
}: PasswordFieldProps) {
	const Icon = visible ? Eye : EyeOff;
	return (
		<View className="mt-5">
			<Text
				className={`mb-1 text-xs font-semibold ${error ? "text-red-600" : "text-[#38463c]"}`}
			>
				{label}
			</Text>
			<View
				className={`flex-row items-center rounded-xl border bg-[#f8f8fb] ${error ? "border-red-500" : "border-[#bbcbbb]"}`}
			>
				<TextInput
					testID={testID}
					className="flex-1 px-4 py-3 text-[#1a1c1e]"
					placeholder="••••••••"
					placeholderTextColor="#7b8790"
					secureTextEntry={!visible}
					value={value}
					onChangeText={onChangeText}
					accessibilityLabel={label}
				/>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel={
						visible
							? `Ocultar ${label.toLowerCase()}`
							: `Mostrar ${label.toLowerCase()}`
					}
					onPress={onToggle}
					className="px-3"
				>
					<Icon size={20} color="#78847a" />
				</Pressable>
			</View>
			{error ? (
				<Text className="mt-1 text-xs text-red-500">{error}</Text>
			) : null}
		</View>
	);
}
