# Bugfix Requirements Document

## Introduction

Este documento agrupa cinco bugs detectados en la aplicación "Cuentas Claras" (React Native Expo, gestión de gastos compartidos). Los defectos afectan: la sección de actividad reciente (vacía permanentemente), el cierre de sesión (sin efecto), la imagen de perfil (funcionalidad no disponible aún), la pantalla de detalle al crear un grupo nuevo (muestra error falso) y la tarjeta "Debes" (no siempre muestra el color rojo requerido).

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 — Actividad reciente siempre vacía**

1.1 CUANDO el usuario tiene grupos activos con gastos registrados ENTONCES la sección "Actividad reciente" en la pantalla de inicio muestra una lista vacía.

1.2 CUANDO `useHomeData` construye los datos del dashboard ENTONCES `recentActivity` siempre es un array vacío hardcodeado, ignorando los gastos reales de los grupos.

**Bug 2 — Cerrar sesión no tiene efecto**

1.3 CUANDO el usuario presiona "Cerrar Sesión" en la pantalla de perfil ENTONCES no ocurre ninguna acción: no se limpia la sesión, no se navega y no se invoca ninguna función.

1.4 CUANDO el componente `ProfileScreen` renderiza el botón de cerrar sesión ENTONCES el `Pressable` no tiene prop `onPress` conectada a ningún handler.

**Bug 3 — Imagen de perfil no debe mostrarse**

1.5 CUANDO se renderiza la pantalla de perfil ENTONCES el sistema muestra una imagen de perfil con una URL hardcodeada y un botón de edición, exponiendo una funcionalidad aún no implementada.

1.6 CUANDO la funcionalidad de imagen de perfil no está implementada ENTONCES el sistema igual muestra el componente `Image` y el botón "Editar foto de perfil".

**Bug 4 — Error falso "Este grupo ya no está disponible" al crear un grupo**

1.7 CUANDO el usuario crea un nuevo grupo exitosamente ENTONCES el sistema navega a `GroupDetailScreen` antes de que los datos del nuevo grupo estén disponibles en caché, y la pantalla muestra "Este grupo ya no está disponible".

1.8 CUANDO `GroupDetailScreen` renderiza con `group === null` y `isLoading === false` ENTONCES el sistema muestra el mensaje de error aunque los datos del grupo recién creado aún estén siendo cargados.

**Bug 5 — Tarjeta "Debes" no siempre se muestra en rojo**

1.9 CUANDO el balance del usuario es exactamente 0 ENTONCES la tarjeta "Debes" en `SummaryCards` usa el tono `success` (verde) porque la condición `item.amount >= 0` resulta verdadera para `youOwe === 0`.

1.10 CUANDO `SummaryCards` evalúa el tono del chip de la tarjeta "Debes" ENTONCES usa la condición `item.amount >= 0`, que devuelve `success` cuando `youOwe === 0`, en lugar de mostrar siempre el color rojo.

### Expected Behavior (Correct)

**Bug 1 — Actividad reciente**

2.1 CUANDO el usuario tiene grupos activos con gastos registrados ENTONCES el sistema SHALL mostrar los gastos recientes de esos grupos en la sección "Actividad reciente".

2.2 CUANDO `useHomeData` construye los datos del dashboard ENTONCES el sistema SHALL derivar `recentActivity` a partir de los gastos reales de los grupos del usuario, ordenados por fecha descendente.

**Bug 2 — Cerrar sesión**

2.3 CUANDO el usuario presiona "Cerrar Sesión" ENTONCES el sistema SHALL invocar la mutación de logout (`useLogout`), limpiar la sesión del store de autenticación y redirigir al usuario a la pantalla de autenticación.

2.4 CUANDO el logout está en progreso ENTONCES el sistema SHALL deshabilitar el botón de cerrar sesión para evitar invocaciones múltiples.

**Bug 3 — Imagen de perfil**

2.5 CUANDO se renderiza la pantalla de perfil ENTONCES el sistema SHALL mostrar un avatar con las iniciales del usuario en lugar de una imagen de perfil.

2.6 CUANDO se renderiza la tarjeta de perfil ENTONCES el sistema SHALL NO mostrar el botón "Editar foto de perfil" hasta que la funcionalidad de subida de imágenes esté implementada.

**Bug 4 — Error falso al crear grupo**

2.7 CUANDO el usuario crea un nuevo grupo exitosamente y es redirigido a `GroupDetailScreen` ENTONCES el sistema SHALL mostrar el indicador de carga mientras los datos del nuevo grupo se obtienen de la API.

2.8 CUANDO `GroupDetailScreen` recibe un `groupId` válido y los datos aún están cargando ENTONCES el sistema SHALL mostrar el estado de carga en lugar del mensaje de error "Este grupo ya no está disponible".

**Bug 5 — Tarjeta "Debes" siempre en rojo**

2.9 CUANDO se renderiza la tarjeta "Debes" en `SummaryCards` ENTONCES el sistema SHALL mostrar siempre el tono `debt` (rojo) en el chip, independientemente de si el valor es 0 o mayor.

2.10 CUANDO `youOwe === 0` ENTONCES la tarjeta "Debes" SHALL mostrar `$0,00` con color rojo, sin cambiar al tono verde.

### Unchanged Behavior (Regression Prevention)

**Bug 1 — Actividad reciente**

3.1 CUANDO el usuario no tiene ningún grupo activo ENTONCES el sistema SHALL CONTINUE TO mostrar la vista vacía (`HomeEmptyView`) sin la sección de actividad.

3.2 CUANDO los datos están cargando ENTONCES el sistema SHALL CONTINUE TO mostrar el indicador de carga (`HomeLoadingView`).

3.3 CUANDO ocurre un error al cargar los grupos ENTONCES el sistema SHALL CONTINUE TO mostrar la vista de error (`HomeErrorView`).

**Bug 2 — Cerrar sesión**

3.4 CUANDO el usuario navega a la pantalla de perfil ENTONCES el sistema SHALL CONTINUE TO mostrar correctamente los datos del usuario, el resumen financiero y la versión de la aplicación.

3.5 CUANDO el logout falla por un error de red ENTONCES el sistema SHALL CONTINUE TO mantener al usuario autenticado en la pantalla de perfil.

**Bug 3 — Imagen de perfil**

3.6 CUANDO se renderiza la pantalla de perfil ENTONCES el sistema SHALL CONTINUE TO mostrar el nombre y email del usuario.

3.7 CUANDO se renderiza la pantalla de perfil ENTONCES el sistema SHALL CONTINUE TO mostrar el estado de verificación del usuario.

**Bug 4 — Error falso al crear grupo**

3.8 CUANDO se intenta acceder a un grupo que realmente fue eliminado o no existe en la API ENTONCES el sistema SHALL CONTINUE TO mostrar el mensaje "Este grupo ya no está disponible".

3.9 CUANDO el usuario abre un grupo existente con datos ya en caché ENTONCES el sistema SHALL CONTINUE TO mostrar los detalles del grupo sin pasar innecesariamente por el estado de carga.

**Bug 5 — Tarjeta "Debes" siempre en rojo**

3.10 CUANDO se renderiza la tarjeta "Te deben" (`owedToUser`) ENTONCES el sistema SHALL CONTINUE TO usar el tono `success` (verde) cuando el valor es 0 o positivo, y `debt` (rojo) cuando es negativo.

3.11 CUANDO `owedToUser.amount > 0` ENTONCES el sistema SHALL CONTINUE TO mostrar la tarjeta "Te deben" con tono `success`.
