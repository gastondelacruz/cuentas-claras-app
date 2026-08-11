# cuentas-claras-app: Project Context

**Date**: 2026-06-04  
**Status**: SDD Bootstrap / Pre-Scaffold  
**Project Key**: `cuentas-claras-app`

---

## Overview

**cuentas-claras-app** is an Expo-managed React Native application for group expense tracking and debt settlement. It runs as a sibling within the monorepo `/Users/gastondelacruz/Documents/ProyectosProd/cuentas-claras/`, alongside the NestJS backend `cuentas-claras-api`.

The app is designed to help groups (friends, roommates, trips) manage shared expenses and track who owes what, with automatic debt settlement calculations.

---

## Stack & Technology Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | Expo Managed | Fast iteration, native iOS/Android without Xcode/Android Studio setup |
| **Language** | TypeScript | Type safety, better IDE support for mobile development |
| **Styling** | NativeWind | Utility-first styling with className support (similar to Tailwind) |
| **Navigation** | React Navigation (native-stack + bottom-tabs) | Native feel, proven for RN, flexible architecture |
| **State (Global)** | Zustand | Lightweight, fast, less boilerplate than Redux |
| **Server State** | TanStack Query | Data fetching, caching, sync with backend |
| **Forms** | react-hook-form + Zod | Performant forms, compile-time schema validation |
| **HTTP Client** | Axios | JWT + token refresh interceptors, same as backend ecosystem |
| **Persistence** | expo-secure-store | Secure token/credential storage (native iOS Keychain, Android Keystore) |
| **Auth** | JWT with Refresh Token Flow | Backend-driven; refresh tokens stored securely |
| **UI Components** | lucide-react-native | Lightweight icons, consistent with design system |
| **Fonts** | expo-font (Inter) | Professional, accessible typeface |
| **Build & Deploy** | EAS CLI (Expo Application Services) | Managed CI/CD for iOS/Android builds |

---

## Architecture Pattern: Screaming Architecture

The app follows **domain-driven structure** to keep features cohesive and scalable:

```
src/
├── app/
│   ├── navigation/          # Root navigation config (native-stack, bottom-tabs)
│   ├── providers/           # Theme, auth, query client, store providers
│   └── RootLayout.tsx       # App root with error boundary
│
├── features/                # Domain modules (each self-contained)
│   ├── auth/
│   │   ├── screens/         # Login, Register, Onboarding
│   │   ├── services/        # Auth logic (login, register, logout, token refresh)
│   │   ├── hooks/           # useAuth, useIsAuthenticated
│   │   └── types.ts
│   │
│   ├── groups/
│   │   ├── screens/         # List groups, Group detail, Create group
│   │   ├── services/        # Group API calls, group queries
│   │   ├── hooks/           # useGroups, useGroupDetail, useCreateGroup
│   │   └── types.ts
│   │
│   ├── expenses/
│   │   ├── screens/         # Add expense, Expense detail, Settlement
│   │   ├── services/        # Expense mutations, queries
│   │   ├── hooks/           # useExpenses, useAddExpense, useSettle
│   │   └── types.ts
│   │
│   └── profile/
│       ├── screens/         # User profile, settings
│       ├── hooks/           # useProfile, useUpdateProfile
│       └── types.ts
│
└── shared/
    ├── ui/                  # Reusable components (Button, Input, Card, Modal, etc.)
    ├── api/                 # Axios instance, interceptors, endpoints
    ├── store/               # Zustand stores (authStore, settingsStore, etc.)
    ├── hooks/               # Cross-feature hooks (useFormReset, useDebounce, etc.)
    ├── utils/               # Helpers (date formatting, currency, validation, etc.)
    └── theme/               # Colors, typography, spacing constants
```

**Rationale**: Features own their data, API calls, and logic. Shared is truly shared (no domain knowledge). This scales cleanly as the app grows.

---

## Backend Integration

**Backend Project**: `cuentas-claras-api` (NestJS)  
**Location**: Sibling at `../cuentas-claras-api`  
**Integration**: REST API via Axios  

