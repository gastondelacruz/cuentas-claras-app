import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	View,
	Text,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { Fingerprint } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";

import { RootStackParamList } from "../../../app/navigation/types";
import { AppTopBar } from "../../../shared/ui/AppTopBar";
import { KeyboardAwareScrollView } from "../../../shared/ui/KeyboardAwareScrollView";
import { useLoginForm } from "../hooks/useLoginForm";
import { useRegisterForm } from "../hooks/useRegisterForm";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

function GoogleLogo() {
	return (
		<Svg
			testID="google-logo"
			width={20}
			height={20}
			viewBox="0 0 24 24"
			accessible={false}
			accessibilityElementsHidden
			importantForAccessibility="no"
		>
			<Path
				fill="#4285F4"
				d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"
			/>
			<Path
				fill="#34A853"
				d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3A7.16 7.16 0 0 1 12 19.23a7.16 7.16 0 0 1-6.74-4.98H1.26v3.1A12 12 0 0 0 12 24Z"
			/>
			<Path
				fill="#FBBC05"
				d="M5.26 14.25A7.2 7.2 0 0 1 4.88 12c0-.78.14-1.54.38-2.25v-3.1H1.26A12 12 0 0 0 0 12c0 1.93.46 3.75 1.26 5.35l4-3.1Z"
			/>
			<Path
				fill="#EA4335"
				d="M12 4.77c1.77 0 3.36.61 4.61 1.81l3.45-3.45C17.94 1.03 15.24 0 12 0A12 12 0 0 0 1.26 6.65l4 3.1A7.16 7.16 0 0 1 12 4.77Z"
			/>
		</Svg>
	);
}

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

	return (
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

							{/* Google and biometric login actions */}
							<View className="mb-6">
								<TouchableOpacity
									accessibilityRole="button"
									accessibilityLabel="Continuar con Google"
									testID="google-button"
									className="flex-row items-center justify-center border border-[#6c7b6d] rounded-full py-3 bg-white"
								>
									<GoogleLogo />
									<Text className="text-[#1a1c1e] font-medium ml-2">
										Continuar con Google
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									accessibilityRole="button"
									accessibilityLabel="Iniciar sesión con huella digital"
									testID="biometric-login-button"
									className="flex-row items-center justify-center border border-[#006d37] rounded-full py-3 mt-3"
								>
									<Fingerprint size={20} color="#006d37" />
									<Text className="text-[#006d37] font-medium ml-2">
										Iniciar con huella digital
									</Text>
								</TouchableOpacity>
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
								{isRegisterPending ? (
									<ActivityIndicator color="white" />
								) : (
									<Text className="text-white font-semibold text-base">
										Registrarse
									</Text>
								)}
							</TouchableOpacity>

							{/* Divider */}
							<View className="flex-row items-center mb-5">
								<View className="flex-1 h-px bg-gray-200" />
								<Text className="text-gray-400 mx-3 text-sm">
									o continuar con
								</Text>
								<View className="flex-1 h-px bg-gray-200" />
							</View>

							{/* Google */}
							<TouchableOpacity
								accessibilityRole="button"
								accessibilityLabel="Continuar con Google"
								testID="google-button"
								className="flex-row items-center justify-center border border-[#6c7b6d] rounded-full py-3 bg-white"
							>
								<GoogleLogo />
								<Text className="text-[#1a1c1e] font-medium ml-2">
									Continuar con Google
								</Text>
							</TouchableOpacity>
						</>
					)}
				</View>
			</View>
		</KeyboardAwareScrollView>
	);
}
