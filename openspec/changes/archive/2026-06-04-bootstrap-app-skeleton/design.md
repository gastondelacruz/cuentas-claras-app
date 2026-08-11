# Design: Bootstrap Expo App Skeleton

## Technical Approach

Scaffold an Expo (managed) + TypeScript app with screaming architecture. All infrastructure is wired but inert: navigation switches on a Zustand auth flag, Axios carries JWT + a stubbed refresh flow, design tokens flow from a single source into both NativeWind and TS, and Inter fonts gate the first render. No business logic, no live endpoints. This realizes the proposal's six capabilities and satisfies all six delta specs.

## Architecture Decisions

### Decision: Scaffold with `create-expo-app` (NOT `expo init`)

**Choice**: `npx create-expo-app@latest cuentas-claras-app --template blank-typescript`.
**Correction**: The proposal/project.md say `expo init` — that command is **DEPRECATED and removed** from modern Expo CLI. `create-expo-app` is the official replacement.
**Rationale**: Avoids a guaranteed scaffold failure on Darwin with current Expo SDK.

### Decision: Zustand store as a module-level singleton

**Choice**: `useAuthStore` is created once at module load via `create<AuthStore>()(...)` in `src/shared/store/authStore.ts` and exported as the hook itself. Interceptors call `useAuthStore.getState()` / `.setState()` — no provider, no React context.
**Alternatives considered**: React Context auth state (rejected — `getState()` is impossible outside the tree; interceptors run in plain JS).
**Rationale**: Zustand's `create()` returns a hook that doubles as a vanilla store. The singleton guarantees the SAME instance for React components and the Axios module, so `getState().accessToken` is always current. This is the linchpin for risk #1.

### Decision: Hand-rolled refresh mutex (NOT `axios-auth-refresh`)

