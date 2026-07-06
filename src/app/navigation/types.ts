import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
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
  VerifyEmail: { token?: string } | undefined;
  AcceptGroupInvitation: { token?: string } | undefined;
};

export const registeredRouteNames = [
  'Onboarding',
  'Auth',
  'GroupsList',
  'PersonalExpenses',
  'GroupDetail',
  'NewGroup',
  'AddExpense',
  'AddPersonalTransaction',
  'SettleDebts',
  'VerifyEmail',
  'AcceptGroupInvitation',
  'Profile',
] as const;
