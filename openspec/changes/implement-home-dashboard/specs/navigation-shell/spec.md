# Delta for navigation-shell

## MODIFIED Requirements

### Requirement: Main Tab Navigator (Authenticated)

The app MUST render the authenticated bottom-tabs navigator with the existing `Inicio` route connected to the Home dashboard. Other existing tab routes MUST remain unchanged unless separately scoped.

(Previously: the `Inicio` tab rendered placeholder content from the groups feature.)

#### Scenario: Inicio tab renders Home dashboard

- GIVEN `useAuthStore` returns `{ isAuthenticated: true }`
- WHEN the root navigator renders the authenticated tabs
- THEN the initial `Inicio` tab renders the Home dashboard
- AND it no longer renders placeholder-only screen-name content

#### Scenario: Existing tab routes remain stable

- GIVEN the authenticated tab navigator renders
- WHEN tabs are inspected
- THEN the existing route names remain available
- AND this change does not introduce the mockup-only five-tab redesign
