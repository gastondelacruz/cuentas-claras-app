# Development workflow

Cuentas Claras uses a repository-owned, portable workflow:

```text
DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP
```

`AGENTS.md` is the project contract. OpenSpec is the source of truth for requirements and implementation decisions. Generic skills never override project-specific rules.

## DEFINE

Create `openspec/changes/<change-name>/proposal.md` before implementation. State the objective, scope, non-goals, users affected, acceptance criteria, risks, and rollback expectations. Stop when requirements are ambiguous or a decision could cause irreversible data loss.

## PLAN

Create `design.md` and `tasks.md`. The design records architecture, data/API contracts, alternatives, and migration concerns. Tasks are small, testable vertical slices with explicit files, dependencies, acceptance criteria, and verification commands. Obtain approval before implementation.

## BUILD

Select the smallest relevant skills from `.agents/skills/` and `skills/`, reading their exact `SKILL.md` files first. Implement one approved task at a time. For behavior changes, write the failing regression or feature test first. Keep every slice tested, compilable, and revertible.

## VERIFY

Run the applicable focused checks and record evidence in `verify-report.md`:

```bash
pnpm verify
pnpm dlx expo-doctor
```

`pnpm verify` runs the full Jest suite, TypeScript validation, and the high-threshold security audit. Run E2E checks when they exist and are relevant. Documentation-only changes do not require product E2E.

## REVIEW

Review the complete diff for:

1. Correctness and regression risk
2. Readability and maintainability
3. Architecture and boundaries
4. Security, permissions, and data exposure
5. Performance and operational impact

Confirm acceptance criteria, tests, rollback, secrets, generated files, and unrelated changes. Resolve failing checks before shipping; document pre-existing failures separately.

## SHIP

Use atomic Conventional Commits, for example `docs: define development workflow`. Show the staged scope and obtain approval before each commit. Obtain explicit approval before push, merge, deployment, or opening a pull request. Include the OpenSpec reference, verification evidence, known limitations, and rollback plan in the PR.

## Change types

### Feature

Define the user outcome and acceptance scenarios in OpenSpec. Build thin vertical slices and test rendering, interactions, navigation effects, and store/query calls.

### Bug fix

Reproduce the defect with a regression-first test. Fix the smallest root cause, then run the full verification gates and document the before/after behavior.

### Refactor

Add characterization tests for existing behavior before changing structure. Preserve public behavior, avoid unrelated cleanup, and compare the complete diff for accidental changes.

## Skill resolution

1. Identify the task phase and risk.
2. Select the smallest relevant set of project or portable skills.
3. Read each exact `SKILL.md` before work.
4. Apply `AGENTS.md` and OpenSpec when generic advice conflicts.

Do not use environment-specific registries as a source of truth. Skills are versioned in `.agents/skills/` and recorded in `skills-lock.json`.

## Approvals and rollback

Approval is required before implementation after the proposal/design/tasks review, before every commit, and before push, merge, deployment, or PR. Stop on ambiguity, failing tests, or high-risk irreversible work. Prefer reversible changes, feature flags where appropriate, and documented rollback steps for migrations, dependency updates, and CI changes.
