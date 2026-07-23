import { ActivityIndicator, Text, View } from "react-native";
import { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CalculatorScreen } from "../../features/calculator/screens/CalculatorScreen";
import { AddExpenseScreen } from "../../features/expenses/screens/AddExpenseScreen";
import { SettleDebtsScreen } from "../../features/expenses/screens/SettleDebtsScreen";
import { GroupDetailScreen } from "../../features/groups/screens/GroupDetailScreen";
import { NewGroupScreen } from "../../features/groups/screens/NewGroupScreen";
import { AddPersonalTransactionScreen } from "../../features/personal-expenses/screens/AddPersonalTransactionScreen";
import { PersonalCategoryDetailScreen } from "../../features/personal-expenses/screens/PersonalCategoryDetailScreen";
import { EmailVerificationRequiredScreen } from "../../features/auth/screens/EmailVerificationRequiredScreen";
import { VerifyEmailScreen } from "../../features/auth/screens/VerifyEmailScreen";
import { AuthScreen } from "../../features/auth/screens/AuthScreen";
import { OnboardingScreen } from "../../features/auth/screens/OnboardingScreen";
import { AcceptGroupInvitationScreen } from "../../features/groups/screens/AcceptGroupInvitationScreen";
import { useEmailVerificationStatus } from "../../features/auth/hooks/useEmailVerification";
import { useSessionRestore } from "../../features/auth/hooks/useSessionRestore";
import { onAuthLogout } from "../../shared/api/authEvents";
import { useAuthStore } from "../../shared/store/authStore";
import { MainTabs } from "./MainTabs";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoginRedirectScreen() {
	return (
		<AuthScreen
			route={
				{ key: "Auth", name: "Auth", params: { initialTab: "login" } } as never
			}
			navigation={{} as never}
		/>
	);
}

export function RootNavigator() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const emailVerified = useAuthStore((state) => state.emailVerified);
	const pendingGroupInvitationToken = useAuthStore(
		(state) => state.pendingGroupInvitationToken,
	);
	useEmailVerificationStatus();
	useSessionRestore();
	const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
	const biometricUnlockRequired = useAuthStore(
		(state) => state.biometricUnlockRequired,
	);

	useEffect(() => {
		return onAuthLogout(() => {
			useAuthStore.getState().clearSession();
		});
	}, []);

	if (isRestoringSession) {
		return (
			<View className="flex-1 items-center justify-center bg-[#f0f0f3]">
				<ActivityIndicator color="#006d37" />
				<Text className="mt-3 text-[#1a1c1e]">Restaurando tu sesión…</Text>
			</View>
		);
	}

	if (biometricUnlockRequired && !isAuthenticated) {
		return <LoginRedirectScreen />;
	}

	const GatedMainScreen = isAuthenticated ? MainTabs : LoginRedirectScreen;
	const GatedGroupDetailScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? GroupDetailScreen
			: EmailVerificationRequiredScreen;
	const GatedNewGroupScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? NewGroupScreen
			: EmailVerificationRequiredScreen;
	const GatedAddExpenseScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? AddExpenseScreen
			: EmailVerificationRequiredScreen;
	const GatedAddPersonalTransactionScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? AddPersonalTransactionScreen
			: EmailVerificationRequiredScreen;
	const GatedCalculatorScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? CalculatorScreen
			: EmailVerificationRequiredScreen;
	const GatedPersonalCategoryDetailScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? PersonalCategoryDetailScreen
			: EmailVerificationRequiredScreen;
	const GatedSettleDebtsScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? SettleDebtsScreen
			: EmailVerificationRequiredScreen;

	const initialRouteName = isAuthenticated
		? pendingGroupInvitationToken
			? "AcceptGroupInvitation"
			: "Main"
		: "Auth";

	return (
		<Stack.Navigator
			key={isAuthenticated ? "authenticated" : "guest"}
			initialRouteName={initialRouteName}
		>
			<Stack.Screen
				name="Onboarding"
				component={OnboardingScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Auth"
				component={AuthScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Main"
				component={GatedMainScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="GroupDetail"
				component={GatedGroupDetailScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="NewGroup"
				component={GatedNewGroupScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="AddExpense"
				component={GatedAddExpenseScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="AddPersonalTransaction"
				component={GatedAddPersonalTransactionScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Calculator"
				component={GatedCalculatorScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="PersonalCategoryDetail"
				component={GatedPersonalCategoryDetailScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="SettleDebts"
				component={GatedSettleDebtsScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="VerifyEmail"
				component={VerifyEmailScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="AcceptGroupInvitation"
				component={AcceptGroupInvitationScreen}
				initialParams={{ token: pendingGroupInvitationToken ?? undefined }}
				options={{ headerShown: false }}
			/>
		</Stack.Navigator>
	);
}
