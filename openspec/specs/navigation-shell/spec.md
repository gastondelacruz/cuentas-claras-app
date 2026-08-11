# navigation-shell Specification

## Purpose

Defines the React Navigation shell: a `native-stack` root that switches between an **auth stack** (unauthenticated) and a **main bottom-tabs navigator** (authenticated). All 10 routes render placeholder screens — no real UI logic yet. The navigator drives all future screen work.

---

## Requirements

### Requirement: Auth Stack (Unauthenticated)

The app MUST render the auth `native-stack` containing three placeholder screens — `OnboardingScreen`, `LoginScreen`, and `RegistrarseScreen` — when `isAuthenticated` is `false` in `useAuthStore`.

#### Scenario: Unauthenticated user sees auth stack

- GIVEN `useAuthStore` returns `{ isAuthenticated: false }`
- WHEN the root navigator resolves the active stack
- THEN `OnboardingScreen` is the initial route
- AND `LoginScreen` and `RegistrarseScreen` are reachable via navigation

#### Scenario: Auth screens render placeholder content

- GIVEN any auth stack screen is the active route
- WHEN the screen renders
- THEN a `Text` element with the screen's name (e.g., `"LoginScreen"`) is present
- AND no navigation crash or missing-screen warning is logged

---

### Requirement: Main Tab Navigator (Authenticated)

The app MUST render a `bottom-tabs` navigator containing four tabs — `InicioScreen`, `ListadoGruposScreen`, `AgregarGastoScreen`, and `PerfilScreen` — when `isAuthenticated` is `true`.

#### Scenario: Authenticated user sees main tabs

- GIVEN `useAuthStore` returns `{ isAuthenticated: true }`
- WHEN the root navigator resolves the active stack
- THEN `InicioScreen` is the initial active tab
- AND the bottom tab bar renders four tab items

#### Scenario: Tab screens render placeholder content

- GIVEN any tab screen is the active route
- WHEN it renders
- THEN a `Text` element containing the screen name is present
- AND no undefined-screen warnings appear in the console

---

### Requirement: Additional Stack Screens

The main stack MUST include six additional screens accessible by push navigation: `DetalleGrupoScreen`, `NuevoGrupoScreen`, `AgregarGastoScreen` (stack variant), `LiquidarDeudasScreen`, and all 10 routes from the proposal MUST be registered in the navigator.

#### Scenario: All 10 routes are registered

- GIVEN the navigation configuration is inspected
- WHEN the list of registered screen names is collected
- THEN it includes: `Onboarding`, `Login`, `Registrarse`, `Inicio`, `ListadoGrupos`, `DetalleGrupo`, `NuevoGrupo`, `AgregarGasto`, `LiquidarDeudas`, `Perfil`

#### Scenario: Navigating to a registered stack screen succeeds

- GIVEN the app is on `InicioScreen`
- WHEN `navigation.navigate('DetalleGrupo')` is called
- THEN `DetalleGrupoScreen` renders without error

---

### Requirement: Auth-State-Driven Stack Switch

The root navigator MUST switch between the auth stack and the main tab navigator reactively when `isAuthenticated` changes, without requiring a manual refresh.

#### Scenario: Store transition from unauthenticated to authenticated

- GIVEN the auth stack is rendered (`isAuthenticated: false`)
- WHEN `useAuthStore.setSession(...)` is called with a valid session
- THEN the navigator renders the main tab navigator
- AND the auth stack screens are no longer reachable

#### Scenario: Store transition from authenticated to unauthenticated

- GIVEN the main tab navigator is rendered (`isAuthenticated: true`)
- WHEN `useAuthStore.clearSession()` is called
- THEN the navigator renders the auth stack
- AND `OnboardingScreen` or `LoginScreen` is the active route

---

### Requirement: TypeScript Route Types

The navigation configuration MUST define a `RootStackParamList` and `MainTabParamList` type. All `navigation.navigate()` calls MUST be type-checked at compile time.

#### Scenario: TypeScript rejects unknown route names

- GIVEN `RootStackParamList` is defined with all 10 routes
- WHEN `navigation.navigate('UnknownScreen')` is written
- THEN TypeScript reports a type error at compile time
