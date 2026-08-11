# Design: Personal expense type UI

## Approach
- Keep the new logic feature-local under `src/features/personal-expenses/`.
- Add a small UI state layer for expense type selection/filtering.
- Keep backend payloads unchanged for now.

## Implementation shape
- `PersonalExpenseTypeSelector` for the add screen segmented control.
- `PersonalExpenseTypeFilterChips` for the list screen filter row.
- `PersonalExpenseTypeBadge` for expense cards.
- Extend local feature types with `PersonalExpenseType` and a view-model type for UI enrichment.
- Enrich fetched expense transactions client-side with a default `variable` type.
- Filter the list in the screen hook, not in the view.

## Styling notes
- Match Stitch placement and spacing.
- Use a soft green selected state for the expense selector.
- Use dark-green selected chips for the filter row.
- Keep the rest of the screen layout intact.
