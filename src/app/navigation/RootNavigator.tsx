import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AgregarGastoScreen } from "../../features/expenses/screens/AgregarGastoScreen";
import { LiquidarDeudasScreen } from "../../features/expenses/screens/LiquidarDeudasScreen";
import { DetalleGrupoScreen } from "../../features/groups/screens/DetalleGrupoScreen";
import { NuevoGrupoScreen } from "../../features/groups/screens/NuevoGrupoScreen";
import { useAuthStore } from "../../shared/store/authStore";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="DetalleGrupo" component={DetalleGrupoScreen} />
      <Stack.Screen name="NuevoGrupo" component={NuevoGrupoScreen} />
      <Stack.Screen name="AgregarGasto" component={AgregarGastoScreen} />
      <Stack.Screen name="LiquidarDeudas" component={LiquidarDeudasScreen} />
    </Stack.Navigator>
  );
}