### Authentication Flow
1. **Login/Register**: POST to backend, receive `accessToken` + `refreshToken`
2. **Storage**: Refresh token stored in `expo-secure-store`; access token in memory (Zustand)
3. **Interceptors**: Axios interceptor adds `Authorization: Bearer {accessToken}` to all requests
4. **Refresh Logic**: On 401, call refresh endpoint, update tokens, retry original request
5. **Logout**: Clear tokens from store and secure storage

### API Base Setup
```typescript
// src/shared/api/client.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Token + refresh interceptors configured here
```

**Bootstrap Note**: At initial scaffold, API integration uses **placeholder/mock endpoints**. Live backend calls will be connected during feature implementation.

---

## Design System & Color Tokens

### Explicit Color Tokens (User Provided)
- **Primary**: `#0E7A3A` (Green, primary actions, buttons)
- **Debt**: `#DC2626` (Red, debt/unsettled amounts)
- **Accent**: `#F97316` (Orange, highlights, secondary actions)

### Mockup Design Schema
The figma/design folder (`pantallas/`) contains mockups with an alternate schema called "Luminous Finance":
- Primary: `#006d37` / `#2ECC71` (different green)
- Likely includes secondary, neutral, and semantic colors

### Decision & Reconciliation
**User-provided explicit tokens (above) take precedence for bootstrap.** The primary, debt, and accent values are hardcoded into theme tokens at startup.

**Post-Bootstrap**: Reconcile all colors (neutrals, backgrounds, text, states) with the full "Luminous Finance" scheme and update theme constants accordingly.

### Theme Location
```typescript
// src/shared/theme/colors.ts
export const colors = {
  primary: '#0E7A3A',
  debt: '#DC2626',
  accent: '#F97316',
  // Neutrals and semantic colors to be defined during spec phase
};
```

---

## Screens & Feature Scope

Based on `pantallas/` directory, the following screens are planned:

1. **Onboarding** - First-time user walkthrough
2. **Login** - Email + password authentication
3. **Registrarse** (Register) - New account creation
4. **Inicio** (Home/Dashboard) - Overview of active groups, recent expenses
5. **Listado Grupos** (Groups List) - All user's groups with balances
6. **Detalle Grupo** (Group Detail) - Members, expenses, settlement status
7. **Nuevo Grupo** (Create Group) - Form to create a new group
8. **Agregar Gasto** (Add Expense) - Record who paid and who benefited
9. **Liquidar Deudas** (Settle Debts) - Payment/transfer interface to settle
10. **Perfil** (Profile) - User settings, account management

---

## Testing Strategy

### Inferred Toolchain (Pre-Scaffold)
- **Test Runner**: Jest + jest-expo
- **Component Testing**: @testing-library/react-native
- **Assertions**: @testing-library/jest-native
- **Test Directory**: `__tests__/` at feature/component level
- **Strict TDD**: **false** (project not yet scaffolded)

### Rationale for `strict_tdd: false`
The app scaffold (initial boilerplate, Expo setup, navigation) will be generated first. Once the structure is confirmed and Jest is configured, TDD will be enabled for feature development (`strict_tdd: true`).

### Coverage Target
- **Threshold**: 80% coverage on business logic
- **Exempt**: Navigation boilerplate, styling constants, mock data

### Re-evaluation
After `expo init` and Jest config, this will be updated to `strict_tdd: true`.

---

## SDD & Development Workflow

### Artifact Storage
- **Mode**: `openspec` (file-based)
- **Location**: `cuentas-claras-app/openspec/`
- **Artifacts**: `spec.md`, `design.md`, `tasks.md`, and task-specific `.apply.md` files

### Chained PR Strategy
- **Rule**: Ask before splitting
- **Review Budget**: 400 lines per PR
- **Oversized changes**: Flagged and split into logical chained PRs

