# expense-runtime-api Specification

## Purpose
API-backed expense list, create, read, edit, and delete; replace local store operations with React Query mutations.

## Requirements

### Requirement: List group expenses
The system MUST fetch paginated expenses via `GET /api/v1/groups/:groupId/expenses?limit&cursor`.

#### Scenario: Expenses load
- GIVEN a valid group id
- WHEN the expense list mounts
- THEN the hook returns `{ expenses[], nextCursor }`

#### Scenario: Pagination
- GIVEN a list with more pages
- WHEN the user scrolls to the bottom
- THEN the hook appends the next page using `nextCursor`

### Requirement: Create expense
The system MUST create an expense via `POST /api/v1/groups/:groupId/expenses` and invalidate the group expenses list.

#### Scenario: Create succeeds
- GIVEN valid expense input
- WHEN the user submits the form
- THEN the API returns the expense with participant breakdown and the list refetches

### Requirement: Fetch expense detail
The system MUST fetch a single expense via `GET /api/v1/expenses/:expenseId` for editing.

#### Scenario: Edit screen loads
- GIVEN a valid expense id
- WHEN the edit screen mounts
- THEN the hook returns the expense detail

### Requirement: Update expense
The system MUST update an expense via `PATCH /api/v1/expenses/:expenseId`.

#### Scenario: Update succeeds
- GIVEN valid partial expense input
- WHEN the user submits edits
- THEN the API returns the updated expense and detail/list queries refetch

### Requirement: Delete expense
The system MUST delete an expense via `DELETE /api/v1/expenses/:expenseId`.

#### Scenario: Delete succeeds
- GIVEN a valid expense id
- WHEN the user confirms delete
- THEN the API returns `{ id, deletedAt }` and the list query refetches

## API Contract

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/api/v1/groups/:groupId/expenses?limit&cursor` | — | `{ expenses[], nextCursor }` |
| POST | `/api/v1/groups/:groupId/expenses` | `{ title, amount, currency, paidByMemberId, participantMemberIds[], splitType, category?, notes?, expenseDate }` | expense with breakdown |
| GET | `/api/v1/expenses/:expenseId` | — | expense detail |
| PATCH | `/api/v1/expenses/:expenseId` | partial expense | updated expense |
| DELETE | `/api/v1/expenses/:expenseId` | — | `{ id, deletedAt }` |

## Error Handling
- Network errors: retry twice, then explicit error with manual retry.
- 401: refresh once; if refresh fails, clear session and redirect to login.
- 422 validation: display field errors; do not retry.

## Loading States
- Expense list shows skeleton while first page loads and inline spinner for pagination.
- Create/update/delete buttons disable and show pending state while mutation is pending.

## Query Keys
- `['expenses', { groupId }]` — paginated list
- `['expenses', expenseId]` — single expense detail
- `['groups', groupId]` — invalidated on create/update/delete
- `['groups', groupId, 'balances']` — invalidated on create/update/delete
