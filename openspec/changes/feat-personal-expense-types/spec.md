# Spec: Personal expense type UI

## Goal
Add a front-end-only expense type experience for personal expenses.

## Requirements
- In the add-personal-transaction flow, show a `Tipo de Gasto` selector only when the transaction tab is `GASTOS`.
- The selector must offer `Variable` and `Fijo`.
- The selected expense type is local UI state only; do not change backend payloads or schema contracts yet.
- In the personal-transactions list, show expense filters `Todos`, `Fijos`, `Variables` only for the expense tab.
- Expense cards must display a type badge (`VARIABLE` or `FIJO`).
- The income tab must remain unchanged.
- Existing API requests/responses must stay compatible.

## Acceptance criteria
- The expense selector renders in the add flow and defaults to `Variable`.
- Tapping `Fijo` updates the selected state.
- Expense filters render and change the visible expense list.
- Expense cards show the type badge.
- Income views do not show the new expense-only controls.
