# api-client Specification

## Purpose

Defines the Axios HTTP client setup: instance configuration, request interceptor (attaches JWT access token), response interceptor (handles 401 → token refresh + retry), race-condition mutex, and `expo-secure-store` token helpers. At bootstrap, no real endpoints exist — behavior is verified via mocked Axios adapters.

---

## Requirements

### Requirement: Axios Instance Configuration

`src/shared/api/client.ts` MUST export a single Axios instance configured with `baseURL` from `EXPO_PUBLIC_API_URL` (fallback `http://localhost:3000/api`) and a `timeout` of 10 000 ms.

#### Scenario: Instance uses environment base URL

- GIVEN `EXPO_PUBLIC_API_URL` is set to `'http://test-server/api'`
- WHEN `client.defaults.baseURL` is read
- THEN it equals `'http://test-server/api'`

#### Scenario: Instance uses fallback URL when env var absent

- GIVEN `EXPO_PUBLIC_API_URL` is not set
- WHEN `client.defaults.baseURL` is read
- THEN it equals `'http://localhost:3000/api'`

#### Scenario: Request times out at 10 s

- GIVEN a mocked endpoint delays response beyond 10 000 ms
- WHEN `client.get('/test')` is awaited
- THEN the promise rejects with an Axios timeout error

---

### Requirement: Auth Request Interceptor

The request interceptor MUST attach an `Authorization: Bearer {accessToken}` header to every outgoing request, reading `accessToken` from `useAuthStore.getState()`.

#### Scenario: Access token is attached to request headers

- GIVEN `useAuthStore` holds `accessToken: 'abc123'`
- WHEN a request is dispatched via `client.get('/groups')`
- THEN the outgoing request config includes `headers.Authorization === 'Bearer abc123'`

#### Scenario: No Authorization header when token is null

- GIVEN `useAuthStore` holds `accessToken: null`
- WHEN a request is dispatched
- THEN the `Authorization` header is absent from the request config

---

### Requirement: Refresh Token Interceptor

The response interceptor MUST detect HTTP 401 responses, call the stub refresh endpoint (`/auth/refresh`) with the refresh token from `expo-secure-store`, store the new access token, and retry the original request exactly once.

#### Scenario: 401 triggers token refresh and request retry

- GIVEN the mock adapter returns 401 on the first call to `/groups`
- AND the mock adapter returns `{ accessToken: 'new-token' }` on `POST /auth/refresh`
- AND the mock adapter returns 200 `[{ id: '1' }]` on the retry
- WHEN `client.get('/groups')` is awaited
- THEN the final resolved response has status 200
- AND the retry request includes `Authorization: Bearer new-token`

#### Scenario: Non-401 errors are not intercepted for refresh

- GIVEN the mock adapter returns 404 on `GET /groups`
- WHEN `client.get('/groups')` is awaited
- THEN the promise rejects with a 404 error (no refresh attempt)

#### Scenario: Failed refresh clears session and rejects

- GIVEN the mock adapter returns 401 on `GET /groups`
- AND the mock adapter returns 401 on `POST /auth/refresh`
- WHEN `client.get('/groups')` is awaited
- THEN `useAuthStore.clearSession()` has been called
- AND the promise rejects with the 401 error

---

### Requirement: Race-Condition Guard on Concurrent Refreshes

When multiple requests receive 401 simultaneously, the interceptor MUST issue only ONE refresh call. All queued requests MUST retry with the single new token after refresh completes.

#### Scenario: Concurrent 401s produce a single refresh call

- GIVEN three concurrent requests each receive 401
- WHEN all three interceptors run
- THEN `POST /auth/refresh` is called exactly once
- AND all three original requests are retried and resolved with the new token

---

### Requirement: Secure Store Token Helpers

`src/shared/api/tokenStorage.ts` MUST export `getRefreshToken(): Promise<string | null>`, `setRefreshToken(token: string): Promise<void>`, and `clearRefreshToken(): Promise<void>` backed by `expo-secure-store`.

#### Scenario: setRefreshToken persists and getRefreshToken retrieves

- GIVEN the secure-store mock is active
- WHEN `setRefreshToken('tok-xyz')` is called
- AND `getRefreshToken()` is subsequently called
- THEN it returns `'tok-xyz'`

#### Scenario: clearRefreshToken removes the stored value

- GIVEN `setRefreshToken('tok-xyz')` was called
- WHEN `clearRefreshToken()` is called
- AND `getRefreshToken()` is called
- THEN it returns `null`

---

### Requirement: Logout Endpoint

The system MUST call `POST /api/v1/auth/logout` with `{ refreshToken }` and clear the local session on success or failure.

#### Scenario: Logout succeeds

- GIVEN an authenticated user
- WHEN the user triggers logout
- THEN the client sends the logout request, clears tokens, and resets auth state

#### Scenario: Logout button is disabled while pending

- GIVEN a logout request is in flight
- WHEN the button is rendered
- THEN it is disabled and shows a pending indicator

---

### Requirement: Aligned Refresh Endpoint

The refresh interceptor MUST call `POST /api/v1/auth/refresh` with `{ refreshToken }` and store both the new `accessToken` and `refreshToken` returned in the response.

#### Scenario: Refresh returns updated tokens

- GIVEN a 401 response and a valid refresh token
- WHEN the interceptor catches it
- THEN it calls `POST /api/v1/auth/refresh` and stores the returned `{ accessToken, refreshToken }`

---

## API Contract

| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/api/v1/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/api/v1/auth/logout` | `{ refreshToken }` | 204 No Content |

## Error Handling

- Refresh 401: clear session immediately; do not loop.
- Logout: always clear local session regardless of API result.
- Network errors on refresh: clear session and redirect to login.
