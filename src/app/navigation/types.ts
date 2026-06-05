export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Registrarse: undefined;
  Main: undefined;
  DetalleGrupo: { groupId?: string } | undefined;
  NuevoGrupo: undefined;
  AgregarGasto: undefined;
  LiquidarDeudas: undefined;
};

export type MainTabParamList = {
  Inicio: undefined;
  ListadoGrupos: undefined;
  AgregarGasto: undefined;
  Perfil: undefined;
};

export const registeredRouteNames = [
  'Onboarding',
  'Login',
  'Registrarse',
  'Inicio',
  'ListadoGrupos',
  'DetalleGrupo',
  'NuevoGrupo',
  'AgregarGasto',
  'LiquidarDeudas',
  'Perfil',
] as const;
