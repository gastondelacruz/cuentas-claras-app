import type { NavigatorScreenParams } from "@react-navigation/native";

import type {
	PersonalTransactionCategoryDetailRouteParams,
	PersonalTransactionType,
} from "../../features/personal-expenses/types";

export type MainTabParamList = {
	GroupsList: undefined;
	PersonalExpenses: undefined;
	Profile: undefined;
};

export type AddPersonalTransactionRouteParams = {
	type?: PersonalTransactionType;
	transactionId?: string;
	returnToPersonalExpenses?: boolean;
	calculatorResult?: string;
};

export type CalculatorSourceParams = Omit<
	AddPersonalTransactionRouteParams,
	"calculatorResult"
>;

export type RootStackParamList = {
	Onboarding: undefined;
	Auth: { initialTab?: "login" | "register" } | undefined;
	Main: NavigatorScreenParams<MainTabParamList> | undefined;
	GroupDetail: { groupId?: string } | undefined;
	NewGroup: { groupId?: string } | undefined;
	AddExpense: { groupId?: string; expenseId?: string } | undefined;
	AddPersonalTransaction: AddPersonalTransactionRouteParams | undefined;
	Calculator: {
		initialAmount: string;
		sourceParams: CalculatorSourceParams;
	};
	PersonalCategoryDetail: PersonalTransactionCategoryDetailRouteParams;
	SettleDebts: { groupId: string };
	VerifyEmail: { token?: string } | undefined;
	AcceptGroupInvitation: { token?: string } | undefined;
};

export const registeredRouteNames = [
	"Onboarding",
	"Auth",
	"GroupsList",
	"PersonalExpenses",
	"GroupDetail",
	"NewGroup",
	"AddExpense",
	"AddPersonalTransaction",
	"Calculator",
	"PersonalCategoryDetail",
	"SettleDebts",
	"VerifyEmail",
	"AcceptGroupInvitation",
	"Profile",
] as const;
