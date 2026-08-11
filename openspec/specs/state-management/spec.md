# state-management Specification

## Purpose

Defines the global client-state layer: two Zustand store skeletons (`useAuthStore`, `useSettingsStore`) and the TanStack Query client configuration + provider. At bootstrap, stores hold typed shape stubs with no real persistence beyond in-memory state and secure-store helpers. No business logic or API calls are wired yet.

---

## Requirements

### Requirement: Auth Store Shape

`src/shared/store/authStore.ts` MUST export `useAuthStore` (a Zustand store) with the fields and actions in the table below.

| Field / Action | Type | Initial value |
|----------------|------|---------------|
| `user` | `AuthUser \| null` | `null` |
| `accessToken` | `string \| null` | `null` |
| `isAuthenticated` | `boolean` | `false` |
| `setSession(user, token)` | action | — |
| `clearSession()` | action | — |

`AuthUser` MUST be a TypeScript type with at minimum `id: string` and `email: string`.

#### Scenario: Initial state is unauthenticated

- GIVEN `useAuthStore` is accessed before any action
- WHEN `user`, `accessToken`, `isAuthenticated` are read
- THEN they equal `null`, `null`, `false` respectively

#### Scenario: setSession populates store

- GIVEN `useAuthStore` is in the initial state
- WHEN `setSession({ id: '1', email: 'a@b.com' }, 'tok-abc')` is called
- THEN `user.email === 'a@b.com'`, `accessToken === 'tok-abc'`, `isAuthenticated === true`

#### Scenario: clearSession resets store

- GIVEN `setSession` was previously called with a valid session
- WHEN `clearSession()` is called
- THEN `user === null`, `accessToken === null`, `isAuthenticated === false`

---

### Requirement: Settings Store Shape

`src/shared/store/settingsStore.ts` MUST export `useSettingsStore` with the fields and actions below.

| Field / Action | Type | Initial value |
|----------------|------|---------------|
| `theme` | `'light' \| 'dark'` | `'light'` |
| `language` | `'es' \| 'en'` | `'es'` |
| `setTheme(theme)` | action | — |
| `setLanguage(lang)` | action | — |

#### Scenario: Default theme is light, language is Spanish

- GIVEN `useSettingsStore` is accessed before any action
- WHEN `theme` and `language` are read
- THEN they equal `'light'` and `'es'` respectively

#### Scenario: setTheme and setLanguage update state

- GIVEN the store is in its initial state
- WHEN `setTheme('dark')` and `setLanguage('en')` are called
- THEN `theme === 'dark'` and `language === 'en'`

---

### Requirement: TanStack Query Client Configuration

`src/shared/api/queryClient.ts` MUST export a configured `QueryClient` instance with:
- `defaultOptions.queries.retry`: `2`
- `defaultOptions.queries.staleTime`: `60_000` (1 minute)
- `defaultOptions.queries.refetchOnWindowFocus`: `false`

#### Scenario: QueryClient has expected default options

- GIVEN the exported `queryClient` is inspected
- WHEN `queryClient.getDefaultOptions().queries` is read
- THEN `retry === 2`, `staleTime === 60000`, `refetchOnWindowFocus === false`

---

### Requirement: QueryClientProvider in Root

`AppProviders` MUST wrap the component tree with `<QueryClientProvider client={queryClient}>`. Any component inside the tree MUST be able to call `useQueryClient()` without error.

#### Scenario: useQueryClient resolves inside AppProviders

- GIVEN a test component calls `useQueryClient()` inside `<AppProviders>`
- WHEN the component renders
- THEN the hook returns the configured `queryClient` instance without throwing

#### Scenario: useQueryClient throws outside AppProviders

- GIVEN a component calls `useQueryClient()` without being wrapped in a provider
- WHEN the component renders
- THEN React throws with a missing QueryClient context error

---

### Requirement: Store Accessibility via getState

Both stores MUST expose `getState()` (Zustand built-in) so that non-React code (e.g., Axios interceptors) can read state outside the React tree.

#### Scenario: Interceptor reads accessToken from getState

- GIVEN `setSession(user, 'tok-xyz')` was called
- WHEN `useAuthStore.getState().accessToken` is read outside a React component
- THEN it returns `'tok-xyz'`

---

### Requirement: Server State in React Query

The system MUST keep all server-owned state in React Query hooks and MUST NOT mirror it in Zustand.

#### Scenario: Group list reflects server changes

- GIVEN the groups list is fetched via React Query
- WHEN the data changes on the server
- THEN React Query refetches and screens reflect the new data without Zustand involvement

---

### Requirement: Client/UI State in Zustand

The system MAY keep transient UI state in Zustand (e.g., selected tab, modal visibility, form draft). Server-owned entities MUST NOT be stored in Zustand.

#### Scenario: Modal visibility

- GIVEN a modal is open
- WHEN the user closes it
- THEN Zustand toggles the visibility flag without an API call

---

### Requirement: No Runtime Mocks for Server Entities

The system MUST NOT use seeded mock or local-only data for server-owned entities in production runtime. Fixture data MUST be confined to `__fixtures__/` directories and test files only.

#### Scenario: Group detail screen uses real API data

- GIVEN the group detail screen renders
- WHEN data is loading
- THEN the screen shows a loading skeleton, not mock data

#### Scenario: Fixture import blocked in production code

- GIVEN a non-test file imports from `**/mocks/**`
- WHEN ESLint runs
- THEN it reports a `no-restricted-imports` error
