# Tasks: Implement Home Dashboard

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650-950 |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single feature branch story with work-unit commits |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Commit Unit | Notes |
|------|------|-----------|-------|
| 1 | Add typed mock data, hook, and formatter | Commit 1 | Foundation for the `feature/home-dashboard` user-story branch; include formatter/hook tests. |
| 2 | Build Home dashboard screen and feature-local UI | Commit 2 | Depends on Unit 1; include loaded/loading/empty/error coverage. |
| 3 | Wire `Inicio` navigation and update integration tests | Commit 3 | Depends on Unit 2; preserve existing tab routes. |

## Phase 1: Data Foundation

- [x] 1.1 Create `src/features/home/types.ts` with summary, group, member, activity, dashboard, and hook result types.
- [x] 1.2 Create `src/features/home/mocks/home.mock.ts` with required Spanish UI data and numeric money values only.
- [x] 1.3 Create `src/features/home/hooks/useHomeData.ts` returning `{ data, isLoading, isError, error }` without network calls.
- [x] 1.4 Create `src/shared/utils/formatAmount.ts` for signed `es-AR` currency strings: `+$1.420,50`, `-$342,15`, `-$85,00`.

## Phase 2: Dashboard UI

- [x] 2.1 Add minimal shared primitives in `src/shared/ui/` only if generic: `Card`, `Chip`, `Avatar`, `AmountText`, or `ScreenContainer`.
- [x] 2.2 Create `src/features/home/components/SummaryCards.tsx` to render `Te deben`, `Debes`, counts, and signed amounts.
- [x] 2.3 Create `src/features/home/components/ActiveGroupsSection.tsx` with horizontal group cards, cover image, avatars, badge, and debt label.
- [x] 2.4 Create `src/features/home/components/RecentActivitySection.tsx` with activity rows, context text, signed amount, category treatment, and time.
- [x] 2.5 Create `src/features/home/components/HomeStateViews.tsx` for loading, empty, and error states.
- [x] 2.6 Create `src/features/home/screens/HomeScreen.tsx` as the container that branches on hook state and composes dashboard sections plus FAB.

## Phase 3: Navigation Integration

- [x] 3.1 Update `src/app/navigation/MainTabs.tsx` to import `HomeScreen` from `src/features/home/screens/HomeScreen` only.
- [x] 3.2 Verify `src/app/navigation/types.ts` remains unchanged and no mockup-only fifth tab is added.

## Phase 4: Testing / Verification

- [x] 4.1 Add `src/shared/utils/__tests__/formatAmount.test.ts` for signs, separators, and decimals.
- [x] 4.2 Add `src/features/home/__tests__/useHomeData.test.ts` for query-shaped data and no loading by default.
- [x] 4.3 Add `src/features/home/__tests__/HomeScreen.test.tsx` for loaded, loading, empty, error, summary, groups, and activity scenarios.
- [x] 4.4 Update `src/app/__tests__/navigation.test.tsx` to assert Home dashboard on authenticated `Inicio` and stable tab routes.
- [x] 4.5 Run `npm test -- --runInBand`, `npm run typecheck`, and `npx expo-doctor`.

## Phase 5: Follow-Up

- [x] 5.1 Record that `openspec/` is git-ignored, so SDD artifacts may need explicit review handling outside normal `git status`.
