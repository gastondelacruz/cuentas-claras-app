import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  GroupsList: undefined;
  PersonalExpenses: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: { initialTab?: 'login' | 'register' } | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  GroupDetail: { groupId?: string } | undefined;
  NewGroup: { groupId?: string } | undefined;
  AddExpense: { groupId?: string; expenseId?: string } | undefined;
  AddPersonalTransaction: { type?: 'expense' | 'income'; transactionId?: string } | undefined;
  SettleDebts: { groupId: string };
};

export const registeredRouteNames = [
  'Onboarding',
  'Auth',
  'Home',
  'GroupsList',
  'PersonalExpenses',
  'GroupDetail',
  'NewGroup',
  'AddExpense',
  'AddPersonalTransaction',
  'SettleDebts',
  'Profile',
] as const;
