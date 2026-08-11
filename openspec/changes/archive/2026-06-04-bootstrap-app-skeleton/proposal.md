# Proposal: Bootstrap Expo App Skeleton

## Intent

Establish the **foundation** for the Cuentas Claras mobile app: Expo managed environment, TypeScript, screaming architecture, and all infrastructure (navigation, state, API, persistence, theme). This unblocks parallel feature work—no real business logic yet, only placeholders for the 10 mockup screens.

---

## Scope

### In Scope
- **Expo Scaffold**: TypeScript template via `expo init`
- **Architecture**: `src/app`, `src/features/{auth,groups,expenses,profile}`, `src/shared/{ui,api,store,hooks,utils,theme}`
- **Navigation**: React Navigation native-stack + bottom-tabs shell with 10 placeholder screens
- **Design System**: Theme tokens (primary #0E7A3A, debt #DC2626, accent #F97316) + base UI primitives
- **Data Infra**: TanStack Query provider, Zustand store skeleton, Axios client with token+refresh interceptors, secure-store token helpers
- **Testing Foundation**: Jest + jest-expo configuration (strict_tdd: false, ready for re-evaluation post-scaffold)
- **Stack Lock**: NativeWind, react-hook-form, zod, lucide-react-native, expo-font (Inter), expo-secure-store

### Out of Scope
- Real API integration or backend calls
- Actual auth logic (login/register endpoints stubbed)
- Business logic (expense calculations, settlement logic)
- Pixel-perfect mockup fidelity
- Strict TDD enforcement (enabled after Jest validation)
- Design system reconciliation with "Luminous Finance" schema (post-bootstrap task)

---

## Capabilities

### New Capabilities
- `app-bootstrap`: Expo setup, TypeScript, providers, root layout, error boundary
- `navigation-shell`: React Navigation native-stack + bottom-tabs, auth/main stacks, 10 placeholder routes
- `design-tokens`: Color theme, typography constants, spacing/radius scales
- `api-client`: Axios instance, JWT + refresh token interceptors, secure storage helpers
- `state-management`: Zustand store skeleton for auth, settings; TanStack Query hooks
- `form-foundation`: react-hook-form + zod validation wired to shared inputs

### Modified Capabilities
- None (this is a bootstrap; no existing specs to modify)

---

## Approach

1. **Init Expo**: `expo init --template` with TypeScript
2. **Install Stack**: NativeWind, React Navigation, TanStack Query, Zustand, Axios, react-hook-form, zod, lucide-react-native, expo-font, expo-secure-store
3. **Build Architecture**: Create directory structure, root providers (theme, query client, auth store)
4. **Wire Navigation**: Auth stack → Main tabs (Home, Groups, Add Expense, Profile) with placeholder screens
5. **Scaffold Shared**: UI component stubs, API client with interceptor skeleton, Zustand store shapes, theme constants
6. **Configure Testing**: Jest + jest-expo, mock setup for secure-store and navigation, test directory layout
7. **Commit**: Scaffold baseline, commit with all dependencies locked in package.json

---

## Affected Areas

| Area | Impact | Notes |
|------|--------|-------|
| `cuentas-claras-app/` (root) | New | Expo project structure, `src/`, `openspec/` |
| `src/app/` | New | Providers (TanStack Query, Zustand, theme), RootLayout, error boundary |
| `src/features/` | New | Four domain folders (auth, groups, expenses, profile) with placeholder screens |
| `src/shared/` | New | UI, API, store, hooks, utils, theme modules |
| `package.json` | New | Stack dependencies locked, scripts for test/build/start |
| `openspec/` | Updated | Baseline structure, ready for spec→design→tasks phases |

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Expo tooling incompatibility on Darwin | Low | Use latest EAS CLI; test init on local machine |
| NativeWind className conflicts with RN styles | Med | Use className utility layer; document patterns in spec phase |
| Token refresh interceptor race conditions | Med | Mutex lock in Axios setup; test with `@react-native-async-storage/async-storage` mock |
| Secure-store unavailable in Simulator | Low | Fall back to AsyncStorage in dev; document in jest setup |
| Design token mismatch (user values vs. Luminous schema) | Low | Explicit issue logged; reconciliation scheduled post-bootstrap |

---

## Rollback Plan

1. **If Expo init fails**: Delete `cuentas-claras-app/` folder, restart with `npx create-expo-app --template`
2. **If dependency conflicts**: Revert `package.json.lock`, downgrade conflicting version, retry install
3. **If navigation crashes**: Revert RootLayout to bare native-stack, remove tabs temporarily
4. **If tests hang**: Clear Jest cache (`npm run jest -- --clearCache`), check mocks in setup.ts

---

## Dependencies

- **Backend**: `cuentas-claras-api` (NestJS) at sibling `../cuentas-claras-api` — bootstrap uses mock endpoints
- **Design Mockups**: `/Users/gastondelacruz/Documents/ProyectosProd/cuentas-claras/pantallas/` (reference for placeholder screen names)
- **Node.js**: 18+ (Expo requirement)
- **EAS CLI**: Installed globally or via `npm install -g eas-cli`

---

## Success Criteria

- [ ] `expo init` completes without errors; TypeScript template confirmed
- [ ] All stack dependencies installed and resolved (no peer warnings)
- [ ] RootLayout renders without crashes; providers inject (TanStack Query, Zustand, theme)
- [ ] Navigation shell loads with 10 placeholder screens (auth + main tabs)
- [ ] Axios client initializes with token + refresh interceptor stubs
- [ ] Zustand store (useAuthStore) wired and testable via hooks
- [ ] Jest runs successfully; @testing-library/react-native renders Button component
- [ ] Secure-store mock in jest setup.ts; no build warnings
- [ ] Theme constants (colors, spacing, typography) exported and used in layout
- [ ] Package.json locked; no unresolved dependencies

---

## Next Phase

**Spec (sdd-spec)**: Define requirements for auth capability (login screen, token refresh, logout, registration). Feature-specific type contracts, mock API responses, validation rules.

