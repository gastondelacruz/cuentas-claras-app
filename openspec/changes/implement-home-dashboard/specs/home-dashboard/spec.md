# home-dashboard Specification

## Purpose

Defines the mocked Home dashboard rendered in the `Inicio` tab.

## Requirements

### Requirement: Mock Home Data Contract

The system MUST expose typed mock Home dashboard data without backend, persistence, or network calls.

#### Scenario: Mock dashboard data is available

- GIVEN the Home dashboard renders
- WHEN the screen requests dashboard data
- THEN it receives `summary`, `activeGroups`, `recentActivity`, and `isLoading`
- AND `isLoading` is `false`
- AND no network request is made

#### Scenario: Future query states are representable

- GIVEN the Home data hook is adapted to a real query later
- WHEN loading, empty, or error states are needed
- THEN the screen structure supports those states without renaming UI components or data consumers

### Requirement: Summary Cards

The system MUST render two summary cards matching the requested mock data.

#### Scenario: Summary cards show owed amounts

- GIVEN mock summary data is loaded
- WHEN the Home dashboard renders
- THEN the user sees "Te deben" with "+$1.420,50" and "3 Personas"
- AND the user sees "Debes" with "-$342,15" and "2 Grupos"

### Requirement: Active Groups Section

The system MUST render a horizontally scrollable active groups section from mock data.

#### Scenario: Active groups are visible

- GIVEN mock active groups exist
- WHEN the Home dashboard renders
- THEN "Viaje a Lisboa" and "Almuerzo Oficina" are visible
- AND each group shows category, cover image, member avatars, extra member badge when applicable, and active debts label

### Requirement: Recent Activity Section

The system MUST render recent activity rows from mock data.

#### Scenario: Recent activity is visible

- GIVEN mock activity items exist
- WHEN the Home dashboard renders
- THEN "Cena de Sushi", "Billetes de Tren", and "Factura de la Luz" are visible
- AND each row shows paid-by/context text, signed amount, category icon treatment, and time label

### Requirement: Amount Formatting

The system MUST format money using Spanish Argentina-style separators with explicit signs.

#### Scenario: Amounts are formatted consistently

- GIVEN an amount is positive or negative
- WHEN it is displayed in summary or activity UI
- THEN it uses `$`, dot thousands, comma decimals, and a leading sign
- AND examples include "+$1.420,50", "-$342,15", and "-$85,00"

### Requirement: English Code Identifiers

The implementation MUST use English names for files, components, hooks, variables, types, and utilities.

#### Scenario: UI copy differs from code identifiers

- GIVEN the UI displays Spanish copy from the design
- WHEN code is implemented
- THEN identifiers remain English
- AND Spanish names are not used for components, variables, hooks, types, or utilities
