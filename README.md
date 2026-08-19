# Cuentas Claras

Cuentas Claras is a React Native application for managing shared and personal expenses, income, groups, balances, and transaction categories. It is built with Expo and TypeScript and can run through Expo Go, a local native Android build, or EAS Build.

## Quick start

### Requirements

- Node.js compatible with the installed Expo SDK
- pnpm 10+
- Android Studio and Android SDK for local Android builds
- Java/JDK compatible with the Expo SDK and Android Gradle Plugin

### Install and run

```bash
pnpm install
pnpm start
```

Available development commands:

```bash
pnpm start             # Start the Expo development server
pnpm android           # Run the native Android development build
pnpm ios               # Run the native iOS development build
pnpm web               # Start the web target
```

Use Expo Go first when the installed features are supported by Expo Go. Use a native development build when the project requires native configuration or a native module that Expo Go does not include.

## Main capabilities

- Authentication and email verification flow
- Personal expenses and income tracking
- Personal transaction categories and category management
- Date-based transaction filtering: day, week, month, year, and custom period
- Expense-type filters for personal transactions
- Charts and category summaries
- Group creation and group management
- Shared expenses and group balances
- Expense splitting and settlement calculations
- Account/profile management
- Secure token storage and authenticated API requests
- React Query caching and prefetching for remote data

## Project structure

The code is organized by product domain under `src/features/`:

```text
src/
├── app/                     # Navigation, providers, and application shell
├── features/
│   ├── account/             # Account settings and account operations
│   ├── auth/                # Authentication and verification
│   ├── calculator/          # Expense and settlement calculations
│   ├── expenses/            # Shared expense flows
│   ├── groups/              # Groups, members, balances, and group state
│   ├── personal-expenses/   # Personal expenses, income, categories, and summaries
│   └── profile/             # Profile screens and profile behavior
├── shared/                  # API client, query client, theme, UI, and shared hooks
└── types/                   # Cross-cutting TypeScript types
```

Within a feature, behavior belongs in hooks, API access belongs in `api/`, validation belongs in `schemas/`, and route-level UI belongs in `screens/`.

## Technology stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- React Navigation
- TanStack React Query
- Zustand
- React Hook Form and Zod
- NativeWind/Tailwind CSS
- Jest and React Native Testing Library

## Configuration

### Environment variables

Create a local `.env` file when the backend URL or optional feature flags need to be overridden:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENHANCED_INITIAL_LOADING=false
```

`EXPO_PUBLIC_API_URL` defaults to `http://localhost:3000` when it is not defined. Do not commit credentials, tokens, or private keys.

### Backend contract

`swagger-spec.json` is the source of truth for API endpoints, request bodies, response envelopes, and DTO shapes. Backend responses are expected to use the following envelope:

```json
{ "data": "<payload>" }
```

When frontend code and the Swagger specification disagree, update the frontend to match `swagger-spec.json`.

## Development workflow

The repository follows:

```text
DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP
```

Read [`docs/development-workflow.md`](docs/development-workflow.md) for the complete process. Requirements and implementation decisions live in OpenSpec under `openspec/changes/<change-name>/`; reusable templates are under `openspec/templates/`. Project and workflow rules are defined in [`AGENTS.md`](AGENTS.md), and pull requests use [`.github/pull_request_template.md`](.github/pull_request_template.md).

For relevant application, dependency, migration, or CI changes, validate the OpenSpec artifacts with:

```bash
pnpm workflow:validate
```

## Testing and verification

Run the complete verification pipeline before reporting an implementation as complete:

```bash
pnpm verify
pnpm dlx expo-doctor
```

`pnpm verify` runs the full test suite, TypeScript validation, and the high-threshold security audit. Additional test commands:

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm typecheck
pnpm security:audit
```

## Generate an Android APK locally

The repository includes an `android/` native project and an EAS profile named `release-apk`. A local build does not use the monthly EAS cloud-build quota.

### Option 1: EAS local build (recommended)

This uses the same EAS profile configured for a distributable APK, but runs the build on your computer instead of EAS servers:

```bash
 EXPO_PUBLIC_API_URL=https://api.cuentas-claras-app.com \
   pnpm dlx eas-cli@latest build \
     --platform android \
     --profile preview \
     --local
```

The command may request or configure Android signing credentials. Keep the generated keystore safe; it is required for future updates of the same Android application.

EAS local Android builds are supported on macOS and Linux. Windows users can use WSL with the Android toolchain configured inside WSL.

### Option 2: Expo native release build

For a local release variant intended mainly for device testing:

```bash
pnpm exec expo run:android --variant release
```

The generated APK is normally available at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

### Cloud build alternative

The normal EAS cloud command is:

```bash
pnpm dlx eas-cli@latest build \
  --platform android \
  --profile release-apk
```

This option consumes the Android build quota of the Expo account. If the Free plan quota is exhausted, use the local build commands above, wait for the quota reset, or use a plan with additional build capacity.

## EAS profiles

`eas.json` currently defines:

| Profile       | Purpose                 | Android output              |
| ------------- | ----------------------- | --------------------------- |
| `development` | Development client      | Internal build              |
| `preview`     | Internal testing        | APK                         |
| `release-apk` | Installable release APK | APK                         |
| `production`  | Store submission        | Android App Bundle (`.aab`) |

## Application identity

| Platform     | Identifier              |
| ------------ | ----------------------- |
| Android      | `com.cuentasclaras.app` |
| iOS          | `com.cuentasclaras.app` |
| Expo project | `cuentas-claras-app`    |

## Contribution checklist

Before opening a pull request:

- Keep changes inside the correct product feature.
- Add or update tests for behavior changes.
- Run `pnpm verify`.
- Run `pnpm dlx expo-doctor`.
- Confirm that API changes match `swagger-spec.json`.
- Do not commit secrets, local `.env` values, or signing credentials.
