## Exploration: connect missing API endpoints

### Current State
The app is partially wired to the backend already:
- Auth login/register call `/v1/auth/login` and `/v1/auth/register`.
- Group list and create are wired through React Query to `/v1/groups`.
- Token refresh is handled in the shared Axios client via `/auth/refresh`.

The main gaps are the screens/hooks that still derive behavior from Zustand + seeded mocks:
- group detail (still merges local store + mock data)
- group edit/delete (local only)
- add/edit/delete expenses (local only)
- settle debts/balances (derived locally, not API-backed)
- profile/home summary (mostly local/mixed)

### Affected Areas
- `src/features/auth/api/authApi.ts` — already wired auth endpoints.
- `src/shared/api/client.ts` — refresh flow; note it calls `/auth/refresh` while backend exposes `/api/v1/auth/refresh`.
- `src/features/groups/api/groupsApi.ts` — wired group list/create only; missing detail/update/archive/balances/settlements.
- `src/features/groups/hooks/useGroupDetail.ts` — still composes mock/store data instead of fetching group detail.
- `src/features/groups/hooks/useGroupDetailActions.ts` — delete/edit actions still local.
- `src/features/groups/hooks/useNewGroupForm.ts` — create is API-backed; edit path is local.
- `src/features/expenses/hooks/useAddExpenseForm.ts` — create/update/delete expense paths are local.
- `src/features/expenses/hooks/useSettleDebts.ts` — derives balances locally instead of API balances/settlements.
- `src/features/home/hooks/useHomeData.ts` — home summary/activity still depends on local expense store.
- `src/features/profile/hooks/useProfileData.ts` — profile summary still local.

### Endpoint Gap Matrix
| Backend endpoint | Status | Frontend owner | Notes |
|---|---|---|---|
| `POST /api/v1/auth/register` | Connected | auth | Client currently uses `/v1/auth/register` and refresh path omits `/api` prefix. |
| `POST /api/v1/auth/login` | Connected | auth | Same prefix mismatch risk as above. |
| `POST /api/v1/auth/refresh` | Partially connected | shared/api/client.ts | Client hits `/auth/refresh`, relying on baseURL `/api`; verify against runtime baseURL. |
| `POST /api/v1/auth/logout` | Missing | auth/session | No logout API hook yet. |
| `GET /api/v1/groups` | Connected | groups list/home | List fetch exists; UI still enriches with local balance data. |
| `POST /api/v1/groups` | Connected | new group | Create group mutation exists. |
| `GET /api/v1/groups/:groupId` | Missing | group detail | Currently mocked/local. |
| `PATCH /api/v1/groups/:groupId` | Missing | group edit | Edit screen updates Zustand only. |
| `DELETE /api/v1/groups/:groupId` | Missing | group actions | Delete is local tombstone only. |
| `GET /api/v1/groups/:groupId/balances` | Missing | settle debts/detail | Local netting logic only. |
| `GET /api/v1/groups/:groupId/settlements` | Missing | settle debts/detail | Not used yet. |
| `POST /api/v1/groups/:groupId/settlements` | Missing | settle debts/detail | Not used yet. |
| `GET /api/v1/groups/:groupId/expenses` | Missing | group detail/expenses | Local store still provides expenses. |
| `POST /api/v1/groups/:groupId/expenses` | Missing | add expense | Local only. |
| `GET /api/v1/expenses/:expenseId` | Missing | edit expense | No API-backed edit fetch. |
| `PATCH /api/v1/expenses/:expenseId` | Missing | edit expense | Local only. |
| `DELETE /api/v1/expenses/:expenseId` | Missing | delete expense | Local only. |
| `GET /api/v1/me/summary` | Missing | profile | Profile screen still uses derived local data. |

### Approaches
1. **Incremental endpoint wiring by domain** — replace local/mock behavior one feature at a time while keeping current UI contracts stable.
   - Pros: low risk, easy TDD slices, can ship in one PR if scoped tightly.
   - Cons: some temporary duplication while mocks and API coexist.
   - Effort: Medium

2. **Big-bang data-model rewrite** — replace all local stores/mocks with API-backed queries/mutations in one pass.
   - Pros: clean end state sooner.
   - Cons: high regression risk, harder to test, likely exceeds review budget.
   - Effort: High

### Recommendation
Use incremental wiring, ordered by user-facing risk: auth/session refresh, groups detail/edit/delete, expenses CRUD, then balances/profile/home. Keep Zustand only for UI state; move server state into React Query hooks per feature.

### Risks
- Backend/frontend contract drift (notably request/response shapes and the `/api` prefix vs `/v1` client paths).
- Hidden dependence on seeded mocks in tests and screens; removing them too early can break navigation flows.
- Expense/group endpoints may require pagination and richer DTO mapping than the current local types.

### Ready for Proposal
Yes — the exploration is sufficient to draft a phased proposal with TDD slices and endpoint-by-endpoint scope.
