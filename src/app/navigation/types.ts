import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  GroupsList: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  GroupDetail: { groupId?: string } | undefined;
  NewGroup: { groupId?: string } | undefined;
  AddExpense: { groupId?: string; expenseId?: string } | undefined;
  SettleDebts: undefined;
};

export const registeredRouteNames = [
  'Onboarding',
  'Login',
  'Register',
  'Home',
  'GroupsList',
  'GroupDetail',
  'NewGroup',
  'AddExpense',
  'SettleDebts',
  'Profile',
] as const;
