# settlement-runtime-api Specification

## Purpose
API-backed balance and settlement display plus settlement payment recording; replace local netting logic with backend calculations.

## Requirements

### Requirement: Fetch balances
The system MUST fetch group balances via `GET /api/v1/groups/:groupId/balances`.

#### Scenario: Balances load
- GIVEN a valid group id
- WHEN the settle debts screen mounts
- THEN the hook returns per-member balances

### Requirement: Fetch settlement plan
The system MUST fetch the suggested settlement plan via `GET /api/v1/groups/:groupId/settlements`.

#### Scenario: Settlement plan loads
- GIVEN a valid group id
- WHEN the settle debts screen mounts
- THEN the hook returns `{ settlements: [{ fromMemberId, fromMemberName, toMemberId, toMemberName, amount, currency }] }`

### Requirement: Record payment
The system MUST record a settlement payment via `POST /api/v1/groups/:groupId/settlements` and refetch balances/settlements.

#### Scenario: Payment succeeds
- GIVEN a settlement with from/to members, amount, currency, and paidAt
- WHEN the user confirms the payment
- THEN the API returns `{ payment, balances[] }` and the balances/settlement queries refetch

#### Scenario: Invalid payment amount
- GIVEN an amount greater than the owed balance
- WHEN the user submits
- THEN the API returns 422 and the UI displays the field error

## API Contract

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/api/v1/groups/:groupId/balances` | — | `{ balances: [...] }` |
| GET | `/api/v1/groups/:groupId/settlements` | — | `{ settlements: [...] }` |
| POST | `/api/v1/groups/:groupId/settlements` | `{ fromMemberId, toMemberId, amount, currency, paidAt, notes? }` | `{ payment, balances[] }` |

## Error Handling
- Network errors: retry twice, then explicit error with manual retry.
- 401: refresh once; if refresh fails, clear session and redirect to login.
- 422: display inline field error and prevent stale balance updates.

## Loading States
- Balances and settlement plan show skeleton while loading.
- Record payment button disables and shows pending state during mutation.

## Query Keys
- `['groups', groupId, 'balances']` — balances
- `['groups', groupId, 'settlements']` — settlement plan
