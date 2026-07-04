# Cuentas Claras App

Cuentas Claras is an Expo/React Native app for managing shared and personal expenses. It lets users sign in, create groups, invite members, register shared expenses, review balances, track personal transactions, and manage their profile.

## Quick path

1. Install dependencies with `npm ci`.
2. Start the app with `npx expo start` for native development, or `npm run web` for web preview.
3. Before finishing a feature, run `npm run verify`.

## What the system does

| Area | Behavior |
|------|----------|
| Authentication | Users can log in/register, keep an access token in app state, and clear the session on logout. |
| Groups | Users can list groups, create/edit groups, invite members by email, review balances, and open group details. |
| Shared expenses | Users can add expenses to a group, choose category, payer, date, and participants, then see recent expenses in group detail. |
| Personal transactions | Users can track income/expense transactions, filter by time range, and see totals and category distribution. |
| API contracts | Frontend DTOs, mocks, and tests must follow `swagger-spec.json`; backend responses use `{ "data": ... }`. |

## Verification

`npm run verify` is the release gate for feature work. It runs:

```bash
npm test -- --runInBand
npm run typecheck
npm run test:e2e
npm run security:audit
npx expo-doctor
```

The E2E suite exports the Expo web build, serves `dist/` locally, and runs Playwright against Chromium. Specs live under `e2e/<domain>/` with one folder per feature/domain, while shared API mocks live in `e2e/fixtures/`. Mocks are aligned to Swagger request/response DTOs and the backend `{ "data": ... }` envelope. This validates the web-compatible surface of the app; it does not replace native-device QA for iOS/Android-only behavior.

## Security checks

Security verification uses `audit-ci` with an npm audit threshold of `high`. Current Expo SDK 54 transitive advisories include moderate findings whose non-breaking fixes are not available without a major Expo upgrade, so high/critical issues fail CI while moderate SDK advisories remain visible in audit output.

## CI

Pull requests to `main` run `npm run verify` in GitHub Actions. Keep tests, E2E coverage, security checks, typecheck, and Expo Doctor green before requesting review.
