# Implementation Plan: Password recovery backend integration

## Overview

Conectar las pantallas existentes de recuperación y restablecimiento de contraseña con los endpoints indicados, soportando token por deep link, validación, errores de token y limpieza de sesión.

## Architecture decisions

- Mantener llamadas HTTP en `features/auth/api/authApi.ts` y estado/efectos en hooks, dejando las pantallas como vista.
- Usar React Query mutations para ambas operaciones.
- El token será parámetro opcional de `ResetPassword`; la configuración de linking mapeará `/reset-password?token=...`.
- El reset exitoso limpia SecureStore, Zustand y QueryClient antes de volver a Login.

## Tasks

1. Agregar tests RED para API, hooks y deep-link/token behavior.
2. Implementar llamadas API y error-code extraction.
3. Conectar `useForgotPasswordForm` con mutation y mensaje genérico 204.
4. Conectar `useResetPasswordForm` con token, mutation, errores y cleanup/navigation.
5. Actualizar rutas/linking y pantallas; ejecutar verificación completa.

## Risks

- `swagger-spec.json` no contiene actualmente estos dos endpoints; se implementa contra el contrato explícito del requerimiento y se deja constancia.
- La forma exacta del envelope de error puede variar; se extrae `code` desde `response.data.code`, `response.data.error.code` o `response.data.data.code`.
