# Cuentas Claras App — AI Agent Ruleset

This is a React Native Expo app for shared expense management. All product behavior lives in `src/features/<domain>/`; shared infrastructure lives in `src/shared/`; navigation and app shell live in `src/app/`.

## API Contract Source of Truth

- `swagger-spec.json` is the source of truth for backend endpoints, request bodies, response envelopes, and DTO shapes.
- Before adding or changing API client code, schemas, mocks, or tests, inspect `swagger-spec.json` and align frontend expectations with its OpenAPI definitions.
- Backend responses use a single `data` envelope: `{ "data": <payload> }`.
- If implementation code and `swagger-spec.json` disagree, treat the Swagger spec as authoritative and update the frontend or tests accordingly.

> **Skills Reference**: For detailed patterns, load these skills before changing code:
>
> - [`accessibility`](skills/accessibility/SKILL.md) — mobile a11y: roles, labels, focus, screen reader
> - [`building-native-ui`](skills/building-native-ui/SKILL.md) — Expo Router, React Native UI, platform-aware components
> - [`composition-patterns`](skills/composition-patterns/SKILL.md) — compound components, render props, context providers
> - [`design-mobile-apps`](skills/design-mobile-apps/SKILL.md) — mobile-first product and interaction design
> - [`expo-api-routes`](skills/expo-api-routes/SKILL.md) — Expo API Routes and server-side route patterns
> - [`expo-cicd-workflows`](skills/expo-cicd-workflows/SKILL.md) — EAS CI/CD workflow design and automation
> - [`expo-deployment`](skills/expo-deployment/SKILL.md) — EAS builds, submission, release, deployment
> - [`expo-dev-client`](skills/expo-dev-client/SKILL.md) — Expo Dev Client setup and native development
> - [`expo-tailwind-setup`](skills/expo-tailwind-setup/SKILL.md) — Expo + NativeWind/Tailwind setup and config
> - [`frontend-design`](skills/frontend-design/SKILL.md) — production-grade UI design and visual hierarchy
> - [`native-data-fetching`](skills/native-data-fetching/SKILL.md) — fetch API, error handling, auth tokens, env vars
> - [`nodejs-backend-patterns`](skills/nodejs-backend-patterns/SKILL.md) — backend API architecture (when backend work is involved)
> - [`nodejs-best-practices`](skills/nodejs-best-practices/SKILL.md) — Node.js conventions, runtime, maintainability
> - [`project-architecture`](skills/project-architecture/SKILL.md) — Screaming Architecture, file organization, feature domains, shared infrastructure
> - [`react-best-practices`](skills/react-best-practices/SKILL.md) — React component design, hooks, re-render optimization
> - [`react-hook-form`](skills/react-hook-form/SKILL.md) — form state, validation integration, performance
> - [`react-query`](skills/react-query/SKILL.md) — TanStack Query: useQuery, useMutation, QueryClient, queryKey design
> - [`seo`](skills/seo/SKILL.md) — SEO guidance if web surfaces are introduced
> - [`tailwind-css-patterns`](skills/tailwind-css-patterns/SKILL.md) — NativeWind/Tailwind class patterns and conventions
> - [`typescript-advanced-types`](skills/typescript-advanced-types/SKILL.md) — generics, conditional types, utility types
> - [`upgrading-expo`](skills/upgrading-expo/SKILL.md) — Expo SDK upgrades and dependency compatibility
> - [`use-dom`](skills/use-dom/SKILL.md) — Expo DOM components for DOM-backed UI on native
> - [`zod`](skills/zod/SKILL.md) — Zod schemas, safeParse, z.infer, validation error display

---

## Auto-invoke Skills

When performing these actions, **ALWAYS** read the corresponding skill first:

| Action | Skill |
|---|---|
| Creating new files, features, or deciding where code lives | `project-architecture` |
| Adding or changing accessibility behavior | `accessibility` |
| Building or modifying mobile UI screens/components | `building-native-ui` |
| Designing screen layouts or product flows from mockups | `design-mobile-apps` |
| Creating or refactoring reusable React components | `composition-patterns` |
| Writing or refactoring React hooks/components | `react-best-practices` |
| Fetching, caching, or synchronizing remote data | `react-query`, `native-data-fetching` |
| Writing useQuery, useMutation, or QueryClient setup | `react-query` |
| Creating forms or form validation flows | `react-hook-form`, `zod` |
| Creating or changing Zod schemas | `zod` |
| Modeling complex TypeScript types | `typescript-advanced-types` |
| Working with NativeWind/Tailwind classes | `tailwind-css-patterns` |
| Changing NativeWind, Tailwind, Babel, or Metro styling setup | `expo-tailwind-setup` |
| Upgrading Expo SDK or Expo-managed dependencies | `upgrading-expo` |
| Working with Expo Dev Client | `expo-dev-client` |
| Preparing builds, releases, or submissions | `expo-deployment` |
| Creating or changing CI/CD workflows | `expo-cicd-workflows` |
| Adding Expo API routes | `expo-api-routes` |
| Introducing backend/API implementation patterns | `nodejs-backend-patterns`, `nodejs-best-practices` |
| Adding web or DOM-backed Expo surfaces | `use-dom` |
| Adding web/SEO-facing behavior | `seo` |
| Creating or improving UI design | `frontend-design` |
| Fixing a bug | TDD rules below + relevant skill |
| Implementing a feature | TDD rules below + `project-architecture` + relevant skill |
| Refactoring code | TDD rules below + `project-architecture` + relevant skill |

---

## CRITICAL RULES — NON-NEGOTIABLE

### TDD

- ALWAYS work test-first for behavior changes: write or update the failing test BEFORE implementation.
- ALWAYS run the full test suite before reporting done — never a subset.
- NEVER weaken TypeScript, lint, or test configuration to make a test pass.
- Tests must cover at minimum: render without crashing, key user interactions, navigation side effects, and store/query calls.
- NEVER skip tests on UI-only work. If it has behavior (navigation, state, user input), it has tests.

---

## Commands

After code changes, run all three — all must pass before reporting done:

```bash
npm test -- --runInBand     # Full test suite
npm run typecheck           # TypeScript check
npx expo-doctor             # Expo compatibility check
```

For development:

```bash
npx expo start              # Start dev server
npx expo start --ios        # iOS simulator
npx expo start --android    # Android emulator
```

---

## QA Checklist

- [ ] Relevant skill files were read before implementation.
- [ ] Context7 was queried for live library docs before applying skill rules.
- [ ] `project-architecture` skill was consulted before creating or moving files.
- [ ] TDD was followed: failing test written before implementation.
- [ ] `npm test -- --runInBand` passes (all tests green).
- [ ] `npm run typecheck` passes with no errors.
- [ ] `npx expo-doctor` passes with no errors.
