# E2E Testing Patterns Skill

This skill defines the local Playwright pattern for Cuentas Claras App.

## Quick path

1. Read `SKILL.md` before E2E/Playwright work.
2. Query Context7 for current Playwright docs before changing tests, config, fixtures, or E2E docs.
3. Put tests in `e2e/<domain>/`, one folder per feature/domain.
4. Keep API mocks aligned with `swagger-spec.json` and the `{ "data": ... }` envelope.
5. Run `npm run test:e2e` and then `npm run verify`.

## File structure

```text
e2e-testing-patterns/
├── SKILL.md
├── AGENTS.md
├── metadata.json
├── README.md
└── references/
    └── playwright-domain-structure.md
```

## Core principles

| Principle | Requirement |
|---|---|
| Domain ownership | Tests live under `e2e/<domain>/`. |
| User intent | Prefer role, label, text, and placeholder locators. |
| Contract safety | Validate mocked request bodies against Swagger-derived expectations. |
| Honest coverage | Cover real web-compatible flows and document native-only gaps. |

## References

- `references/playwright-domain-structure.md`
