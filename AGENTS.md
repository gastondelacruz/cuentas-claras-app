# Cuentas Claras App — Agent Instructions

## Architecture

This project uses **Screaming Architecture**: the source tree must communicate the product domains first, not technical layers first.

Keep the main structure as:

```text
src/
  app/                 # App shell: providers, navigation, root layout, error boundaries
  features/            # Product domains and screens
    auth/
    groups/
    expenses/
    profile/
  shared/              # Cross-feature infrastructure and reusable building blocks
    api/
    hooks/
    store/
    theme/
    ui/
    utils/
```

## Hard Rules

- Ask the user before making any code changes. Explain the intended scope first and wait for approval.
- Ask the user before creating commits. Never commit, amend, or push without explicit approval for that exact action.
- Put product behavior inside `src/features/<domain>/`.
- Put app composition only inside `src/app/`.
- Put reusable, domain-agnostic code inside `src/shared/`.
- Do not create generic top-level layer folders like `components/`, `screens/`, `services/`, or `utils/` under `src/`.
- Do not move feature-specific logic into `shared/` just because two files need it once.
- UI copy, code comments, identifiers, and technical artifacts default to English unless the user explicitly requests otherwise.
- Use NativeWind `className` for styling. Avoid ad-hoc inline styles except for runtime-only values that cannot be expressed as tokens.
- Keep design tokens centralized in `src/shared/theme/` and `tailwind.config.js`.
- Keep navigation types centralized in `src/app/navigation/types.ts`.

## Feature Folder Convention

Use this shape when a feature grows:

```text
src/features/<domain>/
  screens/             # Route-level screens for this domain
  components/          # Domain-specific UI components
  hooks/               # Domain-specific hooks
  api/                 # Domain-specific API calls
  store/               # Domain-specific state, only when needed
  schemas/             # zod schemas and validation rules
  types.ts             # Domain types
```

Only create folders when they are needed. Avoid empty architecture theater.

## Current Bootstrap Scope

The current implementation is an Expo React Native bootstrap shell. Screens are placeholders by design. The next product work should replace placeholders using the mockups in the sibling `pantallas/` directory.

## Verification

Before reporting work as complete, run:

```bash
npm test -- --runInBand
npm run typecheck
npx expo-doctor
```

For Expo Go compatibility, this app currently targets Expo SDK 54.
