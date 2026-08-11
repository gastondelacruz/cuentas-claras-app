## Exploration: implement-home-dashboard

### Current State
- Navigation uses React Navigation bottom tabs in `src/app/navigation/MainTabs.tsx`.
- The `Inicio` tab currently imports from `src/features/groups/screens/InicioScreen.tsx`, which renders `PlaceholderScreen`.
- There is no `src/features/home` module yet.
- Shared UI is minimal: `Button`, `Input`, and `PlaceholderScreen` exist today.
- Theme tokens are centralized in `src/shared/theme/tokens.js` and wired to NativeWind via `tailwind.config.js`.
- There is no `src/shared/utils` folder and no reusable amount/currency formatter yet.
- The user-provided mockup should guide visual hierarchy, but the requested scope is the Home tab content, not a full tab bar redesign.

### Affected Areas
- `src/app/navigation/MainTabs.tsx` — should import the new Home screen from `features/home` while keeping the existing `Inicio` route name.
- `src/app/navigation/types.ts` — likely remains unchanged unless route names are intentionally expanded later.
- `src/features/home/types.ts` — new dashboard data contracts.
- `src/features/home/mocks/home.mock.ts` — mock-only dashboard source matching the future backend response shape.
- `src/features/home/hooks/useHomeData.ts` — local mock hook shaped like a future TanStack Query integration.
- `src/features/home/screens/HomeScreen.tsx` — new dashboard screen implementation.
- `src/features/home/components/*` — recommended home-specific presentation components such as summary cards, active group cards, activity rows, and FAB.
- `src/shared/utils/formatAmount.ts` — recommended reusable es-AR amount formatter.
- `src/app/__tests__/navigation.test.tsx` — existing placeholder assertions for the `Inicio` placeholder will need updating.

### Approaches
1. **Feature-local dashboard with shared formatter** — Build `features/home` with typed mocks, a query-shaped mock hook, feature-local UI components, and a shared amount formatter.
   - Pros: Preserves Screaming Architecture, keeps dashboard UI cohesive, and prepares the data seam for a future query swap.
   - Cons: Requires creating several files and updating tests.
   - Effort: Medium

2. **Single screen implementation** — Put all dashboard layout directly in `features/home/screens/HomeScreen.tsx` with minimal extraction.
   - Pros: Faster initial implementation.
   - Cons: Harder to test, harder to maintain, and weaker separation between data, layout, and repeated UI patterns.
   - Effort: Low

3. **Expand shared UI first** — Create reusable `Card`, `Avatar`, `Chip`, `AmountText`, and `ScreenContainer` before implementing the dashboard.
   - Pros: Matches the user's requested reuse targets and benefits future screens.
   - Cons: Larger scope and higher review burden; risks over-generalizing from one screen.
   - Effort: Medium/High

### Recommendation
Use the feature-local dashboard approach, while adding only the shared primitives that are clearly required by the requested screen and likely reusable: `ScreenContainer`, `Card`, `Chip`, `Avatar`, `AmountText`, and `formatAmount`. Keep product behavior and dashboard components inside `src/features/home`, keep generic formatting/UI primitives in `src/shared`, and keep route names unchanged.

The implementation should include empty, loading, and error-ready UI states even though mock data returns `isLoading: false` for now. All code identifiers, variables, and component names must be in English; UI copy may match the Spanish design.

### Risks
- Existing navigation tests assert placeholder behavior and will fail until updated.
- The current tab set differs from the mockup: current code has `Inicio`, `ListadoGrupos`, `AgregarGasto`, and `Perfil`; the mockup shows five tabs. This change should not redesign tabs unless explicitly scoped later.
- Theme tokens may be sparse versus the mockup; avoid ad-hoc inline colors and prefer existing or centralized tokens.
- Remote placeholder image URLs are acceptable for mock display, but no application data fetching should be introduced.
- FAB spacing must account for bottom tab/safe-area overlap.

### Ready for Proposal
Yes. Proceed to proposal with scope covering the new `features/home` module, navigation rewiring, shared amount formatter and UI primitives, screen/component tests, ready states, English code identifiers, and no backend/network calls.
