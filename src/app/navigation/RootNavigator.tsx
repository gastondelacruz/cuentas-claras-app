import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddExpenseScreen } from '../../features/expenses/screens/AddExpenseScreen';
import { SettleDebtsScreen } from '../../features/expenses/screens/SettleDebtsScreen';
import { GroupDetailScreen } from '../../features/groups/screens/GroupDetailScreen';
import { NewGroupScreen } from '../../features/groups/screens/NewGroupScreen';
import { AddPersonalTransactionScreen } from '../../features/personal-expenses/screens/AddPersonalTransactionScreen';
import { onAuthLogout } from '../../shared/api/authEvents';
import { useAuthStore } from '../../shared/store/authStore';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    return onAuthLogout(() => {
      useAuthStore.getState().clearSession();
    });
  }, []);

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NewGroup" component={NewGroupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddPersonalTransaction" component={AddPersonalTransactionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettleDebts" component={SettleDebtsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
