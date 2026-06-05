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

## Available Skills

Use local skills for detailed patterns on demand. Before working on a specialized task, check whether a matching skill exists and read its `SKILL.md` before making decisions or changes.

Skill locations:

```text
.agents/skills/<skill-name>/SKILL.md
.claude/skills/<skill-name>/SKILL.md
```

`AGENTS.md` remains the project authority. If a skill conflicts with the hard rules in this file, follow `AGENTS.md` and ask the user before proceeding.

### Project Skills

| Skill | Use for |
|-------|---------|
| `accessibility` | Mobile accessibility patterns, roles, labels, focus, and screen reader behavior. |
| `building-native-ui` | React Native UI implementation and platform-aware mobile components. |
| `composition-patterns` | Component composition, container/presentational boundaries, and reusable APIs. |
| `design-mobile-apps` | Mobile-first product and interaction design guidance. |
| `expo-api-routes` | Expo API Routes and server-side route patterns. |
| `expo-cicd-workflows` | Expo CI/CD workflow design and automation. |
| `expo-deployment` | Expo builds, submission, release, and deployment workflows. |
| `expo-dev-client` | Expo Dev Client setup and native development workflows. |
| `expo-tailwind-setup` | Expo + NativeWind/Tailwind setup and configuration. |
| `frontend-design` | Frontend UX, layout, hierarchy, and visual design patterns. |
| `native-data-fetching` | Data fetching patterns for React Native apps. |
| `nodejs-backend-patterns` | Backend API and Node.js architecture patterns when backend work is involved. |
| `nodejs-best-practices` | Node.js conventions, runtime behavior, and maintainability. |
| `react-best-practices` | React component design, hooks, effects, and state patterns. |
| `react-hook-form` | Form state, validation integration, and form performance. |
| `seo` | SEO-related guidance if web surfaces are introduced. |
| `tailwind-css-patterns` | Tailwind/NativeWind class patterns and styling conventions. |
| `typescript-advanced-types` | TypeScript type modeling, inference, generics, and utility types. |
| `upgrading-expo` | Expo SDK upgrades and compatibility work. |
| `use-dom` | Expo `use dom` patterns when mixing DOM-backed UI. |
| `zod` | Zod schemas, validation rules, and typed parsing. |

### Auto-invoke Skills

When performing these actions, read the corresponding skill first:

| Action | Skill |
|--------|-------|
| Adding or changing accessibility behavior | `accessibility` |
| Building or modifying mobile UI screens/components | `building-native-ui` |
| Designing screen layouts or product flows from mockups | `design-mobile-apps` |
| Creating or refactoring reusable React components | `composition-patterns` |
| Writing or refactoring React hooks/components | `react-best-practices` |
| Creating forms or form validation flows | `react-hook-form`, `zod` |
| Creating or changing Zod schemas | `zod` |
| Modeling complex TypeScript types | `typescript-advanced-types` |
| Working with NativeWind/Tailwind classes | `tailwind-css-patterns` |
| Changing NativeWind, Tailwind, Babel, or Metro styling setup | `expo-tailwind-setup` |
| Fetching, caching, or synchronizing remote data | `native-data-fetching` |
| Upgrading Expo SDK or Expo-managed dependencies | `upgrading-expo` |
| Working with Expo Dev Client | `expo-dev-client` |
| Preparing builds, releases, or submissions | `expo-deployment` |
| Creating or changing CI/CD workflows | `expo-cicd-workflows` |
| Adding Expo API routes | `expo-api-routes` |
| Introducing backend/API implementation patterns | `nodejs-backend-patterns`, `nodejs-best-practices` |
| Adding web or DOM-backed Expo surfaces | `use-dom` |
| Adding web/SEO-facing behavior | `seo` |

## Verification

Before reporting work as complete, run:

```bash
npm test -- --runInBand
npm run typecheck
npx expo-doctor
```

For Expo Go compatibility, this app currently targets Expo SDK 54.
