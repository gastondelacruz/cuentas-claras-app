import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CircleDollarSign, Home, PlusCircle, User } from 'lucide-react-native';

import { AgregarGastoScreen } from '../../features/expenses/screens/AgregarGastoScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { ListadoGruposScreen } from '../../features/groups/screens/ListadoGruposScreen';
import { PerfilScreen } from '../../features/profile/screens/PerfilScreen';
import { colors } from '../../shared/theme/colors';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral500,
        headerShown: true,
      }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Home color={color} /> }} />
      <Tab.Screen
        name="ListadoGrupos"
        component={ListadoGruposScreen}
        options={{ tabBarIcon: ({ color }) => <CircleDollarSign color={color} /> }}
      />
      <Tab.Screen
        name="AgregarGasto"
        component={AgregarGastoScreen}
        options={{ tabBarIcon: ({ color }) => <PlusCircle color={color} /> }}
      />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: ({ color }) => <User color={color} /> }} />
    </Tab.Navigator>
  );
}
