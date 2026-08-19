# Verification Report: feat-reset-password

## Checks

- Focused linking/configuration tests: PASS — 2 suites, 10 tests.
- Focused verification/reset screen tests: PASS — 2 suites, 10 tests.
- `pnpm typecheck`: PASS.
- `pnpm exec expo config --json`: PASS — package, scheme and two HTTPS `intentFilters` resolve correctly.
- Local APK build: PASS — `build-1787174084146.apk`; manifest contains both App Link filters and package `com.cuentasclaras.app`.
- API smoke check: email verification endpoint responds with expected 400 for a fake token; password reset endpoint currently responds 404 (`Cannot POST /api/v1/auth/password/reset`).
- `pnpm verify`: BLOCKED by the current working tree's Expo 57/Jest module-transform failures in suites importing `expo-constants`; 69 suites passed and 15 failed before completion.
- `pnpm dlx expo-doctor`: BLOCKED by pre-existing Expo patch mismatches (`expo`, `expo-constants`, `expo-image-picker`, `expo-splash-screen`); 20/21 checks passed.

## Implemented behavior

- `POST /api/v1/auth/email-verification/verify` sends `{ token }` through the existing `/api/v1` client prefix.
- `POST /api/v1/auth/password/reset` sends `{ token, password }` through the existing `/api/v1` client prefix.
- React Navigation remains the navigation system; both HTTPS routes and the existing `cuentasclaras://` scheme map to their screens.
- Android App Links are configured for `/verify-email` and `/reset-password` with package `com.cuentasclaras.app`.
- Verification and reset screens handle missing tokens, API token errors, successful requests and connection errors.
- Reset validation requires at least 8 characters, one letter, one number and matching confirmation.

## External setup pending

- Publish `docs/deployment/assetlinks.json` as `https://cuentas-claras-app.com/.well-known/assetlinks.json`. It contains the real fingerprint extracted from the local APK generated in this session. The current domain responds with a parked Hostinger page, so this external deployment is still pending.
- Deploy/enable `POST /api/v1/auth/password/reset` in the backend; the current API returns 404, so reset success cannot be tested yet.
- Configure `EXPO_PUBLIC_API_URL=https://api.cuentas-claras-app.com` in the EAS environment used for the build.
- Build and test on a physical Android device; App Links require a new native APK/AAB after changing `intentFilters`.

## Known limitations

- The supplied `swagger-spec.json` does not list the password endpoints; implementation follows the explicit endpoint contract in the feature request.
- The full repository verification remains blocked until the pre-existing Expo dependency/Jest transform issues are resolved.
