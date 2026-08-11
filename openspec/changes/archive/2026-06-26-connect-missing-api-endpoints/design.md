# Design: Connect Missing API Endpoints

## Technical Approach

Wire every server-owned screen to the backend by replacing Zustand/mocks with React Query hooks behind the existing feature hooks. Each feature keeps its current public hook signature; only the data source changes. The shared axios client gains a normalized URL prefix (`/api/v1`) plus a logout mutation and a clear-session redirect on refresh failure. Zod schemas validate every response at the API boundary so DTO drift fails at the seam, not in the UI. Mocks move to test fixtures only; runtime code is forbidden from importing any `*.mock.ts` outside tests.

## Architecture Decisions

### Decision: Server state in React Query, never Zustand

| Option | Tradeoff | Decision |
|---|---|---|
| Keep Zustand, sync from RQ | Two sources of truth, drift risk | Reject |
| React Query as source; Zustand only for UI flags | Single source; matches repo convention (`react-query` skill) | **Choose** |
| Fetch + custom cache | Reinvent RQ, lose devtools | Reject |

### Decision: API modules colocated with features, one file per domain

| Option | Tradeoff | Decision |
|---|---|---|
| One `shared/api/endpoints.ts` | Easy to scan; violates screaming architecture | Reject |
| `features/<domain>/api/<domain>Api.ts` | Colocated with hooks/screens; matches `project-architecture` skill | **Choose** |

API files export raw typed functions (`createGroup`, `getGroup`, etc.) plus DTO types. Hooks consume them; no business logic in API files.

### Decision: Zod schemas at the API boundary, `.parse()` (not `safeParse`)

| Option | Tradeoff | Decision |
|---|---|---|
| TypeScript types only | Silent drift on shape changes | Reject |
| `safeParse` + manual throw | Reimplements what `.parse` already does | Reject |
| Zod `.parse()` wrapped in a `parseOrThrow(Schema, data)` helper | Throws a typed `ApiContractError`; tests assert shape; one helper to mock | **Choose** |

Following `zod` skill (`parse-never-trust-json`, `parse-use-safeparse` for user input — server responses use `.parse` because contract violation is a bug, not user error). Inferred types via `z.infer<typeof X>` per `type-use-z-infer`.

### Decision: Query key factory in `src/shared/api/queryKeys.ts`

| Option | Tradeoff | Decision |
|---|---|---|
| Inline `['groups', id]` strings | Risk of typo, no central list for invalidation | Reject |
| Centralized `queryKeys.groups.detail(id)` factory | One place to grep; type-safe helpers; matches `react-query` skill convention | **Choose** |

### Decision: Auth refresh keeps single-flight, adds redirect-to-login on hard failure

| Option | Tradeoff | Decision |
|---|---|---|
| Throw on refresh failure | Caller must handle; easy to forget | Reject |
| `useAuthStore.getState().clearSession()` + emit a `'auth:logout'` event that `RootNavigator` listens to | Decouples client from navigation; single source of truth for "unauthenticated" | **Choose** |

`useAuthStore` is the only authority on session; `RootNavigator` already keys auth stack on `isAuthenticated`.

### Decision: URL prefix moves to baseURL, not per-call

| Option | Tradeoff | Decision |
|---|---|---|
| Keep `/v1/...` per call, change baseURL to `/api` | Works for resource paths; refresh path becomes `/api/v1/auth/refresh` (correct) | **Choose** |
| Add `/api` to every call | Repetition; easy to miss | Reject |

`process.env.EXPO_PUBLIC_API_URL` becomes the origin only (no trailing `/api`). `client.baseURL = origin + '/api/v1'`. The refresh call moves to `/auth/refresh` and works because `baseURL` already includes the prefix.

### Decision: Mock removal — move to `__fixtures__/`, gate with a lint rule

| Option | Tradeoff | Decision |
|---|---|---|
| Delete `mocks/*.ts` | Breaks many tests | Reject |
| Rename `mocks/` → `__fixtures__/`; add an ESLint `no-restricted-imports` rule that blocks `**/mocks/**` outside `__tests__/` and `**/__fixtures__/**` | Keeps tests working, forbids runtime reintroduction; aligns with AGENTS.md "TDD" | **Choose** |

Existing `__tests__/*` files continue to import fixtures via the renamed folder. Screens/hooks stop importing from `mocks/`.

## Data Flow

```
Screen (pure JSX)
   └── useXxx hook (behavior)
         ├── useQuery / useMutation  ──▶  queryKeys factory
         │         └── features/<domain>/api/<domain>Api.ts
         │                 └── shared/api/client.ts  (axios + interceptors)
         │                       └── backend /api/v1/...
         └── zod parse() at API boundary → DTO → UI type
```

