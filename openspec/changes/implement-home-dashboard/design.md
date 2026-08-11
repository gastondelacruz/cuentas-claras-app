# Design: Implement Home Dashboard

## Technical Approach

Replace the current groups-owned `InicioScreen` placeholder with a new `src/features/home` dashboard module. Keep React Navigation route names unchanged: `MainTabs` still exposes `Inicio`, but imports `HomeScreen` from `features/home`. The screen reads a local, typed, query-shaped hook and renders summary cards, active groups, recent activity, and future-ready loading, empty, and error states. No backend, persistence, or network calls are introduced.

## Architecture Decisions

| Topic | Choice | Alternatives considered | Rationale |
|------|--------|--------------------------|-----------|
| Feature ownership | Create `src/features/home` and leave group placeholders untouched. | Keep `InicioScreen` in `features/groups`. | Home dashboard is its own product domain; this preserves Screaming Architecture. |
| Data seam | `useHomeData()` returns `{ data, isLoading, isError, error }` from static mocks. | Inline mock objects in the screen. | Matches future TanStack Query shape without adding query dependency or network behavior now. |
| UI extraction | Keep dashboard-specific UI in `features/home/components`; add shared primitives only if clearly generic. | Build a broad shared design system first. | Limits review size and avoids over-generalizing from one screen. |
| Styling | Use NativeWind `className` and existing tokens from `tailwind.config.js` / `src/shared/theme/tokens.js`. | Inline ad-hoc styles or new token migration. | Project rules require NativeWind and centralized tokens; current tokens already cover primary, debt, neutrals, spacing, and radius. |
| Navigation | Modify only `src/app/navigation/MainTabs.tsx` import path. | Rename routes or add the mockup-only fifth tab. | Specs require stable tab routes and no tab redesign. |

## Data Flow

```text
MainTabs Inicio route
  -> features/home/screens/HomeScreen
  -> useHomeData()
  -> home mock data
  -> SummaryCards / ActiveGroups / RecentActivity / state views
```

`HomeScreen` is the container boundary: it handles hook state branching and composes presentational components. Presentational components receive typed props and do not know whether data came from mocks or a future query.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/home/types.ts` | Create | Home summary, group, member, activity, and hook result contracts. |
| `src/features/home/mocks/home.mock.ts` | Create | Static mock data for required amounts, groups, and activity. |
| `src/features/home/hooks/useHomeData.ts` | Create | Query-shaped local hook with loading/error fields. |
| `src/features/home/screens/HomeScreen.tsx` | Create | Dashboard container and state branching. |
| `src/features/home/components/*.tsx` | Create | Summary cards, active group card/list, activity row/list, FAB, and state views. |
| `src/shared/utils/formatAmount.ts` | Create | Shared `es-AR` signed currency formatter. |
| `src/shared/ui/*` | Create/modify if needed | Minimal generic `Card`, `Chip`, `Avatar`, `AmountText`, or `ScreenContainer`; otherwise keep feature-local. |
| `src/app/navigation/MainTabs.tsx` | Modify | Import `HomeScreen` from `features/home`. |
| `src/app/__tests__/navigation.test.tsx` | Modify | Assert dashboard content on authenticated initial tab, not placeholder copy. |
| `src/features/home/__tests__/*` | Create | Screen, state, and formatter/component coverage. |

## Interfaces / Contracts

```ts
type UseHomeDataResult = {
  data: HomeDashboardData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};
```

Money values stay numeric in mocks and become UI strings only through `formatAmount(amount, { sign: true })`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Amount formatting and typed mock hook shape. | Jest assertions for signs, separators, and no network mocks. |
| Component | Loaded, loading, empty, and error states. | React Native Testing Library renders `HomeScreen` or state-specific components. |
| Navigation | Authenticated initial `Inicio` renders dashboard and existing tab names remain. | Update `src/app/__tests__/navigation.test.tsx`. |

## Migration / Rollout

No migration required. This is mock-only UI behind the existing authenticated `Inicio` tab.

## Open Questions

- [ ] `openspec/` is ignored by `.gitignore`, so SDD artifacts may not be reviewed or committed unless the team intentionally includes them another way.
