import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../app/navigation/types";
import { useAuthStore } from "../../../shared/store/authStore";
import { AppTopBar } from "../../../shared/ui/AppTopBar";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export function AuthScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((s) => s.setSession);

  const [activeTab, setActiveTab] = useState<"login" | "register">(
    route.params?.initialTab ?? "login",
  );

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  function handleLogin() {
    setSession(
      { id: "mock-user", email: loginEmail || "user@example.com" },
      "mock-token",
    );
  }

  function handleRegister() {
    setSession(
      { id: "mock-user", email: registerEmail || "user@example.com" },
      "mock-token",
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#f0f0f3]"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* App bar */}
      <AppTopBar />

      {/* Content */}
      <View className="px-4 py-8">
        {/* Card */}
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
              {/* Login heading */}
              <View className="mb-6">
                <Text className="text-2xl font-bold text-[#1a1c1e] text-center">
                  Iniciar Sesión
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1">
                  Accede a tus finanzas compartidas sin esfuerzo.
                </Text>
              </View>

              {/* Email */}
              <View>
                <Text className="text-[#1a1c1e] text-sm font-medium mb-1">
                  Correo Electrónico
                </Text>
                <TextInput
                  className="border border-[#bbcbbb] rounded-xl px-4 py-3 bg-[#f3f3f6] text-[#1a1c1e] mb-4"
                  placeholder="juan@ejemplo.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                />
              </View>

              {/* Password */}
              <View>
                <Text className="text-[#1a1c1e] text-sm font-medium mb-1">
                  Contraseña
                </Text>
                <View className="flex-row items-center border border-[#bbcbbb] rounded-xl bg-[#f3f3f6] mb-4">
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
              </View>

              {/* Login button */}
              <TouchableOpacity
                className="bg-[#006d37] rounded-full py-4 w-full items-center mb-5"
                onPress={handleLogin}
                testID="login-button"
              >
                <Text className="text-white font-semibold text-base">
                  Iniciar Sesión
                </Text>
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
              <TouchableOpacity className="flex-row items-center justify-center border border-[#6c7b6d] rounded-full py-3">
                <Text className="text-[#1a1c1e] font-medium mr-2">G</Text>
                <Text className="text-[#1a1c1e] font-medium">
                  Continuar con Google
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Register heading */}
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
                <Text className="text-[#1a1c1e] text-sm font-medium mb-1">
                  Nombre Completo
                </Text>
                <TextInput
                  className="border border-[#bbcbbb] rounded-xl px-4 py-3 bg-[#f3f3f6] text-[#1a1c1e] mb-4"
                  placeholder="Juan García"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email */}
              <View>
                <Text className="text-[#1a1c1e] text-sm font-medium mb-1">
                  Correo Electrónico
                </Text>
                <TextInput
                  className="border border-[#bbcbbb] rounded-xl px-4 py-3 bg-[#f3f3f6] text-[#1a1c1e] mb-4"
                  placeholder="juan@ejemplo.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={registerEmail}
                  onChangeText={setRegisterEmail}
                />
              </View>

              {/* Password */}
              <View>
                <Text className="text-[#1a1c1e] text-sm font-medium mb-1">
                  Contraseña
                </Text>
                <View className="flex-row items-center border border-[#bbcbbb] rounded-xl bg-[#f3f3f6] mb-4">
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
              </View>

              {/* Register button */}
              <TouchableOpacity
                className="bg-[#006d37] rounded-full py-4 w-full items-center mb-5"
                onPress={handleRegister}
                testID="register-button"
              >
                <Text className="text-white font-semibold text-base">
                  Registrarse
                </Text>
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
              <TouchableOpacity className="flex-row items-center justify-center border border-[#6c7b6d] rounded-full py-3">
                <Text className="text-[#1a1c1e] font-medium mr-2">G</Text>
                <Text className="text-[#1a1c1e] font-medium">
                  Continuar con Google
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
