import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  CircleDollarSign,
  Home,
  User,
  WalletCards,
} from "lucide-react-native";

import { GroupsListScreen } from "../../features/groups/screens/GroupsListScreen";
import { HomeScreen } from "../../features/home/screens/HomeScreen";
import { PersonalTransactionsScreen } from "../../features/personal-expenses/screens/PersonalTransactionsScreen";
import { ProfileScreen } from "../../features/profile/screens/ProfileScreen";
import { colors } from "../../shared/theme/colors";
import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral500,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tab.Screen
        name="GroupsList"
        component={GroupsListScreen}
        options={{
          tabBarLabel: "Grupos",
          tabBarIcon: ({ color }) => <CircleDollarSign color={color} />,
        }}
      />
      <Tab.Screen
        name="PersonalExpenses"
        component={PersonalTransactionsScreen}
        options={{
          tabBarLabel: "Gastos",
          tabBarIcon: ({ color }) => <WalletCards color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
