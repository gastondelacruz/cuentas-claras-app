# Proposal: Connect Missing API Endpoints

## Intent

Establish the backend as the single runtime source of truth by wiring all missing API endpoints. Replace local/mock data in groups, expenses, balances, settlements, home, and profile flows with API-backed React Query hooks and mutations. Mocks remain test-only.

## Proposal Question Round

Product assumptions are confirmed: backend is the runtime source of truth; mocks/fixtures are test-only; expenses require full CRUD; balances/settlements require display plus recording payments; errors are explicit and retryable where applicable; auth failures refresh once, then logout.

## Scope

### In Scope
- Wire missing group detail, edit, delete, balances, settlements, expenses, home/profile summary endpoints.
- Move runtime server state to React Query hooks and API modules.
- Add boundary validation/mapping and explicit loading/error/retry states.

### Out of Scope
- Backend endpoint implementation.
- Offline-first mutation queues or long-term local persistence.
- UI redesign beyond states needed for API behavior.

## Capabilities

### New Capabilities
- `group-runtime-api`: API-backed group detail, update, delete, balances entrypoints.
- `expense-runtime-api`: API-backed expense list, create, edit, fetch, and delete.
- `settlement-runtime-api`: API-backed balance/settlement display and settlement payment recording.
- `user-summary-runtime-api`: API-backed home/profile summaries and recent activity.

### Modified Capabilities
- `api-client`: align auth refresh/logout endpoint behavior and unrecoverable auth failure handling.
- `state-management`: require React Query for server state; Zustand remains UI/client state only.

## Approach

Use incremental endpoint wiring by domain: auth/session guardrails, groups, expenses, settlements/balances, then home/profile summaries. Preserve existing screens; replace local/store/mock sources behind feature hooks and invalidate related query keys after mutations.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/api/client.ts` | Modified | Refresh path and auth failure behavior. |
| `src/features/groups/api/groupsApi.ts` | Modified | Add missing group/balance/settlement calls. |
| `src/features/groups/hooks/useGroupDetail.ts` | Modified | Replace mock/store composition with API queries. |
| `src/features/groups/hooks/useGroupDetailActions.ts` | Modified | API-backed edit/delete actions. |
| `src/features/expenses/hooks/useAddExpenseForm.ts` | Modified | API-backed create/update/delete flow. |
| `src/features/expenses/hooks/useSettleDebts.ts` | Modified | API-backed balances/settlements. |
| `src/features/home/hooks/useHomeData.ts` | Modified | API-backed dashboard summary/activity. |
| `src/features/profile/hooks/useProfileData.ts` | Modified | API-backed user summary. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend/client DTO drift | Med | Validate/map at API boundaries and test each contract. |
| Review size exceeds 600 lines | Med | Keep phases narrow; defer polish. |
| Mock removal breaks tests | Med | Move mocks to test fixtures only. |

## Rollback Plan

Revert this change set and restore previous hook/store behavior. Because backend remains source of truth, avoid partial fallback-to-mock rollback in production.

## Dependencies

- Backend `/api/v1` auth, groups, expenses, balances, settlements, and me summary routes.

## Success Criteria

- [ ] No runtime screen depends on seeded mock/local data for server-owned entities.
- [ ] Expense CRUD and settlement payment recording use API mutations.
- [ ] Errors are explicit with retry where applicable and auth refresh/logout behavior works.
