import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, CircleDollarSign, Home, PlusCircle, User } from 'lucide-react-native';

import { AddExpenseScreen } from '../../features/expenses/screens/AddExpenseScreen';
import { ActivityScreen } from '../../features/activity/screens/ActivityScreen';
import { GroupsListScreen } from '../../features/groups/screens/GroupsListScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { colors } from '../../shared/theme/colors';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral500,
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ color }) => <Home color={color} /> }}
      />
      <Tab.Screen
        name="GroupsList"
        component={GroupsListScreen}
        options={{ headerShown: false, tabBarLabel: 'Grupos', tabBarIcon: ({ color }) => <CircleDollarSign color={color} /> }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ tabBarLabel: 'Agregar', tabBarIcon: ({ color }) => <PlusCircle color={color} /> }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{ headerShown: false, tabBarLabel: 'Actividad', tabBarIcon: ({ color }) => <Bell color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <User color={color} /> }}
      />
    </Tab.Navigator>
  );
}
