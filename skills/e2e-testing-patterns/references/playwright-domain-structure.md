# Playwright Domain Structure

Use domain folders so reviewers can understand what product area each E2E spec protects.

## Required layout

```text
e2e/
├── auth/
│   └── auth.spec.ts
├── groups/
│   └── groups.spec.ts
├── expenses/
│   └── expenses.spec.ts
├── personal-expenses/
│   └── personal-expenses.spec.ts
├── profile/
│   └── profile.spec.ts
└── fixtures/
    └── api.ts
```

## Fixture rules

- Treat `swagger-spec.json` as the API contract source of truth.
- Use the backend envelope: `{ "data": <payload> }`.
- Validate mutation bodies for contract-sensitive fields.
- Keep shared state inside `installApiMocks(page)` so each test gets isolated fixtures.

## Coverage rule

Every important web-compatible domain flow should have a Playwright path. If a flow relies on native-only APIs or unstable browser behavior, document the limitation in README or in the relevant spec comment instead of adding fake assertions.
