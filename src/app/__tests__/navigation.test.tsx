import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { RootNavigator } from "../navigation/RootNavigator";
import { registeredRouteNames, RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../../shared/store/authStore";

const mainTabLabels = [
  "Inicio",
  "Grupos",
  "Actividad",
  "Perfil",
] as const;

describe("navigation shell", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it("registers all route names expected by the bootstrap spec", () => {
    expect(registeredRouteNames).toEqual([
      "Onboarding",
      "Login",
      "Register",
      "Home",
      "GroupsList",
      "GroupDetail",
      "NewGroup",
      "AddExpense",
      "Activity",
      "SettleDebts",
      "Profile",
    ]);
  });

  it("renders auth stack while unauthenticated", async () => {
    const navigationRef = createNavigationContainerRef<RootStackParamList>();
    const { findByText } = render(
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect(await findByText("OnboardingScreen")).toBeOnTheScreen();

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    act(() => {
      navigationRef.navigate("Login");
    });
    expect(await findByText("LoginScreen")).toBeOnTheScreen();

    act(() => {
      navigationRef.navigate("Register");
    });
    expect(await findByText("RegisterScreen")).toBeOnTheScreen();
  });

  it("renders main tabs while authenticated", async () => {
    useAuthStore
      .getState()
      .setSession({ id: "1", email: "a@b.com" }, "tok-abc");

    const { findByText, getAllByText, getByLabelText, getByText, queryByText } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect(await findByText("Cuentas Claras")).toBeOnTheScreen();
    expect(await findByText("Te deben")).toBeOnTheScreen();
    expect(queryByText("HomeScreen")).toBeNull();

    expect(mainTabLabels).toHaveLength(4);

    for (const tabLabel of mainTabLabels) {
      expect(getAllByText(tabLabel).length).toBeGreaterThan(0);
    }

    fireEvent.press(getByText("Grupos"));
    expect(await findByText("Balance Neto Total")).toBeOnTheScreen();

    fireEvent.press(getByLabelText("Abrir menú de creación"));
    expect(await findByText("Crear nuevo gasto")).toBeOnTheScreen();

    fireEvent.press(getByText("Actividad"));
    expect(await findByText("Gastos este mes")).toBeOnTheScreen();

    fireEvent.press(getByText("Perfil"));
    expect(await findByText("Alex Thompson")).toBeOnTheScreen();
    expect(await findByText("Preferencias")).toBeOnTheScreen();
  });

  it("navigates to registered stack screens and switches stacks when auth state changes", async () => {
    const navigationRef = createNavigationContainerRef<RootStackParamList>();
    const { findByText, queryByText } = render(
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>,
    );

    expect(await findByText("OnboardingScreen")).toBeOnTheScreen();

    act(() => {
      useAuthStore
        .getState()
        .setSession({ id: "1", email: "a@b.com" }, "tok-abc");
    });

    expect(await findByText("Cuentas Claras")).toBeOnTheScreen();
    expect(queryByText("OnboardingScreen")).toBeNull();
    expect(queryByText("HomeScreen")).toBeNull();

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    act(() => {
      navigationRef.navigate("GroupDetail", { groupId: "group-1" });
    });

    expect(await findByText("Viaje a Europa 2024")).toBeOnTheScreen();

    act(() => {
      navigationRef.navigate("AddExpense");
    });

    expect(await findByText("Crear Gasto")).toBeOnTheScreen();

    act(() => {
      useAuthStore.getState().clearSession();
    });

    expect(await findByText("OnboardingScreen")).toBeOnTheScreen();
    expect(queryByText("Viaje a Europa 2024")).toBeNull();
  });
});
