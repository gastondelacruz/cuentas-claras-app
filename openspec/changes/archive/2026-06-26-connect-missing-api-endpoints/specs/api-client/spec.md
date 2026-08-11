# api-client Specification

## Purpose
Shared Axios client with aligned auth refresh/logout endpoints and deterministic unrecoverable auth failure handling.

## Requirements

### Requirement: Refresh endpoint
The system MUST call `POST /api/v1/auth/refresh` with `{ refreshToken }` and update the stored access token on success.

#### Scenario: Token refresh succeeds
- GIVEN an expired access token and a valid refresh token
- WHEN a 401 response is intercepted
- THEN the client refreshes and retries the original request once

#### Scenario: Refresh endpoint itself fails
- GIVEN the refresh request returns 401
- WHEN the interceptor catches it
- THEN the client MUST NOT retry refresh and MUST clear the session

### Requirement: Logout endpoint
The system MUST call `POST /api/v1/auth/logout` with `{ refreshToken }` and clear the local session on success or failure.

#### Scenario: Logout succeeds
- GIVEN an authenticated user
- WHEN the user triggers logout
- THEN the client sends the logout request, clears tokens, and resets auth state

### Requirement: Unrecoverable auth failure
The system MUST refresh once on 401 and clear the session if refresh fails.

#### Scenario: Refresh fails
- GIVEN a 401 response and an invalid refresh token
- WHEN the interceptor attempts refresh
- THEN the session clears and the user redirects to login

## API Contract

| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/api/v1/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/api/v1/auth/logout` | `{ refreshToken }` | 204 No Content |

## Error Handling
- Refresh 401: clear session immediately; do not loop.
- Logout: always clear local session regardless of API result.
- Network errors on refresh: clear session and redirect to login.

## Loading States
- Logout action disables the logout button while the mutation is pending.

## Query Keys
- Not applicable; handled by Axios interceptor and auth store.
