import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { OnboardingScreen } from '../../features/auth/screens/OnboardingScreen';
import { RegistrarseScreen } from '../../features/auth/screens/RegistrarseScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registrarse" component={RegistrarseScreen} />
    </Stack.Navigator>
  );
}
