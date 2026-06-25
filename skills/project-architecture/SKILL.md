---
name: project-architecture
description: Screaming Architecture conventions for Cuentas Claras App. Use when creating new files, organizing features, deciding where code should live, or refactoring project structure. Covers feature domains, shared infrastructure, and file placement rules.
version: 1.0.0
---

## When to Apply

Use this skill when:
- Creating new files or folders
- Deciding where a piece of code should live
- Organizing feature domains
- Refactoring project structure
- Reviewing code placement
- Setting up new features
- Fixing or implementing any feature (to confirm correct file placement before writing)

## Core Principle

**Screaming Architecture**: the source tree must communicate the product domains first, not technical layers first. When you look at `src/features/`, you should immediately see what the app does (auth, groups, expenses, profile), not how it's built (controllers, services, repositories).

## Project Structure

```text
src/
  app/                          # Shell: navigation, providers, root layout, error boundaries
    navigation/
      types.ts                  # Centralized navigation param types
  features/                     # Product domains
    auth/
      screens/
      schemas/
      api/
      hooks/
    groups/
      screens/
      components/
      hooks/
      api/
      schemas/
    expenses/
      screens/
      components/
      hooks/
      api/
      schemas/
    profile/
      screens/
      hooks/
  shared/                       # Cross-feature infrastructure
    api/
      client.ts                 # Axios instance with interceptors
      queryClient.ts            # TanStack QueryClient singleton
      tokenStorage.ts           # expo-secure-store helpers
    hooks/
    store/
      authStore.ts
    theme/
    ui/
    utils/
```

## Decision Tree — Where Should Code Live?

```
Route entry, navigation, providers, root layout?
  -> src/app/

Feature screen (route-level)?
  -> src/features/<domain>/screens/

Feature UI component (domain-specific)?
  -> src/features/<domain>/components/

Feature hook (data, behavior, derived state)?
  -> src/features/<domain>/hooks/

Feature API caller (HTTP, wraps client)?
  -> src/features/<domain>/api/

Feature Zod schema / validation?
  -> src/features/<domain>/schemas/

Feature types?
  -> src/features/<domain>/types.ts

Cross-feature infrastructure (HTTP client, QueryClient, token storage, theme, shared UI)?
  -> src/shared/<subfolder>/

Server state (fetched data, mutations)?
  -> React Query (useQuery / useMutation) — NOT Zustand

UI/client state (tabs, modals, local form state)?
  -> useState / Zustand store
```

## Feature Folder Convention

Use this shape when a feature grows:

```text
src/features/<domain>/
  screens/             # Route-level screens for this domain
  components/          # Domain-specific UI components
  hooks/               # Domain-specific hooks
  api/                 # Domain-specific API calls
  store/               # Domain-specific state, only when needed
  schemas/             # Zod schemas and validation rules
  types.ts             # Domain types
```

Only create folders when they are needed. Avoid empty architecture theater.

## View / Hook Separation (MANDATORY)

**Screens and components (`.tsx`) must be pure view — no behavior inside them.**

All behavior (API calls, state derivation, navigation side effects, form logic, event handlers with business logic) belongs in a custom hook. The `.tsx` file only consumes the hook and renders JSX.

### Rule

```
Screen / Component (.tsx)
  -> only: JSX, layout, className, local display state (e.g. toggle visibility)
  -> NEVER: fetch calls, mutation logic, complex derived state, navigation imperative calls

Custom hook (use<Name>.ts)
  -> all behavior: data fetching, mutations, form handling, navigation, derived state
```

### Hook placement

```
Hook is specific to one feature?
  -> src/features/<domain>/hooks/use<Name>.ts

Hook is used by multiple features or the app shell?
  -> src/shared/hooks/use<Name>.ts
```

### Good example

```tsx
// src/features/auth/hooks/useLoginForm.ts
export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const loginMutation = useLogin();

  function submit() {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) { /* set errors */ return; }
    loginMutation.mutate({ email, password }, {
      onSuccess: (res) => { /* setSession */ },
      onError: () => { Toast.show({ type: 'error', ... }); },
    });
  }

  return { email, setEmail, password, setPassword, errors, submit, isPending: loginMutation.isPending };
}

// src/features/auth/screens/AuthScreen.tsx
export function AuthScreen() {
  const { email, setEmail, password, setPassword, errors, submit, isPending } = useLoginForm();

  return (
    // pure JSX — no logic here
  );
}
```

### Bad example

