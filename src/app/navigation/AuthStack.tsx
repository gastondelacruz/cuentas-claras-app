import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthScreen } from '../../features/auth/screens/AuthScreen';
import { OnboardingScreen } from '../../features/auth/screens/OnboardingScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}
