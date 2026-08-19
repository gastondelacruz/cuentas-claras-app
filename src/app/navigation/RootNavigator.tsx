import { ActivityIndicator, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
	createNativeStackNavigator,
	type NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { CalculatorScreen } from "../../features/calculator/screens/CalculatorScreen";
import { AddExpenseScreen } from "../../features/expenses/screens/AddExpenseScreen";
import { SettleDebtsScreen } from "../../features/expenses/screens/SettleDebtsScreen";
import { GroupDetailScreen } from "../../features/groups/screens/GroupDetailScreen";
import { NewGroupScreen } from "../../features/groups/screens/NewGroupScreen";
import { AddPersonalTransactionScreen } from "../../features/personal-expenses/screens/AddPersonalTransactionScreen";
import { PersonalCategoryDetailScreen } from "../../features/personal-expenses/screens/PersonalCategoryDetailScreen";
import { PersonalTransactionCategoriesScreen } from "../../features/personal-expenses/screens/PersonalTransactionCategoriesScreen";
import { CreatePersonalTransactionCategoryScreen } from "../../features/personal-expenses/screens/CreatePersonalTransactionCategoryScreen";
import { EmailVerificationRequiredScreen } from "../../features/auth/screens/EmailVerificationRequiredScreen";
import { VerifyEmailScreen } from "../../features/auth/screens/VerifyEmailScreen";
import { ForgotPasswordScreen } from "../../features/auth/screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../../features/auth/screens/ResetPasswordScreen";
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
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList, "Auth">>();

	return (
		<AuthScreen
			route={
				{ key: "Auth", name: "Auth", params: { initialTab: "login" } } as never
			}
			navigation={navigation}
		/>
	);
}

export function RootNavigator() {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const wasAuthenticated = useRef(isAuthenticated);
	const emailVerified = useAuthStore((state) => state.emailVerified);
	const pendingGroupInvitationToken = useAuthStore(
		(state) => state.pendingGroupInvitationToken,
	);
	useEmailVerificationStatus();
	useSessionRestore();
	const isRestoringSession = useAuthStore((state) => state.isRestoringSession);

	useEffect(() => {
		return onAuthLogout(() => {
			useAuthStore.getState().clearSession();
		});
	}, []);

	useEffect(() => {
		if (isAuthenticated && !wasAuthenticated.current) {
			navigation.reset({ index: 0, routes: [{ name: "Main" }] });
		}
		wasAuthenticated.current = isAuthenticated;
	}, [isAuthenticated, navigation]);

	if (isRestoringSession) {
		return (
			<View className="flex-1 items-center justify-center bg-[#f0f0f3]">
				<ActivityIndicator color="#006d37" />
				<Text className="mt-3 text-[#1a1c1e]">Restaurando tu sesión…</Text>
			</View>
		);
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
	const GatedPersonalTransactionCategoriesScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? PersonalTransactionCategoriesScreen
			: EmailVerificationRequiredScreen;
	const GatedCreatePersonalTransactionCategoryScreen = !isAuthenticated
		? LoginRedirectScreen
		: emailVerified
			? CreatePersonalTransactionCategoryScreen
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
				name="ForgotPassword"
				component={ForgotPasswordScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="ResetPassword"
				component={ResetPasswordScreen}
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
				name="PersonalTransactionCategories"
				component={GatedPersonalTransactionCategoriesScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="CreatePersonalTransactionCategory"
				component={GatedCreatePersonalTransactionCategoryScreen}
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