Auth failure path: `401` from any non-refresh call → `runRefresh()` (single-flight) → on success: retry original request; on failure: `clearSession()` + emit `auth:logout` → `RootNavigator` switches to `AuthStack`.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/shared/api/client.ts` | Modify | baseURL = `${origin}/api/v1`; clear session + emit logout on refresh fail; export `setupAuthFailureListener` |
| `src/shared/store/authStore.ts` | Modify | Add `onAuthFailure(handler)` subscription helpers |
| `src/app/navigation/RootNavigator.tsx` | Modify | Subscribe to auth failure → `navigation.reset(AuthStack)` |
| `src/shared/api/queryKeys.ts` | Create | Factory: `groups.list`, `groups.detail(id)`, `groups.balances(id)`, `groups.settlements(id)`, `expenses.list({groupId})`, `expenses.detail(id)`, `auth.me` |
| `src/shared/api/errors.ts` | Create | `ApiContractError`, `parseOrThrow(schema, data)` |
| `src/features/groups/api/groupsApi.ts` | Modify | Add `getGroup(id)`, `updateGroup(id, dto)`, `deleteGroup(id)`, `getGroupBalances(id)`, `getGroupSettlements(id)`, `postGroupSettlement(id, dto)` |
| `src/features/groups/hooks/useGroupDetail.ts` | Modify | Replace mock/store merge with `useQuery(['groups', id, 'detail'])` + `useGroupBalances(id)` |
| `src/features/groups/hooks/useGroupDetailActions.ts` | Modify | `useUpdateGroup`, `useDeleteGroup` mutations + invalidation |
| `src/features/groups/hooks/useGroupsList.ts` | Modify | Read balance from `useGroupBalances` per item, or accept summary data via list endpoint |
| `src/features/groups/hooks/useNewGroupForm.ts` | Modify | Edit path: `useUpdateGroup` mutation; remove `groupsListMock` import |
| `src/features/groups/schemas/groupSchema.ts` | Create | Zod: `groupDtoSchema`, `groupListItemDtoSchema`, `balanceDtoSchema`, `settlementDtoSchema`, `createGroupDtoSchema`, `updateGroupDtoSchema` |
| `src/features/groups/store/groupsStore.ts` | Modify | Drop `groupsListMock` seed; keep only `deletedGroupIds` tombstone (still needed for the "soft delete" UX after optimistic 204) |
| `src/features/groups/hooks/useGroupMembers.ts` | Modify | Derive from `groupDetail.members[]` instead of mocked preview |
| `src/features/expenses/api/expensesApi.ts` | Create | `listExpenses({groupId, limit, cursor})`, `getExpense(id)`, `createExpense({groupId, body})`, `updateExpense(id, dto)`, `deleteExpense(id)` |
| `src/features/expenses/hooks/useGroupExpenses.ts` | Create | `useGroupExpenses(groupId)` — paginated `useInfiniteQuery` |
| `src/features/expenses/hooks/useExpenseToEdit.ts` | Modify | Use `useExpense(id)` query instead of mock/store lookup |
| `src/features/expenses/hooks/useAddExpenseForm.ts` | Modify | `onSubmit` calls `useCreateExpense` / `useUpdateExpense`; `onDelete` calls `useDeleteExpense`; invalidates `['expenses', {groupId}]`, `['groups', groupId, 'balances']`, `['auth', 'me']` |
| `src/features/expenses/schemas/expenseSchema.ts` | Create | Zod: `expenseDtoSchema`, `createExpenseDtoSchema`, `updateExpenseDtoSchema` |
| `src/features/expenses/hooks/useSettleDebts.ts` | Modify | Replace local netting with `useGroupBalances` + `useGroupSettlements`; add `useRecordSettlement` |
| `src/features/expenses/store/expensesStore.ts` | Delete | Zustand store no longer needed (server is source) |
| `src/features/expenses/mocks/`, `src/features/groups/mocks/`, `src/features/home/mocks/` | Rename → `__fixtures__/` | Test-only access |
| `src/features/home/hooks/useHomeData.ts` | Modify | Source summary + recent activity from `useAuthMeSummary` |
| `src/features/home/api/homeApi.ts` | Create | `getMeSummary()` |
| `src/features/profile/hooks/useProfileData.ts` | Modify | Source from `useAuthMeSummary`; drop `profileFallback` |
| `src/features/auth/api/authApi.ts` | Modify | Add `logoutUser()` → `POST /auth/logout`; add `getMeSummary()` (or move to home) |
| `src/features/auth/hooks/useLogout.ts` | Create | Clear local cache, call `logoutUser`, navigate to auth |

## Interfaces / Contracts

```ts
// queryKeys factory (src/shared/api/queryKeys.ts)
export const queryKeys = {
  groups: {
    all: ['groups'] as const,
    list: () => [...queryKeys.groups.all] as const,
    detail: (id: string) => [...queryKeys.groups.all, id] as const,
    balances: (id: string) => [...queryKeys.groups.detail(id), 'balances'] as const,
    settlements: (id: string) => [...queryKeys.groups.detail(id), 'settlements'] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    list: (groupId: string) => [...queryKeys.expenses.all, { groupId }] as const,
    detail: (id: string) => [...queryKeys.expenses.all, id] as const,
  },
  auth: { me: () => ['auth', 'me'] as const },
} as const;
```

```ts
// API DTO schema (src/features/groups/schemas/groupSchema.ts)
export const groupDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  currency: z.string(),
  type: z.enum(GROUP_TYPES),
  members: z.array(groupMemberDtoSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable().optional(),
});
export type GroupDto = z.infer<typeof groupDtoSchema>;
```

## Mutation Invalidation Matrix

| Mutation | Invalidates |
|---|---|
| `useUpdateGroup` | `['groups']`, `['groups', id, 'detail']` |
| `useDeleteGroup` | `['groups']` |
| `useCreateExpense` | `['expenses', {groupId}]`, `['groups', groupId, 'balances']`, `['auth', 'me']` |
| `useUpdateExpense` | same as create |
| `useDeleteExpense` | same as create |
| `useRecordSettlement` | `['groups', groupId, 'balances']`, `['groups', groupId, 'settlements']`, `['auth', 'me']` |
| `useLogout` | `queryClient.clear()` |

## Error Handling

| Class | Behavior |
|---|---|
| 401 (any call) | Single-flight refresh; on success retry; on fail → `clearSession` + emit logout |
| 404 | `ApiContractError`; caller renders inline empty/not-found; no retry |
| 422 | Map to field errors via `flatten()`; no retry |
| 5xx / network | Default RQ retry 2 (already set in `queryClient.ts`); UI shows retry button |
| Contract violation (Zod fail) | `ApiContractError` with offending path; logged; surfaces as a 5xx-class error to the UI (no retry) |

Stale data preservation: do NOT auto-clear caches on error. Mutations use `onMutate` + `onError` rollback only for `useDeleteGroup`/`useDeleteExpense` where optimistic UI exists; otherwise `invalidateQueries` in `onSettled`.

## Testing Strategy

| Layer | Scope | Approach |
|---|---|---|
| Unit | Zod schemas (`parseOrThrow` happy + invariant cases) | `__tests__/groupSchema.test.ts`, `expenseSchema.test.ts` |
| Unit | API functions (mock axios client) | `__tests__/groupsApi.test.ts`, `expensesApi.test.ts` |
| Unit | Query hooks (mock API functions) | `__tests__/useGroupDetail.test.ts`, `useGroupExpenses.test.ts`, `useAddExpenseForm.test.ts` (mock `useCreateExpense`) |
| Integration | Mutation invalidation (QueryClient provider + msw or mocked client) | `__tests__/useCreateExpense.invalidation.test.tsx` |
| Component | Screens render loading/error/empty/data from mocked hooks | Existing `GroupDetailScreen.test.tsx` etc. — fixture data sourced from `__fixtures__/` instead of inline mocks |

## Phased Implementation Order (TDD slices, 600-line budget cap)

| Phase | Scope | Files (approx lines) | Depends on |
|---|---|---|---|
| 1. Auth client + logout | `client.ts` baseURL fix, `useLogout`, `RootNavigator` listener, refresh-fail redirect | ~120 | — |
| 2. Query key factory + Zod helpers | `queryKeys.ts`, `errors.ts` | ~80 | 1 |
| 3. Group detail/edit/delete | `groupsApi` additions, `useGroupDetail`, `useGroupDetailActions`, `useNewGroupForm` edit path | ~180 | 2 |
| 4. Expenses CRUD | `expensesApi`, schemas, `useGroupExpenses`, `useExpenseToEdit`, `useAddExpenseForm`, `useExpenseToEdit` | ~200 | 3 |
| 5. Balances + settlements | `useSettleDebts`, `useRecordSettlement`, `SettleDebtsScreen` adjustment | ~120 | 4 |
| 6. Home + profile summary | `useHomeData`, `useProfileData`, `homeApi`/`authApi` summary | ~100 | 5 |
| 7. Mock removal | rename `mocks/` → `__fixtures__/`, ESLint rule, delete `expensesStore.ts` | ~60 | 6 |

Each phase ≤ ~200 lines added + proportional test updates. Verifier must run after each phase; reviewer may chain PRs per phase. Forecast: 400-line budget risk **Low** for any single phase; cumulative single-PR **High** (≈760 lines incl. tests) → **Chained PRs recommended: Yes** (split at phase boundary).

## Open Questions

- [ ] Does `GET /api/v1/groups/:groupId` return members + expenses + balances inline, or do we need to fan out 3 calls? Spec currently implies fan-out — confirm before phase 3.
- [ ] Should `useGroupExpenses` use `useInfiniteQuery` (cursor pagination) or page-based? Spec says `limit`+`cursor` → infinite.
- [ ] ESLint custom rule: prefer `eslint-plugin-no-restricted-imports` config, or codegen the rule? Default to plugin config.
