# Proposal: feat-reset-password

## Objective

Implementar el flujo completo de recuperación y restablecimiento de contraseña en la app móvil, conectado al backend y manteniendo el lenguaje visual actual de Cuentas Claras.

## Scope

### In scope

- Agregar el enlace `¿Olvidaste tu contraseña?` en la pestaña de login.
- Crear la pantalla `ForgotPassword` para ingresar el correo electrónico.
- Crear la pantalla `ResetPassword` para ingresar y confirmar la nueva contraseña.
- Registrar ambas pantallas en la navegación de autenticación.
- Implementar validaciones, llamadas al backend y estados de formulario.
- Leer el token desde los deep links HTTPS `/verify-email?token=TOKEN` y `/reset-password?token=TOKEN`.
- Configurar Android App Links para `cuentas-claras-app.com`, conservando `cuentasclaras://` como fallback.
- Integrar verificación de email y recuperación de contraseña contra la API existente.
- Limpiar la sesión local y volver al login tras un reset exitoso.
- Cubrir navegación, renderizado e interacciones principales con tests.

### Out of scope

- Modificar el backend, la expiración de tokens o su consumo.
- Persistir contraseñas o tokens en el dispositivo.

## Success criteria

- Desde Login se puede abrir la pantalla de recuperación mediante el enlace visible.
- La pantalla de recuperación respeta la referencia visual: encabezado, tarjeta, email, CTA y retorno a login.
- La pantalla de nueva contraseña respeta la referencia visual: icono, dos campos, visibilidad de contraseña, regla mínima y CTA.
- Los formularios validan datos y llaman a los endpoints de recuperación/reset.
- Los errores de token inválido, vencido y consumido se muestran en la pantalla.
- `pnpm verify` y `pnpm dlx expo-doctor` pasan.

## Acceptance scenarios

### Scenario: abrir recuperación desde login

- Given la pestaña de login visible
- When el usuario toca `¿Olvidaste tu contraseña?`
- Then se muestra la pantalla `ForgotPassword`

### Scenario: validar email localmente

- Given la pantalla de recuperación
- When el usuario toca `Enviar enlace` con un email vacío o inválido
- Then se muestra un error de validación y no se realiza ninguna request

### Scenario: actualizar contraseña visualmente

- Given la pantalla `ResetPassword`
- When el usuario completa contraseña y confirmación válidas
- Then la UI permite continuar sin integrar backend

## Risks and rollback

- Risks: la navegación actual usa un stack centralizado y debe conservar el gating de autenticación; el reset real necesitará definir token/deep link posteriormente.
- Rollback: revertir los archivos del cambio y quitar las rutas nuevas del stack y del tipo de navegación.

## Open questions

- Para esta fase visual, ¿`Enviar enlace` debe llevar directamente a `ResetPassword` como flujo de demo, o solo mostrar un estado de enlace enviado hasta que exista el deep link real?
