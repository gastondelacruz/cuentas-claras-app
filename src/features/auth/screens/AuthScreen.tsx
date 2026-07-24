import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	View,
	Text,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { Fingerprint } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../app/navigation/types";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { KeyboardAwareScrollView } from "../../../shared/ui/KeyboardAwareScrollView";
import { useBiometricAuth } from "../hooks/useBiometricAuth";
import { useLoginForm } from "../hooks/useLoginForm";
import { useRegisterForm } from "../hooks/useRegisterForm";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export function AuthScreen({ route }: Props) {
	const [activeTab, setActiveTab] = useState<"login" | "register">(
		route.params?.initialTab ?? "login",
	);

	useEffect(() => {
		if (route.params?.initialTab) {
			setActiveTab(route.params.initialTab);
		}
	}, [route.params?.initialTab]);

	const {
		enabled: biometricEnabled,
		isAvailable: biometricAvailable,
		isPending: isBiometricPending,
		unlock,
	} = useBiometricAuth();

	const {
		email: loginEmail,
		setEmail: setLoginEmail,
		password: loginPassword,
		setPassword: setLoginPassword,
		showPassword: showLoginPassword,
		setShowPassword: setShowLoginPassword,
		errors: loginErrors,
		isPending: isLoginPending,
		handleLogin,
	} = useLoginForm();

	const {
		name,
		setName,
		email: registerEmail,
		setEmail: setRegisterEmail,
		password: registerPassword,
		setPassword: setRegisterPassword,
		confirmPassword: registerConfirmPassword,
		setConfirmPassword: setRegisterConfirmPassword,
		showPassword: showRegisterPassword,
		setShowPassword: setShowRegisterPassword,
		errors: registerErrors,
		isPending: isRegisterPending,
		handleRegister,
	} = useRegisterForm();

	const isAuthPending =
		isBiometricPending || isLoginPending || isRegisterPending;

	return (
		<View className="flex-1">
			<KeyboardAwareScrollView
				className="flex-1 bg-[#f0f0f3]"
				contentContainerStyle={{ paddingBottom: 40 }}
			>
				<AppTopBar />

				<View className="px-4 py-8">
					<View
						className="bg-white rounded-2xl p-6"
						style={{
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.06,
							shadowRadius: 8,
							elevation: 2,
						}}
					>
						{/* Tab switcher */}
						<View className="flex-row bg-[#eeeef0] rounded-full p-1 mb-6">
							<TouchableOpacity
								className={`flex-1 py-2 items-center rounded-full ${activeTab === "login" ? "bg-white" : ""}`}
								onPress={() => setActiveTab("login")}
							>
								<Text
									className={
										activeTab === "login"
											? "font-bold text-[#1a1c1e]"
											: "text-gray-500"
									}
								>
									Entrar
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className={`flex-1 py-2 items-center rounded-full ${activeTab === "register" ? "bg-white" : ""}`}
								onPress={() => setActiveTab("register")}
							>
								<Text
									className={
										activeTab === "register"
											? "font-bold text-[#1a1c1e]"
											: "text-gray-500"
									}
								>
									Registrarse
								</Text>
							</TouchableOpacity>
						</View>

						{activeTab === "login" ? (
							<>
								<View className="mb-6">
									<Text className="text-2xl font-bold text-[#1a1c1e] text-center">
										Iniciar Sesión
									</Text>
									<Text className="text-sm text-gray-500 text-center mt-1">
										Accede a tus finanzas compartidas sin esfuerzo.
									</Text>
								</View>

								{/* Biometric login action */}
								<View className="mb-6">
									{biometricEnabled && biometricAvailable ? (
										<TouchableOpacity
											accessibilityRole="button"
											accessibilityLabel="Iniciar sesión con huella digital"
											testID="biometric-login-button"
											onPress={() => void unlock()}
											disabled={isBiometricPending}
											accessibilityState={{
												busy: isBiometricPending,
												disabled: isBiometricPending,
											}}
											className="flex-row items-center justify-center border border-[#006d37] rounded-full py-3 mt-3"
										>
											<Fingerprint size={20} color="#006d37" />
											<Text className="text-[#006d37] font-medium ml-2">
												Iniciar con huella digital
											</Text>
										</TouchableOpacity>
									) : null}
								</View>

								{/* Email */}
								<View>
									<Text
										testID="email-label"
										className={
											loginErrors.email
												? "text-red-600 text-sm font-medium mb-1"
												: "text-[#1a1c1e] text-sm font-medium mb-1"
										}
									>
										Correo Electrónico
									</Text>
									<TextInput
										className={`border rounded-xl px-4 py-3 bg-[#f3f3f6] text-[#1a1c1e] ${loginErrors.email ? "border-red-500" : "border-[#bbcbbb] mb-4"}`}
										placeholder="juan@ejemplo.com"
										placeholderTextColor="#9ca3af"
										keyboardType="email-address"
										autoCapitalize="none"
										value={loginEmail}
										onChangeText={setLoginEmail}
									/>
									{loginErrors.email ? (
										<Text className="text-red-500 text-xs mb-2">
											{loginErrors.email}
										</Text>
									) : null}
								</View>

								{/* Password */}
								<View>
									<Text
										testID="password-label"
										className={
											loginErrors.password
												? "text-red-600 text-sm font-medium mb-1"
												: "text-[#1a1c1e] text-sm font-medium mb-1"
										}
									>
										Contraseña
									</Text>
									<View
										className={`flex-row items-center border rounded-xl bg-[#f3f3f6] ${loginErrors.password ? "border-red-500" : "border-[#bbcbbb] mb-4"}`}
									>
										<TextInput
											className="flex-1 px-4 py-3 text-[#1a1c1e]"
											placeholder="••••••••"
											placeholderTextColor="#9ca3af"
											secureTextEntry={!showLoginPassword}
											value={loginPassword}
											onChangeText={setLoginPassword}
										/>
										<TouchableOpacity
											className="px-4"
											onPress={() => setShowLoginPassword((v) => !v)}
										>
											<Text className="text-gray-500 text-sm">
												{showLoginPassword ? "🙈" : "👁"}
											</Text>
										</TouchableOpacity>
									</View>
									{loginErrors.password ? (
										<Text className="text-red-500 text-xs mb-2">
											{loginErrors.password}
										</Text>
									) : null}
								</View>

								{/* Login button */}
								<TouchableOpacity
									className={`bg-[#006d37] rounded-full py-4 w-full items-center mb-5 ${isLoginPending ? "opacity-50" : ""}`}
									onPress={handleLogin}
									testID="login-button"
									disabled={isLoginPending}
								>
									{isLoginPending ? (
										<ActivityIndicator color="white" />
									) : (
										<Text className="text-white font-semibold text-base">
											Iniciar Sesión
										</Text>
									)}
								</TouchableOpacity>
							</>
						) : (
							<>
								<View className="mb-6">
									<Text className="text-2xl font-bold text-[#1a1c1e] text-center">
										Crear Cuenta
									</Text>
									<Text className="text-sm text-gray-500 text-center mt-1">
										Únete a Cuentas Claras y gestiona tus finanzas sin estrés.
									</Text>
								</View>

								{/* Name */}
								<View>
									<Text
										testID="register-name-label"
										className={
											registerErrors.name
												? "text-red-600 text-sm font-medium mb-1"
												: "text-[#1a1c1e] text-sm font-medium mb-1"
										}
									>
										Nombre Completo
									</Text>
									<TextInput
										className={`border rounded-xl px-4 py-3 bg-[#f3f3f6] text-[#1a1c1e] ${registerErrors.name ? "border-red-500" : "border-[#bbcbbb] mb-4"}`}
										placeholder="Juan García"
										placeholderTextColor="#9ca3af"
										autoCapitalize="words"
										value={name}
										onChangeText={setName}
									/>
									{registerErrors.name ? (
										<Text className="text-red-500 text-xs mb-2">
											{registerErrors.name}
										</Text>
									) : null}
								</View>

								{/* Email */}
								<View>
									<Text
										testID="register-email-label"
										className={
											registerErrors.email
												? "text-red-600 text-sm font-medium mb-1"
												: "text-[#1a1c1e] text-sm font-medium mb-1"
										}
									>
										Correo Electrónico
									</Text>
									<TextInput
										className={`border rounded-xl px-4 py-3 bg-[#f3f3f6] text-[#1a1c1e] ${registerErrors.email ? "border-red-500" : "border-[#bbcbbb] mb-4"}`}
										placeholder="juan@ejemplo.com"
										placeholderTextColor="#9ca3af"
										keyboardType="email-address"
										autoCapitalize="none"
										value={registerEmail}
										onChangeText={setRegisterEmail}
									/>
									{registerErrors.email ? (
										<Text className="text-red-500 text-xs mb-2">
											{registerErrors.email}
										</Text>
									) : null}
								</View>

								{/* Password */}
								<View>
									<Text
										testID="register-password-label"
										className={
											registerErrors.password
												? "text-red-600 text-sm font-medium mb-1"
												: "text-[#1a1c1e] text-sm font-medium mb-1"
										}
									>
										Contraseña
									</Text>
									<View
										className={`flex-row items-center border rounded-xl bg-[#f3f3f6] ${registerErrors.password ? "border-red-500" : "border-[#bbcbbb] mb-4"}`}
									>
										<TextInput
											className="flex-1 px-4 py-3 text-[#1a1c1e]"
											placeholder="••••••••"
											placeholderTextColor="#9ca3af"
											secureTextEntry={!showRegisterPassword}
											value={registerPassword}
											onChangeText={setRegisterPassword}
										/>
										<TouchableOpacity
											className="px-4"
											onPress={() => setShowRegisterPassword((v) => !v)}
										>
											<Text className="text-gray-500 text-sm">
												{showRegisterPassword ? "🙈" : "👁"}
											</Text>
										</TouchableOpacity>
									</View>
									{registerErrors.password ? (
										<Text className="text-red-500 text-xs mb-2">
											{registerErrors.password}
										</Text>
									) : null}
								</View>

								{/* Confirm password */}
								<View>
									<Text
										testID="register-confirm-password-label"
										className={
											registerErrors.confirmPassword
												? "text-red-600 text-sm font-medium mb-1"
												: "text-[#1a1c1e] text-sm font-medium mb-1"
										}
									>
										Repetir contraseña
									</Text>
									<View
										className={`flex-row items-center border rounded-xl bg-[#f3f3f6] ${registerErrors.confirmPassword ? "border-red-500" : "border-[#bbcbbb] mb-4"}`}
									>
										<TextInput
											className="flex-1 px-4 py-3 text-[#1a1c1e]"
											placeholder="Repetí tu contraseña"
											placeholderTextColor="#9ca3af"
											secureTextEntry={!showRegisterPassword}
											value={registerConfirmPassword}
											onChangeText={setRegisterConfirmPassword}
										/>
										<TouchableOpacity
											accessibilityRole="button"
											accessibilityLabel={
												showRegisterPassword
													? "Ocultar contraseñas"
													: "Mostrar contraseñas"
											}
											className="px-4"
											onPress={() => setShowRegisterPassword((v) => !v)}
										>
											<Text className="text-gray-500 text-sm">
												{showRegisterPassword ? "🙈" : "👁"}
											</Text>
										</TouchableOpacity>
									</View>
									{registerErrors.confirmPassword ? (
										<Text className="text-red-500 text-xs mb-2">
											{registerErrors.confirmPassword}
										</Text>
									) : null}
								</View>

								{/* Register button */}
								<TouchableOpacity
									className={`bg-[#006d37] rounded-full py-4 w-full items-center mb-5 ${isRegisterPending ? "opacity-50" : ""}`}
									onPress={handleRegister}
									testID="register-button"
									disabled={isRegisterPending}
								>
									<Text className="text-white font-semibold text-base">
										Registrarse
									</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
				</View>
			</KeyboardAwareScrollView>

			{isAuthPending ? (
				<Pressable
					testID="auth-loading-overlay"
					className="absolute inset-0 z-50 items-center justify-center bg-black/20"
					accessibilityRole="progressbar"
					accessibilityLabel="Autenticando"
					accessibilityState={{ busy: true }}
					pointerEvents="auto"
					onPress={() => undefined}
				>
					<ActivityIndicator color="#006d37" />
				</Pressable>
			) : null}
		</View>
	);
}
