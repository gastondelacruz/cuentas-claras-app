# group-runtime-api Specification

## Purpose
API-backed group detail, update, delete, and balance entrypoints; replace local/store composition with React Query.

## Requirements

### Requirement: Fetch group detail
The system MUST fetch a single group by id from `GET /api/v1/groups/:groupId` and expose it through a `useGroupDetail` query hook.

#### Scenario: Group detail loads
- GIVEN a valid group id
- WHEN the detail screen mounts
- THEN the hook returns group data with members, expenses, and balances

#### Scenario: Group detail fails
- GIVEN the request returns 404
- WHEN the detail screen mounts
- THEN the hook surfaces an explicit error and offers a retry action

### Requirement: Update group
The system MUST persist group edits via `PATCH /api/v1/groups/:groupId` and invalidate related queries on success.

#### Scenario: Edit succeeds
- GIVEN a group with id and editable fields
- WHEN the user submits valid changes
- THEN the API updates the group and the detail/list queries refetch

### Requirement: Delete group
The system MUST archive a group via `DELETE /api/v1/groups/:groupId` and invalidate the groups list on success.

#### Scenario: Delete succeeds
- GIVEN a group with id
- WHEN the user confirms delete
- THEN the API archives the group and the list query refetches

### Requirement: Fetch group balances
The system MUST fetch per-member balances via `GET /api/v1/groups/:groupId/balances`.

#### Scenario: Balances load
- GIVEN a valid group id
- WHEN the balances section mounts
- THEN the hook returns `{ balances: [{ memberId, displayName, balance, currency }] }`

## API Contract

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/api/v1/groups/:groupId` | — | group with members, expenses, balances |
| PATCH | `/api/v1/groups/:groupId` | `{ name?, description?, type?, currency?, members?[] }` | updated group |
| DELETE | `/api/v1/groups/:groupId` | — | archived group |
| GET | `/api/v1/groups/:groupId/balances` | — | `{ balances: [...] }` |

## Error Handling
- Network errors: retry twice, then show explicit message and manual retry.
- 401: refresh once; if refresh fails, clear session and redirect to login.
- 404/422: show field-level or inline error without retry.

## Loading States
- Detail/balances screens show skeleton while `isLoading` is true.
- Update/delete buttons disable and show pending indicator while mutation is pending.

## Query Keys
- `['groups', groupId]` — group detail
- `['groups', groupId, 'balances']` — group balances
- `['groups']` — list (invalidated on update/delete)