### Phases
1. **Explore** - Validate scope and feasibility
2. **Propose** - Outline intent and approach
3. **Spec** - Write requirements and acceptance scenarios
4. **Design** - Architecture decisions and API contracts
5. **Tasks** - Break into reviewable work units
6. **Apply** - Implementation
7. **Verify** - Test coverage and acceptance
8. **Archive** - Delta sync and closure

---

## Naming Conventions & Code Style

### TypeScript Files
- **Components**: `PascalCase.tsx` (e.g., `LoginScreen.tsx`, `ExpenseCard.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useAuth.ts`, `useExpenses.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatCurrency.ts`, `parseAmount.ts`)
- **Services**: `camelCase.ts` (e.g., `groupService.ts`, `authService.ts`)
- **Types**: `PascalCase.ts` or inline (e.g., `types.ts` with `export type LoginRequest = {...}`)

### Constants & Enums
```typescript
export const MAX_GROUP_SIZE = 50;
export enum ExpenseType {
  SHARED = 'SHARED',
  PERSONAL = 'PERSONAL',
}
```

### Zustand Stores
```typescript
// src/shared/store/authStore.ts
interface AuthStore {
  token: string | null;
  setToken: (token: string) => void;
}
export const useAuthStore = create<AuthStore>(...);
```

### React Hooks (TanStack Query)
```typescript
// In feature services
export function useGroupDetail(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => groupService.getDetail(groupId),
  });
}
```

---

## Git & PR Conventions

- **Commit Style**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`)
- **Branch Naming**: `feature/[ticket-id]-[kebab-case-desc]` or `fix/[ticket-id]-[desc]`
- **PR Title**: Conventional Commit format
- **PR Strategy**: Chained PRs for oversized changes (>400 lines per PR)

---

## Development Checklist (Pre-Scaffold)

- [ ] Run `expo init` with TypeScript template
- [ ] Install and configure NativeWind
- [ ] Install React Navigation dependencies
- [ ] Configure Zustand, TanStack Query, react-hook-form, Zod
- [ ] Set up Axios with JWT + refresh interceptors
- [ ] Configure expo-secure-store for token persistence
- [ ] Set up Jest + jest-expo
- [ ] Create directory structure (app, features, shared)
- [ ] Define theme/color constants
- [ ] Build Root Navigation (native-stack + bottom-tabs)
- [ ] Create placeholder/mock data service
- [ ] Build first screens (Login, Home)
- [ ] Enable strict TDD and add test coverage

---

## Known Issues & Decisions

### Design Token Conflict
**Status**: Recorded, pending reconciliation  
**Issue**: User-provided explicit tokens (primary #0E7A3A, debt #DC2626, accent #F97316) differ from the "Luminous Finance" schema in `pantallas/esquema de colores.md`.  
**Decision**: Use explicit tokens for bootstrap; reconcile full schema post-bootstrap.  
**Action**: Create GitHub issue to align design system after initial scaffold.

### Backend Mocking
**Status**: Planned  
At bootstrap, the app will use **placeholder/mock API responses** to unblock UI development. Live backend integration happens incrementally as NestJS API endpoints are ready.

---

## Related Documents & Resources

- **Backend Project**: `/Users/gastondelacruz/Documents/ProyectosProd/cuentas-claras/cuentas-claras-api/`
- **Design Mockups**: `/Users/gastondelacruz/Documents/ProyectosProd/cuentas-claras/pantallas/`
- **Design Schema**: `pantallas/esquema de colores.md`
- **SDD Config**: `openspec/config.yaml` (this directory)
- **Monorepo Root**: `/Users/gastondelacruz/Documents/ProyectosProd/cuentas-claras/`

---

## Next Steps

1. **Explore Phase**: Validate architecture patterns and backend integration approach
2. **Propose**: Outline initial feature scope (auth + home screen)
3. **Scaffold**: Run `expo init` and establish baseline
4. **Configure**: Set up all dependencies and testing framework
5. **Begin Development**: First feature (login) via SDD spec → design → tasks → apply → verify cycle
