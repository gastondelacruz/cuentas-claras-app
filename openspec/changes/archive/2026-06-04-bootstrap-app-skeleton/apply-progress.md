# Apply Progress: bootstrap-app-skeleton

## Mode

Standard Mode (`strict_tdd: false` in `openspec/config.yaml`; project was pre-scaffold).

## Delivery Strategy

Single implementation batch under maintainer-approved `size:exception` / `exception-ok` for the initial project setup.

## Completed Tasks

- [x] 1.1 Expo TypeScript scaffold created via temporary `create-expo-app` output copied into the existing project directory to preserve local `openspec/` artifacts.
- [x] 1.2 Runtime and dev dependencies installed and locked for Expo, NativeWind, React Navigation, TanStack Query, Zustand, Axios, forms/validation, secure storage, fonts, lucide icons, Jest, and RTL.
- [x] 1.3 Screaming architecture folders and required feature screen/type stubs created.
- [x] 1.4 Jest config and setup mocks created for secure-store, navigation, gesture-handler, safe-area, fonts, splash, and reanimated.
- [x] 2.1 Theme token source of truth and typed exports created.
- [x] 2.2 NativeWind Tailwind config wired to shared tokens.
- [x] 2.3 FontGate created with Inter loading and splash gating.
- [x] 2.4 AppProviders, RootLayout, and ErrorBoundary created.
- [x] 3.1 Zustand auth/settings singleton stores created.
- [x] 3.2 QueryClient configured with retry `2`, staleTime `60000`, and no window refetch.
- [x] 3.3 Secure-store refresh token helpers created.
- [x] 3.4 Axios client created with fallback base URL, timeout, auth header interceptor, retry-once 401 refresh, and refresh mutex.
- [x] 4.1 Typed auth/root/tab navigation shell created for all required routes.
- [x] 4.2 Placeholder screens created with route-name text content.
- [x] 4.3 Shared Button/Input primitives and form pattern README created.
- [x] 5.1 Theme/store/query/secure-store tests added.
- [x] 5.2 Axios interceptor and refresh mutex tests added.
- [x] 5.3 Component/provider/error-boundary/navigation tests added.
- [x] 5.4 Verification run: `npm test -- --runInBand` passed, `npx tsc --noEmit` passed, and `npx expo start --offline` started Metro successfully before the tool timeout stopped the long-running server.
- [x] 5.5 Added focused verification-gap coverage for form foundation, navigation reachability/transitions, API environment URL and timeout rejection, negative route typing, FontGate loading behavior, and missing QueryClient provider behavior.

## Verification

- `npm test -- --runInBand`: 13 suites passed, 33 tests passed after verification-gap coverage was added.
- `npx tsc --noEmit`: passed, including compile-time `@ts-expect-error` assertions for unknown form fields and unknown navigation routes.
- `npx expo start --offline`: started project and Metro; command was terminated by tool timeout after confirming server startup behavior.

## Verification Gap Remediation

- Form foundation now has runtime tests for Zod invalid email rejection, `zodResolver` with `mode: 'onBlur'`, `Controller` forwarding value/change/blur/error props to `Input`, valid input clearing the error, and a compile-time inferred-type rejection for unknown fields.
- Navigation shell now has runtime tests for auth stack reachability (`Login`, `Registrarse`), tab bar route presence and placeholder reachability, `DetalleGrupo` stack navigation via a real `NavigationContainer` ref, and reactive auth-store stack switching in both directions.
- Navigation route types now include a compile-time `@ts-expect-error` assertion proving unknown root routes are rejected by TypeScript.
- API client tests now cover `EXPO_PUBLIC_API_URL` module-load configuration and Axios timeout rejection (`ECONNABORTED`) in addition to the prior fallback URL, auth header, refresh, and mutex coverage.
- FontGate now has runtime tests proving children are blocked while `useFonts` reports unloaded and rendered only after fonts load, with splash hide invoked on loaded state.
- AppProviders now has a negative runtime test proving `useQueryClient()` throws outside the provider boundary.

## Deviations

- `create-expo-app` was run in a temporary directory and copied into the existing app directory because the real project directory already contained `openspec/` artifacts and was not empty.
- NativeWind v4 exposes `nativewind/babel` as a preset-like config in this installed version, so `babel.config.js` uses it in `presets` rather than `plugins`.
- NativeWind v4 does not expose a runtime `ThemeProvider`; `AppProviders` includes a local pass-through `NativeWindThemeProvider` boundary while Tailwind/NativeWind tokens are wired through config.

## Issues / Risks

- `npm install` reports 11 moderate vulnerabilities from the scaffold/dependency tree; no `npm audit fix --force` was run because that can introduce breaking upgrades.
- `@testing-library/jest-native` is deprecated, but it remains installed because the planned stack requested it; future cleanup should migrate fully to built-in RTL matchers.
- Expo CLI under Node v26 emitted a warning during the first `expo install` attempt that this Node version is not tested by legacy `expo-cli` messaging, although subsequent Expo commands completed.
- Expo start logs `Using src/app as the root directory for Expo Router` despite `expo-router` not being installed. Metro still starts; this should be watched during device runtime verification because the architecture intentionally uses `src/app` for app composition.
- `openspec/config.yaml` and `openspec/testing-capabilities.md` still describe the app as pre-scaffold/planned; they were not changed in this verification-gap apply because the assigned task was missing test coverage only.
