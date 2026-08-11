# Proposal: Implement Home Dashboard

## Intent

Replace the placeholder `Inicio` tab with a mock-data dashboard showing balances, active groups, and recent activity. Keep it backend-free while shaping contracts for future API/TanStack Query integration.

## Scope

### In Scope
- Add `src/features/home` with typed mock data, a query-shaped `useHomeData` hook, dashboard screen, and feature-local components.
- Render summary cards, active groups, recent activity, ready states, and a floating add-expense action.
- Add reusable shared primitives/utilities only where broadly useful.
- Wire the existing `Inicio` tab to the new Home screen without renaming routes.
- Update tests for the new dashboard and navigation behavior.

### Out of Scope
- Backend calls, persistence, mutations, or real TanStack Query requests.
- Tab bar redesign or adding the mockup's fifth tab.
- Group detail, expense creation, debt settlement, or profile behavior.

## Capabilities

### New Capabilities
- `home-dashboard`: Home dashboard behavior, mock contracts, UI states, summary/activity/group presentation, and amount formatting.

### Modified Capabilities
- `navigation-shell`: `HomeScreen` renders the Home dashboard while preserving the `Inicio` route and initial tab behavior.

## Approach

Use the feature-local approach from exploration. Keep product UI in `src/features/home`, generic UI/formatting in `src/shared`, and styling through NativeWind/tokens. The mock hook returns stable local data and future-ready `{ data, isLoading, isError, error }`. Code identifiers remain English.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/home/` | New | Home types, mocks, hook, screen, and components. |
| `src/shared/ui/` | Modified | Reusable primitives as needed. |
| `src/shared/utils/formatAmount.ts` | New | Shared `es-AR` amount formatter. |
| `src/app/navigation/MainTabs.tsx` | Modified | Import `HomeScreen`. |
| `src/app/__tests__/navigation.test.tsx` | Modified | Assert dashboard screen behavior instead of placeholder text. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Over-generalized shared UI from one screen | Medium | Keep reusable primitives minimal and move domain-specific UI into `features/home`. |
| Mockup suggests tab redesign | Medium | Preserve current tab contract; limit this change to tab content. |
| Future API shape mismatch | Low | Keep typed mocks and hook shape easy to swap. |

## Rollback Plan

Revert `features/home`, shared additions, formatter, navigation import change, and related tests. Restore `Inicio` to the previous placeholder import.

## Dependencies

- Existing Expo React Native, NativeWind, navigation shell, and design tokens.
- User-provided `inicio` mockup in sibling `pantallas/`.

## Success Criteria

- [ ] Authenticated `Inicio` tab renders dashboard content from mock data.
- [ ] Loading, empty, and error-ready states are implemented.
- [ ] No backend/network calls are introduced.
- [ ] Tests, typecheck, and Expo doctor pass.
