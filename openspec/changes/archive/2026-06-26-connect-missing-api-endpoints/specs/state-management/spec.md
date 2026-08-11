# state-management Specification

## Purpose
Separate server state (React Query) from client/UI state (Zustand); remove runtime mock/local data for server-owned entities.

## Requirements

### Requirement: Server state in React Query
The system MUST keep all server-owned state in React Query hooks and MUST NOT mirror it in Zustand.

#### Scenario: Group list
- GIVEN the groups list is fetched
- WHEN the data changes on the server
- THEN React Query refetches and screens reflect the new data

### Requirement: Client/UI state in Zustand
The system MAY keep transient UI state in Zustand (e.g., selected tab, modal visibility, form draft).

#### Scenario: Modal visibility
- GIVEN a modal is open
- WHEN the user closes it
- THEN Zustand toggles the visibility flag without an API call

### Requirement: Remove runtime mocks
The system MUST NOT use seeded mock or local-only data for server-owned entities in production runtime.

#### Scenario: Group detail
- GIVEN the group detail screen renders
- WHEN data is loading
- THEN the screen shows a skeleton, not mock data

## Error Handling
- React Query errors surface via hook error states; Zustand does not intercept them.

## Loading States
- Server state loading is handled by React Query `isLoading`/`isPending`.
- UI state loading (e.g., button spinners) is handled by mutation pending state.

## Query Keys
- All server state keys live in React Query and follow the domain convention (see react-query skill).
