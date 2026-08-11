# Tasks: Connect Missing API Endpoints

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~760 (additions + deletions incl. tests) |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | single PR (size:exception approved) |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full change — all 7 phases | PR 1 → main | size:exception approved by maintainer |

## Phase 1: Auth Client + Logout

- [x] 1.1 **Test**: `client.test.ts` — refresh-fail triggers `clearSession` + emits `auth:logout` event
- [x] 1.2 **Impl**: `src/shared/api/client.ts` — set `baseURL` to `${EXPO_PUBLIC_API_URL}/api/v1`; on 401 refresh failure call `clearSession()` and dispatch `auth:logout` CustomEvent
- [x] 1.3 **Test**: `useLogout.test.ts` — calls `POST /auth/logout`, clears tokens, resets queryClient
- [x] 1.4 **Impl**: `src/features/auth/hooks/useLogout.ts` — create mutation hook calling `authApi.logoutUser()`, `clearSession()`, `queryClient.clear()`
- [x] 1.5 **Test**: `navigation.test.tsx` — `auth:logout` event resets navigation to AuthStack
- [x] 1.6 **Impl**: `src/app/navigation/RootNavigator.tsx` — subscribe to `auth:logout` event, reset to AuthStack on fire
- [x] 1.7 **Impl**: `src/features/auth/api/authApi.ts` — add `logoutUser()` function (`POST /auth/logout`)

## Phase 2: Query Key Factory + Zod Helpers

- [x] 2.1 **Test**: `queryKeys.test.ts` — factory produces correct nested keys for groups, expenses, auth
- [x] 2.2 **Impl**: `src/shared/api/queryKeys.ts` — create key factory: `groups.all`, `groups.detail(id)`, `groups.balances(id)`, `groups.settlements(id)`, `expenses.list(groupId)`, `expenses.detail(id)`, `auth.me`
- [x] 2.3 **Test**: `errors.test.ts` — `parseOrThrow` throws `ApiContractError` on schema mismatch, returns parsed data on success
- [x] 2.4 **Impl**: `src/shared/api/errors.ts` — create `ApiContractError` class and `parseOrThrow(schema, data)` helper

## Phase 3: Group Detail / Edit / Delete

- [x] 3.1 **Test**: `groupSchema.test.ts` — validates group detail, balances DTOs
- [x] 3.2 **Impl**: `src/features/groups/schemas/groupSchema.ts` — create Zod schemas: `groupDetailSchema`, `groupBalancesSchema`
- [x] 3.3 **Test**: `groupsApi.test.ts` — `getGroup`, `updateGroup`, `deleteGroup`, `getGroupBalances` return parsed data
- [x] 3.4 **Impl**: `src/features/groups/api/groupsApi.ts` — add `getGroup(id)`, `updateGroup(id, data)`, `deleteGroup(id)`, `getGroupBalances(id)` using `parseOrThrow`
- [x] 3.5 **Test**: `useGroupDetail.test.ts` — returns query result with group + balances; loading/error states
- [x] 3.6 **Impl**: `src/features/groups/hooks/useGroupDetail.ts` — replace mock with `useQuery` using `queryKeys.groups.detail(id)`
- [x] 3.7 **Test**: `useGroupDetailActions.test.ts` — update invalidates detail+list; delete invalidates list
- [x] 3.8 **Impl**: `src/features/groups/hooks/useGroupDetailActions.ts` — add `useUpdateGroup`/`useDeleteGroup` mutations with invalidation
- [x] 3.9 **Impl**: `src/features/groups/hooks/useNewGroupForm.ts` — edit path calls `useUpdateGroup` instead of local store

## Phase 4: Expenses CRUD

- [x] 4.1 **Test**: `expenseSchema.test.ts` — validates expense list, detail, create/update DTOs
- [x] 4.2 **Impl**: `src/features/expenses/schemas/expenseSchema.ts` — create Zod schemas: `expenseListSchema`, `expenseDetailSchema`, `createExpenseSchema`
- [x] 4.3 **Test**: `expensesApi.test.ts` — list/create/get/update/delete return parsed data
- [x] 4.4 **Impl**: `src/features/expenses/api/expensesApi.ts` — create with `listExpenses`, `createExpense`, `getExpense`, `updateExpense`, `deleteExpense`
- [x] 4.5 **Test**: `useGroupExpenses.test.ts` — infinite query with cursor pagination
- [x] 4.6 **Impl**: `src/features/expenses/hooks/useGroupExpenses.ts` — create `useInfiniteQuery` hook with cursor
- [x] 4.7 **Impl**: `src/features/expenses/hooks/useAddExpenseForm.ts` — call `useCreateExpense` mutation; invalidate expenses + balances + auth.me
- [x] 4.8 **Impl**: `src/features/expenses/hooks/useExpenseToEdit.ts` — replace mock with `useQuery(expenses.detail(id))`

## Phase 5: Balances + Settlements

- [x] 5.1 **Test**: `groupsApi.test.ts` (extend) — `getGroupSettlements`, `postGroupSettlement` return parsed data
- [x] 5.2 **Impl**: `src/features/groups/api/groupsApi.ts` — add `getGroupSettlements(id)`, `postGroupSettlement(id, data)`
- [x] 5.3 **Test**: `useSettleDebts.test.ts` — fetches balances + settlements; recordSettlement invalidates both
- [x] 5.4 **Impl**: `src/features/expenses/hooks/useSettleDebts.ts` — replace mock with `useQuery` for balances/settlements + `useRecordSettlement` mutation

## Phase 6: Home + Profile Summary

- [x] 6.1 **Test**: `authApi.test.ts` — `getMeSummary` returns parsed summary DTO
- [x] 6.2 **Impl**: `src/features/auth/api/authApi.ts` — add `getMeSummary()` function (`GET /me/summary`)
- [x] 6.3 **Impl**: `src/features/home/hooks/useHomeData.ts` — replace mock with `useQuery(auth.me)` for summary data
- [x] 6.4 **Impl**: `src/features/profile/hooks/useProfileData.ts` — replace mock/fallback with `useQuery(auth.me)`

## Phase 7: Mock Removal + Cleanup

- [x] 7.1 **Rename**: `src/features/*/mocks/` → `src/features/*/__fixtures__/` (test-only access)
- [x] 7.2 **Impl**: `.eslintrc.js` — add `no-restricted-imports` rule blocking `*/mocks/*` from non-test files
- [x] 7.3 **Delete**: `src/features/expenses/store/expensesStore.ts` + update `expensesStore.test.ts` removal
- [x] 7.4 **Verify**: `npm test -- --runInBand` + `npm run typecheck` + `npx expo-doctor` all pass

<!-- archive-time-reconciliation: Phases 4–7 checkboxes were stale (not updated by sdd-apply in the persisted file). Reconciliation approved by orchestrator; proof from Engram #622 (apply-progress) and verify-report (235 tests / 0 failures / PASS). -->
