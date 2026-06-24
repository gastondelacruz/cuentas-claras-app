import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../app/navigation/types';
import { useAuthStore } from '../../../shared/store/authStore';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin() {
    setSession({ id: 'mock-user', email: email || 'user@example.com' }, 'mock-token');
  }

  function handleGoogleLogin() {
    setSession({ id: 'google-user', email: 'google@example.com' }, 'mock-google-token');
  }

  return (
    <ScrollView
      className="flex-1 bg-[#f9f9fc]"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View className="flex-row items-center px-4 pt-16 pb-8">
        <View className="w-10 h-10 bg-[#006d37] rounded-xl items-center justify-center mr-3">
          <Text className="text-white font-bold text-lg">C</Text>
        </View>
        <Text className="text-[#1a1c1e] text-xl font-semibold">Cuentas Claras</Text>
      </View>

      {/* Segmented Tabs */}
      <View className="mx-4 flex-row bg-gray-100 rounded-full p-1 mb-8">
        <View className="flex-1 bg-[#006d37] rounded-full py-2 items-center">
          <Text className="text-white font-medium text-sm">Entrar</Text>
        </View>
        <TouchableOpacity
          className="flex-1 py-2 items-center"
          onPress={() => navigation.navigate('Register')}
        >
          <Text className="text-gray-500 font-medium text-sm">Registrarse</Text>
        </TouchableOpacity>
      </View>

      <View className="px-4">
        {/* Headline */}
        <Text className="text-[#1a1c1e] text-2xl font-bold mb-1">
          Bienvenido de nuevo
        </Text>
        <Text className="text-[#6c7b6d] text-sm mb-6">
          Accede a tus finanzas compartidas sin esfuerzo.
        </Text>

        {/* Google Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center border border-[#6c7b6d] rounded-full py-3 mb-5"
          onPress={handleGoogleLogin}
        >
          <Text className="text-[#1a1c1e] font-medium mr-2">G</Text>
          <Text className="text-[#1a1c1e] font-medium">Continuar con Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center mb-5">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-400 mx-3 text-sm">o</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-[#1a1c1e] text-sm font-medium mb-1">
            Correo Electrónico
          </Text>
          <TextInput
            className="border border-[#6c7b6d] rounded-lg px-4 py-3 text-[#1a1c1e] bg-white"
            placeholder="juan@ejemplo.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View className="mb-4">
          <Text className="text-[#1a1c1e] text-sm font-medium mb-1">Contraseña</Text>
          <View className="flex-row items-center border border-[#6c7b6d] rounded-lg bg-white">
            <TextInput
              className="flex-1 px-4 py-3 text-[#1a1c1e]"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              className="px-4"
              onPress={() => setShowPassword((v) => !v)}
            >
              <Text className="text-[#6c7b6d] text-sm">{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Remember me + Forgot password */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setRememberMe((v) => !v)}
          >
            <View
              className={`w-5 h-5 rounded border mr-2 items-center justify-center ${
                rememberMe ? 'bg-[#006d37] border-[#006d37]' : 'border-[#6c7b6d] bg-white'
              }`}
            >
              {rememberMe && <Text className="text-white text-xs">✓</Text>}
            </View>
            <Text className="text-[#1a1c1e] text-sm">Recuérdame</Text>
          </TouchableOpacity>
          <Pressable>
            <Text className="text-[#006d37] text-sm">¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className="bg-[#006d37] rounded-full py-4 items-center mb-4"
          onPress={handleLogin}
        >
          <Text className="text-white font-semibold text-base">Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text className="text-[#6c7b6d] text-xs text-center mb-8">
          Al continuar, aceptas nuestros{' '}
          <Text className="text-[#006d37]">Términos de Servicio</Text>.
        </Text>

        {/* Feature Pills */}
        <View className="flex-row justify-center gap-3">
          <View className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2">
            <Text className="text-sm mr-1">🔒</Text>
            <Text className="text-[#1a1c1e] text-xs font-medium">Seguro y Encriptado</Text>
          </View>
          <View className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2">
            <Text className="text-sm mr-1">⚡</Text>
            <Text className="text-[#1a1c1e] text-xs font-medium">Liquidación Instantánea</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
