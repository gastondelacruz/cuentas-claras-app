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

export type PersonalTransactionCategoryPreview = {
	name: string;
	color: string;
	iconKey:
		| "banknote"
		| "wallet"
		| "coins"
		| "circle-dollar-sign"
		| "credit-card"
		| "landmark"
		| "piggy-bank"
		| "trending-up"
		| "hand-coins"
		| "receipt"
		| "briefcase-business"
		| "shopping-bag"
		| "shopping-cart"
		| "store"
		| "utensils"
		| "coffee"
		| "cake-slice"
		| "house"
		| "building-2"
		| "car"
		| "bus"
		| "bike"
		| "plane"
		| "heart-pulse"
		| "dumbbell"
		| "graduation-cap"
		| "gift"
		| "wrench"
		| "wallet-cards"
		| "card-sim";
};

export type AddPersonalTransactionRouteParams = {
	type?: PersonalTransactionType;
	transactionId?: string;
	latestTransactionDate?: string;
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
	ForgotPassword: undefined;
	ResetPassword: undefined;
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
	PersonalTransactionCategories:
		| {
				type?: PersonalTransactionType;
				returnToAddPersonalTransaction?: boolean;
				previewCategory?: PersonalTransactionCategoryPreview;
		  }
		| undefined;
	CreatePersonalTransactionCategory: {
		type: PersonalTransactionType;
		returnToAddPersonalTransaction?: boolean;
	};
	SettleDebts: { groupId: string };
	VerifyEmail: { token?: string } | undefined;
	AcceptGroupInvitation: { token?: string } | undefined;
};

export const registeredRouteNames = [
	"Onboarding",
	"Auth",
	"ForgotPassword",
	"ResetPassword",
	"GroupsList",
	"PersonalExpenses",
	"GroupDetail",
	"NewGroup",
	"AddExpense",
	"AddPersonalTransaction",
	"Calculator",
	"PersonalCategoryDetail",
	"PersonalTransactionCategories",
	"CreatePersonalTransactionCategory",
	"SettleDebts",
	"VerifyEmail",
	"AcceptGroupInvitation",
	"Profile",
] as const;
