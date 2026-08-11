# user-summary-runtime-api Specification

## Purpose
API-backed home dashboard and profile summary; replace local/derived user data with backend summaries.

## Requirements

### Requirement: Fetch user summary
The system MUST fetch the authenticated user's summary via `GET /api/v1/me/summary`.

#### Scenario: Home loads
- GIVEN an authenticated user
- WHEN the home screen mounts
- THEN the hook returns `{ user, totalBalance, currency, recentActivity[] }`

#### Scenario: Profile loads
- GIVEN an authenticated user
- WHEN the profile screen mounts
- THEN the hook returns the same summary with user metadata

### Requirement: Reflect real-time server state
The system MUST invalidate the summary query when mutations affect owned data.

#### Scenario: Expense created
- GIVEN a user creates an expense
- WHEN the mutation succeeds
- THEN the user summary query refetches

## API Contract

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/api/v1/me/summary` | — | `{ user: { id, name, email }, totalBalance: number, currency: string, recentActivity: [{ id, type, title, amount, date, groupId, groupName }] }` |

## Error Handling
- Network errors: retry twice, then explicit error with retry action.
- 401: refresh once; if refresh fails, clear session and redirect to login.

## Loading States
- Home/profile screens show skeleton while `isLoading` is true.
- Pull-to-refresh triggers manual refetch.

## Query Keys
- `['auth', 'me']` — user summary
- Invalidated by successful group/expense/settlement mutations
