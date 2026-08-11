# Tasks: feat-reset-password

Tasks are completed test-first where behavior changes. Keep each task small enough to review and revert independently.

## Task 1: Definir contratos locales de formularios

- [x] Acceptance: schemas de email y nueva contraseña expresan las reglas visibles de las referencias.
- [ ] Test first: tests unitarios para email inválido, contraseña mínima y confirmación distinta.
- [ ] Implementation: `src/features/auth/schemas/forgotPasswordSchema.ts`, `resetPasswordSchema.ts` y tests.
- [ ] Verify: tests focalizados y typecheck.
- Dependencies: None

## Task 2: Crear pantalla de recuperación

- [x] Acceptance: renderiza tarjeta, email, CTA, retorno a login y validación local.
- [ ] Test first: render, submit inválido y acción de retorno.
- [ ] Implementation: hook, screen y tests de `ForgotPassword`.
- [ ] Verify: tests focalizados y typecheck.
- Dependencies: Task 1

## Task 3: Crear pantalla de nueva contraseña

- [x] Acceptance: renderiza dos campos, toggle de visibilidad, regla mínima, CTA y validación local.
- [ ] Test first: render, toggle, confirmación inválida y submit válido local.
- [ ] Implementation: hook, screen y tests de `ResetPassword`.
- [ ] Verify: tests focalizados y typecheck.
- Dependencies: Task 1

## Task 4: Conectar navegación y enlace del login

- [x] Acceptance: enlace de Login abre recuperación y las rutas públicas se registran correctamente.
- [ ] Test first: test de enlace y tests de registro de rutas/navegación.
- [ ] Implementation: `AuthScreen`, `types.ts`, `AuthStack.tsx`, `RootNavigator.tsx`.
- [ ] Verify: `pnpm verify` y `pnpm dlx expo-doctor`.
- Dependencies: Tasks 2-3

## Checkpoints

- [ ] Después de Tasks 1-3: tests focalizados y typecheck pasan; revisión visual en Expo Go.
- [ ] Antes de review: aprobación explícita de las pantallas y definición del comportamiento de submit.
- [ ] Antes de integración backend: contrato Swagger, token/deep link y endpoints aprobados.