```tsx
// AuthScreen.tsx — behavior living inside the view ❌
export function AuthScreen() {
  const loginMutation = useLogin();

  function handleLogin() {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) { ... }
    loginMutation.mutate(...);
  }

  return <Button onPress={handleLogin} />;
}
```

## Critical Rules

### DO

- Organize by business feature under `features/<domain>/`
- Keep `app/` focused on navigation shell, providers, root layout, and error boundaries
- Keep feature UI, hooks, API calls, and schemas under `src/features/<domain>/`
- Put shared, domain-agnostic code in `src/shared/`
- Use React Query for server state (fetched data, mutations)
- Use Zustand for UI/client state (tabs, modals, local form state)
- **Extract all behavior out of `.tsx` files into custom hooks**

### DON'T

- Place feature business UI directly in `src/app/`
- Create generic top-level layer folders like `components/`, `screens/`, `services/`, or `utils/` under `src/`
- Move feature-specific logic into `shared/` just because two files need it once
- Store server state in Zustand — React Query owns server state
- Create a new QueryClient — use the shared one from `src/shared/api/queryClient.ts`
- Create a new HTTP client — use the shared one from `src/shared/api/client.ts`
- **Put API calls, mutations, navigation logic, or derived state directly inside a `.tsx` file**

## Shared Infrastructure

### API Client

- **HTTP client**: `src/shared/api/client.ts` (axios with auth interceptors + token refresh)
- **QueryClient**: `src/shared/api/queryClient.ts` (TanStack Query singleton)
- **Token storage**: `src/shared/api/tokenStorage.ts` (expo-secure-store helpers)

### State Management

- **Server state**: React Query (`useQuery` / `useMutation`)
- **Client/UI state**: Zustand stores in `src/shared/store/` or `src/features/<domain>/store/`
- **Local component state**: `useState`

### Styling

- Use NativeWind `className` for styling
- Keep design tokens in `src/shared/theme/` and `tailwind.config.js`
- Avoid ad-hoc inline styles except for runtime-only values

### Navigation

- Keep navigation types centralized in `src/app/navigation/types.ts`

## Naming Conventions

| Entity | Pattern | Example |
|---|---|---|
| Feature folder | `features/<domain>/` | `features/groups/` |
| Screen | `<Name>Screen.tsx` | `GroupDetailScreen.tsx` |
| Component | `<Name>.tsx` | `GroupCard.tsx` |
| Query hook | `use<Entity>.ts` | `useGroups.ts`, `useGroupById.ts` |
| Mutation hook | `use<Action><Entity>.ts` | `useCreateGroup.ts`, `useDeleteExpense.ts` |
| API caller | `<entity>Api.ts` | `groupsApi.ts`, `authApi.ts` |
| Zod schema | `<entity>Schema.ts` | `loginSchema.ts`, `groupSchema.ts` |
| Test file | `__tests__/<Name>.test.tsx` | `__tests__/GroupDetailScreen.test.tsx` |

## Examples

### Good: Feature-organized structure

```text
src/features/auth/
  screens/
    AuthScreen.tsx
  hooks/
    useLogin.ts
  api/
    authApi.ts
  schemas/
    loginSchema.ts
```

### Bad: Layer-organized structure

```text
src/
  screens/
    AuthScreen.tsx
    GroupsScreen.tsx
  hooks/
    useLogin.ts
    useGroups.ts
  api/
    authApi.ts
    groupsApi.ts
```

### Good: Domain-specific component in feature

```text
src/features/groups/components/GroupCard.tsx
```

### Bad: Generic component folder

```text
src/components/GroupCard.tsx
```

### Good: Shared infrastructure

```text
src/shared/api/client.ts
src/shared/store/authStore.ts
src/shared/theme/tokens.ts
```

### Bad: Feature-specific code in shared

```text
src/shared/hooks/useGroups.ts  # Groups is a feature, not shared
```

## When in Doubt

Ask yourself:
1. **Am I writing logic inside a `.tsx` file?** → Extract it to a `use<Name>.ts` hook first
2. **Is this hook specific to one feature?** → Put it in `src/features/<domain>/hooks/`
3. **Is this hook used by multiple features?** → Put it in `src/shared/hooks/`
4. **Is this specific to one feature?** → Put it in `src/features/<domain>/`
5. **Is this used by multiple features or the app shell?** → Put it in `src/shared/`
6. **Is this navigation/routing/providers?** → Put it in `src/app/`
7. **Is this server state?** → Use React Query, not Zustand
8. **Is this UI/client state?** → Use Zustand or useState
