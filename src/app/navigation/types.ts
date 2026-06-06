export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  GroupDetail: { groupId?: string } | undefined;
  NewGroup: undefined;
  AddExpense: undefined;
  SettleDebts: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  GroupsList: undefined;
  AddExpense: undefined;
  Activity: undefined;
  Profile: undefined;
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
  'Activity',
  'SettleDebts',
  'Profile',
] as const;
