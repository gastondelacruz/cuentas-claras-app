# Design: feat-reset-password

## Context

La autenticación vive en `src/features/auth/` y usa un `NativeStackNavigator` central en `src/app/navigation/`. `AuthScreen` combina login y registro y usa NativeWind con los tokens visuales existentes: fondo `#f0f0f3`, tarjetas blancas, verde de acción `#006d37`, bordes suaves y `AppTopBar`.

Las referencias recibidas muestran dos pantallas independientes, con barra superior de Cuentas Claras, tarjeta blanca, tipografía oscura, CTA verde y footer legal. La implementación conecta la UI existente con los endpoints de recuperación definidos por producto.

## Proposed approach

- Extraer el comportamiento de cada formulario a hooks de auth, manteniendo las pantallas enfocadas en renderizado.
- Añadir `ForgotPasswordScreen` y `ResetPasswordScreen` bajo `src/features/auth/screens/`.
- Añadir schemas locales con Zod para email, contraseña y confirmación.
- Registrar rutas públicas `ForgotPassword` y `ResetPassword` en `RootStackParamList`, `AuthStack` y `RootNavigator`.
- Añadir el enlace en `AuthScreen` usando la navegación existente.
- Reutilizar `AppTopBar`, `KeyboardAwareScrollView`, colores y patrones de inputs/CTA existentes.
- Implementar `forgotPassword` y `resetPassword` en `authApi.ts`, aceptando respuestas 204.
- Extraer códigos de error de token desde los envelopes de error conocidos.
- Limpiar SecureStore, Zustand y React Query tras reset exitoso y navegar al login.

## Android App Links

- `app.json` conserva `android.package` como `com.cuentasclaras.app` y el scheme `cuentasclaras` existente.
- Se agregan dos `android.intentFilters` con `autoVerify` para `https://cuentas-claras-app.com/verify-email` y `https://cuentas-claras-app.com/reset-password`.
- `src/app/navigation/linking.ts` admite el dominio HTTPS además del scheme custom y mantiene el mapeo de `token` a ambas rutas.
- El dominio debe publicar `/.well-known/assetlinks.json` con el fingerprint real del certificado que firma la APK. La plantilla y el procedimiento están en `docs/deployment/`.

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

Se agregan los callers HTTP para `/auth/password/forgot` y `/auth/password/reset`; el cliente ya aplica el prefijo `/api/v1`. `ResetPassword` recibe `token` como query param mediante el linking config.

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
- E2E: N/A; se cubre la navegación HTTPS, tokens faltantes, respuestas de API inválidas, éxito y errores de conexión con tests de componentes/API.
- Verification: `pnpm verify`, `pnpm dlx expo-doctor`.

## Security, performance, and rollback

- Security: no guardar ni enviar contraseñas; no agregar secretos ni endpoints.
- Performance: pantallas pequeñas, sin dependencias nuevas ni requests.
- Rollback: revertir el cambio completo y retirar las dos rutas.

## Approved decisions

- El backend responde 204 para ambas operaciones exitosas.
- El mensaje de forgot es genérico para no revelar si el email existe.
- El reset exitoso limpia la sesión y vuelve al login con aviso de iniciar sesión nuevamente.