**Choice**: A module-level `refreshPromise: Promise<string> | null` in `client.ts`. The first 401 sets `refreshPromise = runRefresh()`; concurrent 401s `await` the SAME promise, then retry with the resolved token. `refreshPromise` resets to `null` in a `finally`. Each request is retried at most once (guarded by a `_retry` flag on the config).
**Alternatives considered**: `axios-auth-refresh` library (rejected — adds a dependency, hides the queue, and is harder to drive the spec's "exactly once" + "failed refresh → clearSession" tests against a mocked adapter).
**Rationale**: Zero extra deps, full control over the secure-store + `clearSession()` failure path, trivially mockable. Satisfies risk #2 and the "single refresh call" scenario. Bootstrap uses a STUB `/auth/refresh` (mocked adapter), but the wiring/contract is production-correct.

### Decision: Single source of truth for design tokens via a framework-agnostic module

**Choice**: Raw values live in `src/shared/theme/tokens.js` (plain object literals, CommonJS-friendly, zero imports). `tailwind.config.js` does `const tokens = require('./src/shared/theme/tokens')` and spreads into `theme.extend`. `colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts` import the SAME `tokens` and re-export typed views.
**Alternatives considered**: Duplicating hex values in both config and TS (rejected — drift); loading `.ts` into the CJS tailwind config via jiti/babel-register (rejected — build fragility).
**Rationale**: `tailwind.config.js` is CommonJS and cannot cleanly import `.ts`. A plain `.js` token module is consumable by both worlds with no transpile hacks and no duplication. Resolves risk #3.

### Decision: Font gate via `expo-font` + `expo-splash-screen`

**Choice**: A `FontGate` component calls `useFonts({ Inter: ... })`, keeps the native splash visible with `SplashScreen.preventAutoHideAsync()`, and returns `null` until `fontsLoaded`, calling `hideAsync()` on ready. Navigation is a child of the gate, so it never renders before Inter is available.
**Rationale**: Blocks navigation render deterministically (risk #4) and avoids font-flash. Matches the design-tokens spec scenario "app does not render until fonts are ready".

## Provider Composition (order matters)

```
GestureHandlerRootView
  └─ SafeAreaProvider
      └─ FontGate                  (expo-font + splash — BLOCKS render)
          └─ QueryClientProvider   (queryClient from src/shared/api/queryClient.ts)
              └─ ThemeProvider      (NativeWind)
                  └─ children (NavigationContainer + RootNavigator)
```

Stores (`useAuthStore`, `useSettingsStore`) are **module singletons** — they need NO provider; they are simply imported where used. `AppProviders` lives in `src/app/providers/AppProviders.tsx`; `FontGate` in `src/app/providers/FontGate.tsx`; `RootLayout.tsx` wraps `AppProviders` around the navigator and the `ErrorBoundary`.

## Refresh Flow (data flow)

```
request ─→ [req interceptor: attach Bearer from useAuthStore.getState().accessToken]
response 401 ─→ refreshPromise?  ── no ──→ runRefresh(): POST /auth/refresh (getRefreshToken from secure-store)
                     │                          │ success → setState(accessToken) → resolve(token)
                     └── yes → await ───────────┘ failure → useAuthStore.clearSession() → reject
                                   └─→ retry original request once with new token
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json`, `app.json`, `tsconfig.json`, `babel.config.js` | Create | Scaffold + locked deps + NativeWind babel plugin |
| `tailwind.config.js` | Create | `require('./src/shared/theme/tokens')`, extend theme |
| `src/shared/theme/tokens.js` | Create | **SoT** raw token values (CJS-friendly) |
| `src/shared/theme/{colors,typography,spacing,radius}.ts` | Create | Typed re-exports of tokens |
| `src/shared/store/{authStore,settingsStore}.ts` | Create | Zustand singletons (risk #1) |
| `src/shared/api/client.ts` | Create | Axios instance + interceptors + refresh mutex (risk #2) |
| `src/shared/api/queryClient.ts` | Create | QueryClient (retry 2, staleTime 60s, no refetchOnFocus) |
| `src/shared/api/tokenStorage.ts` | Create | secure-store helpers |
| `src/shared/ui/{Button,Input}.tsx`, `README.md` | Create | UI primitives + form pattern doc |
| `src/app/providers/{AppProviders,FontGate}.tsx` | Create | Provider composition (risk #4) |
| `src/app/navigation/{RootNavigator,AuthStack,MainTabs}.tsx`, `types.ts` | Create | Typed navigators, 10 routes |
| `src/app/RootLayout.tsx`, `src/app/ErrorBoundary.tsx` | Create | Root + error boundary |
| `src/features/{auth,groups,expenses,profile}/screens/*`, `types.ts` | Create | 10 placeholder screens |
| `jest.config.js`, `__tests__/setup.ts` | Create | jest-expo preset + mocks |

## Interfaces / Contracts

```typescript
// src/shared/store/authStore.ts
export type AuthUser = { id: string; email: string };
interface AuthStore {
  user: AuthUser | null; accessToken: string | null; isAuthenticated: boolean;
  setSession: (user: AuthUser, token: string) => void;
  clearSession: () => void;
}
export const useAuthStore = create<AuthStore>()(/* ... */); // singleton

// src/shared/api/tokenStorage.ts
export function getRefreshToken(): Promise<string | null>;
export function setRefreshToken(token: string): Promise<void>;
export function clearRefreshToken(): Promise<void>;

// src/app/navigation/types.ts
export type RootStackParamList = {
  Onboarding: undefined; Login: undefined; Registrarse: undefined;
  Main: undefined; DetalleGrupo: { groupId?: string };
  NuevoGrupo: undefined; AgregarGasto: undefined; LiquidarDeudas: undefined;
};
export type MainTabParamList = {
  Inicio: undefined; ListadoGrupos: undefined; AgregarGasto: undefined; Perfil: undefined;
};
```

`navigation.navigate()` is typed via `NativeStackNavigationProp<RootStackParamList>` / `BottomTabNavigationProp<MainTabParamList>`, giving compile-time rejection of unknown routes.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | tokens, stores (getState/setSession/clearSession), tokenStorage | jest-expo + mocked `expo-secure-store` |
| Unit | refresh mutex: single refresh on concurrent 401, retry-once, failed-refresh→clearSession | `axios-mock-adapter` |
| Component | `Button`/`Input` render, error display, Controller+zodResolver | `@testing-library/react-native` |
| Integration | `AppProviders` mounts child; `useQueryClient()` resolves; nav stack switches on auth flag | RTL render + mocked navigation |

`strict_tdd: false` at bootstrap (config). Tests are written WITH scaffold (not test-first); flip to `true` after the jest-expo baseline is green.

## Migration / Rollout

No data migration. Greenfield scaffold. Rollback = delete `cuentas-claras-app/` and re-run `create-expo-app` (per proposal rollback plan).

## Open Questions

- [ ] Confirm NativeWind major version (v2 vs v4) at install — affects `babel.config.js` plugin and `tailwind.config.js` `content` globs.
- [ ] Inter delivery: `@expo-google-fonts/inter` package vs bundled `.ttf` assets (both work with `useFonts`; pick at apply time).
