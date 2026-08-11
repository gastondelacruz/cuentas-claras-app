# Design: feat-reset-password

## Context

La autenticación vive en `src/features/auth/` y usa un `NativeStackNavigator` central en `src/app/navigation/`. `AuthScreen` combina login y registro y usa NativeWind con los tokens visuales existentes: fondo `#f0f0f3`, tarjetas blancas, verde de acción `#006d37`, bordes suaves y `AppTopBar`.

Las referencias recibidas muestran dos pantallas independientes, con barra superior de Cuentas Claras, tarjeta blanca, tipografía oscura, CTA verde y footer legal. La primera fase queda explícitamente limitada al front.

## Proposed approach

- Extraer el comportamiento de cada formulario a hooks de auth, manteniendo las pantallas enfocadas en renderizado.
- Añadir `ForgotPasswordScreen` y `ResetPasswordScreen` bajo `src/features/auth/screens/`.
- Añadir schemas locales con Zod para email, contraseña y confirmación.
- Registrar rutas públicas `ForgotPassword` y `ResetPassword` en `RootStackParamList`, `AuthStack` y `RootNavigator`.
- Añadir el enlace en `AuthScreen` usando la navegación existente.
- Reutilizar `AppTopBar`, `KeyboardAwareScrollView`, colores y patrones de inputs/CTA existentes.
- Dejar callbacks de submit locales y sin API; el comportamiento final del enlace/submit se decidirá antes de implementar.

## Architecture and file placement

- `src/features/auth/screens/ForgotPasswordScreen.tsx` — pantalla de ingreso de email.
- `src/features/auth/screens/ResetPasswordScreen.tsx` — pantalla de nueva contraseña.
- `src/features/auth/hooks/useForgotPasswordForm.ts` — estado, validación y submit local.
- `src/features/auth/hooks/useResetPasswordForm.ts` — estado, validación, visibilidad y submit local.
- `src/features/auth/schemas/forgotPasswordSchema.ts` — schema de email.
- `src/features/auth/schemas/resetPasswordSchema.ts` — schema de contraseña/confirmación.
- `src/app/navigation/types.ts` — tipos de rutas nuevas.
- `src/app/navigation/AuthStack.tsx` — registro del stack público.
- `src/app/navigation/RootNavigator.tsx` — registro en el navegador raíz.
- `src/features/auth/screens/AuthScreen.tsx` — enlace de recuperación.
- `src/features/auth/**/__tests__/` — tests de pantallas, hooks y schemas.

## Contracts and data flow

No se agrega contrato HTTP en esta fase. Los submits solo validan estado local y dejan preparada la superficie para conectar posteriormente con Swagger/API. `ResetPassword` podrá recibir un token opcional en la ruta cuando se defina el deep link.

## Alternatives considered

### Integrar backend ahora

- Pros: flujo completo de extremo a extremo.
- Cons: contradice el alcance solicitado y bloquearía la aprobación visual.
- Decision: descartado para esta fase.

### Crear screens dentro de `src/app/`

- Pros: rutas visibles junto a navegación.
- Cons: viola la arquitectura por dominio existente.
- Decision: descartado; las pantallas viven en `features/auth/screens/` y solo se registran en `app/navigation/`.

## Testing strategy

- Unit/integration: schemas y hooks; render, validaciones, toggles de visibilidad y acciones de navegación de ambas pantallas.
- E2E: N/A en esta fase; se hará revisión manual en Expo Go y se cubrirá la navegación con tests de componentes.
- Verification: `pnpm verify`, `pnpm dlx expo-doctor`.

## Security, performance, and rollback

- Security: no guardar ni enviar contraseñas; no agregar secretos ni endpoints.
- Performance: pantallas pequeñas, sin dependencias nuevas ni requests.
- Rollback: revertir el cambio completo y retirar las dos rutas.

## Approved decisions

- Usuario aprobó implementar el alcance front-only y el plan.
- `Enviar enlace` mostrará un estado local de enlace enviado; no navegará a ResetPassword hasta existir el deep link real.
