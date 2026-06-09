export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  GroupDetail: { groupId?: string } | undefined;
  NewGroup: undefined;
  AddExpense: { groupId?: string } | undefined;
  SettleDebts: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  GroupsList: undefined;
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
