# E2E Testing Patterns

**Version 1.0.0**  
gentleman-programming  
July 2026

> This document is for agents maintaining Playwright E2E coverage in Cuentas Claras App.

---

## Abstract

Playwright E2E tests must be organized by product domain, use user-facing locators first, and mock backend APIs with Swagger-aligned request and response shapes. The suite validates Expo web-compatible behavior; native-only behavior needs separate native QA instead of fake browser coverage.

---

## Rules

1. Store specs under `e2e/<domain>/` with one folder per feature/domain.
2. Never keep a monolithic catch-all spec for unrelated app flows.
3. Prefer `getByRole`, `getByLabel`, `getByText`, and `getByPlaceholder` over `getByTestId`.
4. Inspect `swagger-spec.json` before touching API fixtures or request-body assertions.
5. Return mocked backend responses as `{ data: ... }` when Swagger defines an envelope.
6. Validate meaningful POST/PATCH bodies in Playwright mocks.
7. Cover important available flows per domain: auth, groups, shared expenses, personal expenses, and profile.
8. Query Context7 before changing E2E tests, fixtures, Playwright tooling/config/docs, or any external-documentation-dependent guidance.
9. Document web limitations when Expo web cannot reliably exercise a native flow.

---

## Review Checklist

- [ ] Specs are under `e2e/<domain>/`.
- [ ] Fixtures match `swagger-spec.json`.
- [ ] POST/PATCH mocks validate request bodies where useful.
- [ ] Semantic/user-facing locators are used first.
- [ ] Context7 was queried before E2E test, fixture, tooling, config, or docs changes.
- [ ] `npm run test:e2e` passes.
- [ ] `npm run verify` passes before completion.

---

## References

| File | Description |
|---|---|
| `SKILL.md` | Runtime instruction contract. |
| `references/playwright-domain-structure.md` | Domain-folder and fixture guidance. |
| `metadata.json` | Skill metadata and reference index. |
