# app-bootstrap Specification

## Purpose

Defines the Expo TypeScript scaffold, screaming-architecture directory structure, root provider composition (theme, query client, auth store), RootLayout entry point, and error boundary. This is the foundation every other capability builds on — no business logic, only wiring.

---

## Requirements

### Requirement: Expo TypeScript Scaffold

The project MUST initialize as an Expo managed workflow app using the TypeScript blank template. The root `package.json` MUST lock all stack dependencies declared in the proposal.

#### Scenario: Fresh project initializes without errors

- GIVEN a machine with Node 18+ and EAS CLI installed
- WHEN `expo init` completes with the TypeScript template
- THEN `npx expo start` runs without errors
- AND TypeScript compilation (`tsc --noEmit`) reports zero errors

#### Scenario: Jest baseline passes on scaffold

- GIVEN the project has been scaffolded and `jest-expo` configured
- WHEN `npm test` is executed with no feature code written
- THEN Jest exits with code 0
- AND at least one smoke test (e.g., `Button` renders) passes

---

### Requirement: Screaming Architecture Directory Structure

The project MUST create the following top-level source directories: `src/app/`, `src/features/auth/`, `src/features/groups/`, `src/features/expenses/`, `src/features/profile/`, `src/shared/ui/`, `src/shared/api/`, `src/shared/store/`, `src/shared/hooks/`, `src/shared/utils/`, `src/shared/theme/`.

#### Scenario: Directory tree exists after scaffold

- GIVEN the scaffold step has completed
- WHEN the file system is inspected
- THEN all directories listed in the requirement are present
- AND each feature directory contains at minimum a `screens/` subfolder and a `types.ts` stub

---

### Requirement: Root Provider Composition

`src/app/providers/` MUST export a single `AppProviders` component that composes `QueryClientProvider`, the NativeWind `ThemeProvider`, and `useAuthStore` initialization. `RootLayout.tsx` MUST render `AppProviders` wrapping the navigation tree.

#### Scenario: Providers inject without crashing

- GIVEN a test renders `<AppProviders><View testID="child" /></AppProviders>`
- WHEN the component mounts
- THEN `getByTestId('child')` is reachable (providers do not throw)
- AND `useQueryClient()` resolves inside the tree without error

#### Scenario: Auth store is accessible inside providers

- GIVEN a component inside `AppProviders` calls `useAuthStore()`
- WHEN the component renders
- THEN the hook returns the initial state `{ user: null, accessToken: null, isAuthenticated: false }`

---

### Requirement: Error Boundary

`RootLayout.tsx` MUST wrap the application tree with an `ErrorBoundary` component. When a child throws a render error, the boundary MUST display a fallback UI instead of a blank screen.

#### Scenario: Render error is caught and fallback shown

- GIVEN a child component unconditionally throws during render
- WHEN `RootLayout` mounts with that child
- THEN the error boundary catches the error
- AND a fallback element with `testID="error-fallback"` is visible in the tree

#### Scenario: Non-crashing subtrees render normally

- GIVEN no child throws
- WHEN `RootLayout` mounts
- THEN the error boundary renders its children without modification

---

### Requirement: Jest + jest-expo Configuration

The project MUST include a valid `jest.config.js` (or equivalent in `package.json`) using the `jest-expo` preset. A `__tests__/setup.ts` file MUST mock `expo-secure-store` and `@react-navigation/native`.

#### Scenario: Secure-store mock is active in tests

- GIVEN `__tests__/setup.ts` mocks `expo-secure-store`
- WHEN a test calls `SecureStore.getItemAsync('refreshToken')`
- THEN the mock returns `'mock-refresh-token'` without invoking native modules

#### Scenario: Navigation mock resolves useNavigation

- GIVEN `@react-navigation/native` is mocked in setup
- WHEN a component calls `useNavigation()`
- THEN the hook returns `{ navigate: jest.fn() }` without throwing
