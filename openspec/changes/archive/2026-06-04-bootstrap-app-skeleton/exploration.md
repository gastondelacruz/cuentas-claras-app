# Exploration: bootstrap-app-skeleton

## Current State

`cuentas-claras-app` is still in pre-scaffold state. The app directory contains OpenSpec artifacts, `.atl` registry files, and `.gitignore`, but no `package.json`, Expo config, TypeScript config, NativeWind config, Jest config, or source tree.

OpenSpec is project-local under `cuentas-claras-app/openspec`; sibling/root OpenSpec artifacts exist in the monorepo and must remain untouched for this change.

The bootstrap change already has downstream artifacts: `proposal.md`, six delta specs, `design.md`, and `tasks.md`. Those artifacts define an Expo managed TypeScript mobile app with NativeWind className-only styling, React Navigation, TanStack Query, Zustand, Axios with JWT refresh handling, react-hook-form + zod, expo-secure-store, lucide-react-native, and Inter via expo-font.

The sibling `pantallas/` directory contains the expected screen inventory: onboarding, login, registrarse, inicio, listado de grupos, detalle de grupo, nuevo grupo, agregar gasto, liquidar deudas, and perfil. It also includes `esquema de colores.md` with the "Luminous Finance" palette and design guidance. Bootstrap must still prioritize the explicit user tokens: primary `#0E7A3A`, debt `#DC2626`, and accent `#F97316`; full reconciliation with the mockup palette remains post-bootstrap.

Testing is intentionally pre-scaffold/inferred. Strict TDD is disabled until Jest + jest-expo exist and are validated.

## Affected Areas

- `package.json` — new Expo project metadata, scripts, and dependency lock point.
- `app.json` or `app.config.*` — new Expo managed configuration.
- `tsconfig.json` — new TypeScript baseline and path/config behavior.
- `babel.config.js` — new Expo + NativeWind transform wiring.
- `tailwind.config.js` — new NativeWind theme extension using shared tokens.
- `jest.config.js` and `__tests__/setup.ts` — new jest-expo baseline and native module mocks.
- `src/app/` — new provider composition, root layout, error boundary, and navigation shell.
- `src/features/auth/` — placeholder onboarding, login, and register screens.
- `src/features/groups/` — placeholder groups list, group detail, and create group screens.
- `src/features/expenses/` — placeholder add expense and settle debts screens.
- `src/features/profile/` — placeholder profile screen.
- `src/shared/ui/` — shared Button/Input primitives and form pattern documentation.
- `src/shared/api/` — QueryClient, Axios client, refresh mutex, and secure-store token helpers.
- `src/shared/store/` — Zustand singleton stores for auth and settings.
- `src/shared/theme/` — source-of-truth tokens and typed exports for colors, typography, spacing, and radius.
- `openspec/changes/bootstrap-app-skeleton/*` — existing change artifacts define scope and should guide implementation; only this exploration artifact was added in the explore phase.
- `/Users/gastondelacruz/Documents/ProyectosProd/cuentas-claras/pantallas/` — read-only design reference for screen inventory and later visual reconciliation.

## Approaches

1. **Single-pass scaffold and infrastructure commit** — Create the full Expo app skeleton, dependencies, providers, state, API, navigation, placeholders, UI primitives, and tests in one implementation pass.
   - Pros: Fastest path to a runnable baseline; simple sequencing for a greenfield app.
   - Cons: Likely exceeds the 400-line review budget; harder to isolate dependency/config issues from navigation/API wiring issues.
   - Effort: Medium.

2. **Chained scaffold slices** — Implement the bootstrap in reviewable work units: scaffold/theme/providers first, state/API second, navigation/UI/tests third.
   - Pros: Matches the existing task forecast, keeps reviews smaller, isolates risky infrastructure such as NativeWind setup and Axios refresh handling.
   - Cons: Requires branch/PR sequencing decisions before apply; slightly more coordination overhead.
   - Effort: Medium.

3. **Minimal Expo-only scaffold first** — Create only the Expo TypeScript baseline and defer all planned libraries and architecture wiring to later changes.
   - Pros: Lowest immediate risk; fastest confirmation that Expo works on the machine.
   - Cons: Does not satisfy the existing proposal/spec/design scope; delays architecture validation and leaves downstream features blocked.
   - Effort: Low.

## Recommendation

Proceed with the existing chained scaffold plan rather than a single oversized bootstrap. The current tasks already forecast 900-1400 changed lines and a high 400-line budget risk, so implementation should be split before apply according to the configured `ask-always` chained PR strategy.

Use `npx create-expo-app@latest ... --template blank-typescript`, not `expo init`. The design artifact correctly identifies `expo init` as deprecated/removed in modern Expo CLI, while some proposal/spec text still says `expo init`; implementation should follow the design correction to avoid a predictable scaffold failure.

Keep the bootstrap screens as placeholders and avoid real backend calls. The most important foundation decisions to preserve are Zustand singleton stores for non-React access from Axios interceptors, a hand-rolled refresh mutex for concurrent 401 handling, and shared design tokens through a CommonJS-friendly `tokens.js` consumed by both Tailwind/NativeWind and typed TypeScript exports.

## Risks

- Some existing proposal/spec language still references `expo init`; applying that literally would conflict with the design decision and may fail on current Expo tooling.
- NativeWind major-version differences can change setup details for Babel, Tailwind content globs, and className support.
- Token refresh behavior has concurrency risk; the refresh mutex and retry-once guard need tests before real auth work builds on it.
- Expo native modules such as `expo-secure-store`, `expo-font`, and splash handling require Jest mocks and may fail if the test setup is incomplete.
- The design token source is intentionally split between explicit bootstrap tokens and the richer Luminous Finance mockup palette; this can create visual drift if reconciliation is not tracked after bootstrap.
- The app is not a git repo at `cuentas-claras-app`; review/PR workflows may need to happen from the monorepo or after repo initialization.
- Strict TDD remains disabled until the test runner exists, so the first implementation phase must include quick verification to avoid building on an untestable scaffold.

## Ready for Proposal

Yes. The exploration confirms the change is feasible and already sufficiently scoped by existing proposal, specs, design, and tasks. Before apply, the orchestrator should resolve the `ask-always` chained PR decision because the forecast exceeds the 400-line review budget.
