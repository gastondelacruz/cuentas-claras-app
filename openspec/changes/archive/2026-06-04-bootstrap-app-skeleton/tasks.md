# Tasks: Bootstrap Expo App Skeleton

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900-1400 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 scaffold/theme -> PR 2 state/api -> PR 3 navigation/ui/tests |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Expo scaffold, config, theme tokens, providers | PR 1 | Base scaffold; verify `tsc` and Jest smoke. |
| 2 | Zustand stores, QueryClient, secure-store, Axios refresh mutex | PR 2 | Depends on PR 1; includes API/store unit tests. |
| 3 | Navigation shell, placeholders, form primitives, integration tests | PR 3 | Depends on PR 2; verifies all route/spec scenarios. |

## Phase 1: Scaffold and Configuration

- [x] 1.1 Create Expo TypeScript scaffold via `npx create-expo-app@latest cuentas-claras-app --template blank-typescript`; add `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`.
- [x] 1.2 Install and lock Expo, NativeWind, React Navigation, TanStack Query, Zustand, Axios, react-hook-form, zod, lucide, fonts, secure-store, Jest, and RTL dependencies.
- [x] 1.3 Create `src/app`, `src/features/{auth,groups,expenses,profile}`, and `src/shared/{ui,api,store,hooks,utils,theme}` with required screen/type stubs.
- [x] 1.4 Configure `jest.config.js` and `__tests__/setup.ts` mocks for secure-store and navigation.

## Phase 2: Theme and Providers

- [x] 2.1 Create `src/shared/theme/tokens.js` and typed exports in `colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts` with spec token values.
- [x] 2.2 Create `tailwind.config.js` consuming `tokens.js` so `bg-primary`, `text-debt`, and `text-accent` resolve.
- [x] 2.3 Create `src/app/providers/FontGate.tsx` with `expo-font` and splash gating for Inter.
- [x] 2.4 Create `src/app/providers/AppProviders.tsx`, `RootLayout.tsx`, and `ErrorBoundary.tsx` with required provider order and fallback `testID`.

## Phase 3: State and API Infrastructure

- [x] 3.1 Create Zustand singletons `src/shared/store/authStore.ts` and `settingsStore.ts` with required state/actions.
- [x] 3.2 Create `src/shared/api/queryClient.ts` with retry `2`, staleTime `60000`, and no window refetch.
- [x] 3.3 Create `src/shared/api/tokenStorage.ts` backed by `expo-secure-store`.
- [x] 3.4 Create `src/shared/api/client.ts` with base URL fallback, timeout, auth header interceptor, retry-once 401 refresh, and refresh mutex.

## Phase 4: Navigation, Screens, and Forms

- [x] 4.1 Create typed navigation files in `src/app/navigation/{types,RootNavigator,AuthStack,MainTabs}.tsx` covering all 10 routes.
- [x] 4.2 Create placeholder screens under each `src/features/*/screens/` folder with route-name text content.
- [x] 4.3 Create `src/shared/ui/Button.tsx`, `Input.tsx`, and `README.md` documenting the Controller + zodResolver form pattern.

## Phase 5: Verification

- [x] 5.1 Add tests for theme token exports, NativeWind config values, store initial/actions, QueryClient options, and secure-store helpers.
- [x] 5.2 Add Axios tests for auth headers, fallback URL, non-401 behavior, retry-once refresh, failed refresh clearing session, and concurrent 401 single refresh.
- [x] 5.3 Add component/integration tests for `Button`, `Input`, `AppProviders`, `ErrorBoundary`, auth/main navigator switching, and all route placeholders.
- [x] 5.4 Run `npm test`, `npx tsc --noEmit`, and `npx expo start` smoke validation; mark completed tasks only after green results.
