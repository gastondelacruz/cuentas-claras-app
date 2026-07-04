---
name: e2e-testing-patterns
description: "Trigger: E2E, Playwright, end-to-end tests, web flows. Organize reliable domain-based Expo web E2E coverage."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Use this skill before creating, moving, reviewing, or editing Playwright E2E tests, E2E fixtures, Playwright config, or E2E documentation.

## Hard Rules

- Always query Context7 for live docs before changing E2E tooling/config/docs or anything involving external documentation.
- Place tests under `e2e/<domain>/`; create one folder per app feature/domain.
- Do not add monolithic catch-all specs such as `e2e/app-flows.spec.ts`.
- Prefer Playwright semantic and user-facing locators first: role, label, text, placeholder. Use test IDs only when the app has no stable accessible surface.
- Align API mocks and fixtures with `swagger-spec.json`; preserve the backend `{ data: ... }` response envelope.
- Validate useful POST/PATCH bodies in mocks so frontend/backend contract drift fails E2E early.
- Cover all important currently available domain flows, not only smoke tests.
- Document native-only or Expo-web-unreliable flows instead of pretending they are covered.

## Decision Gates

| Situation | Action |
|---|---|
| New app domain flow | Add or update `e2e/<domain>/*.spec.ts`. |
| Fixture or request shape changes | Inspect `swagger-spec.json` first and update validation. |
| Locator choice | Use role/label/text/placeholder before `getByTestId`. |
| Flow depends on native-only behavior | Exclude from Playwright and document the limitation. |

## Execution Steps

1. Query Context7 for Playwright docs relevant to the change.
2. Inspect `swagger-spec.json` for every mocked endpoint touched.
3. Inspect app UI accessibility labels/test IDs for realistic web flows.
4. Add tests in the matching `e2e/<domain>/` folder.
5. Keep fixtures in `e2e/fixtures/` shared only when multiple domains use them.
6. Run `npm run test:e2e`; run `npm run verify` before completion.

## Output Contract

Return the domain folders changed, flows covered per domain, fixture-contract notes, verification commands, and any documented coverage limitations.

## References

- `references/playwright-domain-structure.md`
