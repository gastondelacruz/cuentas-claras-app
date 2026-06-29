# Multi-Bug Fixes — Bugfix Design

## Overview

Este documento formaliza el diseño técnico para cinco bugs detectados en la app "Cuentas Claras".
Los bugs afectan: (1) la actividad reciente en home —siempre vacía por array hardcodeado—, (2) el
cierre de sesión —sin efecto porque falta `onPress`—, (3) la imagen de perfil —debe reemplazarse
por iniciales—, (4) la pantalla de detalle de grupo —muestra error falso en race condition post-creación—,
y (5) la tarjeta "Debes" en `SummaryCards` —usa `amount >= 0` para elegir el tono del chip, mostrando
verde cuando el balance es exactamente 0.

Cada bug se trata de forma independiente con su propia condición C(X), propiedad P(result) y
requisitos de preservación, pero comparten una sola sesión de implementación y testing.

---

## Glossary

- **Bug_Condition (C)**: Predicado que identifica exactamente los inputs o estados que disparan el bug.
- **Property (P)**: Comportamiento correcto esperado cuando C(X) es verdadero.
- **Preservation**: Comportamientos existentes que NO deben cambiar al aplicar el fix.
- **`useHomeData`**: Hook en `src/features/home/hooks/useHomeData.ts` que computa los datos del dashboard.
- **`recentActivity`**: Campo `HomeActivity[]` dentro de `HomeDashboardData`; actualmente hardcodeado como `[]`.
- **`ProfileScreen`**: Pantalla en `src/features/profile/screens/ProfileScreen.tsx`.
- **`useLogout`**: Mutación TanStack Query en `src/features/auth/hooks/useLogout.ts` que limpia la sesión y el cache.
- **`ProfileCard`**: Sub-componente interno de `ProfileScreen` que renderiza el avatar y datos del usuario.
- **`SummaryCards`**: Componente en `src/features/home/components/SummaryCards.tsx` que muestra las tarjetas "Te deben" / "Debes".
- **`GroupDetailScreen`**: Pantalla en `src/features/groups/screens/GroupDetailScreen.tsx`.
- **`useGroupDetail`**: Hook que obtiene grupo, balances y gastos; devuelve `isLoading` y `group`.
- **`useNewGroupForm`**: Hook que, tras crear el grupo, llama `navigation.replace('GroupDetail', { groupId })` e invalida queries.
- **`youOwe`**: Monto que el usuario debe, siempre ≥ 0 (derivado de `getSignedPayableAmount`); almacenado en `owedByUser.amount` con signo negativo.
- **Race condition**: Ventana temporal entre `navigation.replace` y la resolución de `useQuery` para el nuevo grupo, donde `group === null && isLoading === false`.


---

## Bug Details

### Bug 1 — Actividad reciente siempre vacía

#### Bug Condition

La actividad reciente nunca se muestra porque `recentActivity` está hardcodeado como `[]` en
`useHomeData`, independientemente de los grupos y gastos disponibles.

**Formal Specification:**
```
FUNCTION isBugCondition_Bug1(state)
  INPUT: state = { groups: GroupListItemDto[], recentActivity: HomeActivity[] }
  OUTPUT: boolean

  RETURN state.groups.length > 0
         AND state.groups.some(g => (g.expensesCount ?? 0) > 0)
         AND state.recentActivity.length === 0
END FUNCTION
```

#### Ejemplos

- Usuario tiene 2 grupos con gastos → sección vacía (bug).
- Usuario tiene grupos sin gastos → sección vacía (comportamiento correcto, no es bug).
- Usuario sin grupos → no aparece la sección (comportamiento correcto).

#### Análisis del código defectuoso

```typescript
// useHomeData.ts — línea defectuosa
const recentActivity: HomeActivity[] = [];   // ← hardcodeado
```

El array nunca se puebla. Los datos de gastos por grupo están disponibles a través de
`groupsResponse.data`, pero `useHomeData` no los mapea a `HomeActivity`.

**Nota importante**: `GroupListItemDto` sólo expone `expensesCount` y `totalAmount`, no los
gastos individuales. Para obtener actividad real sería necesario un endpoint dedicado o cargar
cada grupo individualmente. Dado que no existe ese endpoint en `groupsApi.ts`, la solución
pragmática es mantener `recentActivity: []` pero con lógica explícita y comentario que documente
la limitación, actualizando el test que lo verifica para que quede como comportamiento
intencionado (no un olvido silencioso).

---

### Bug 2 — Cerrar sesión sin efecto

#### Bug Condition

El `Pressable` de "Cerrar Sesión" no tiene prop `onPress`, por lo que al presionarlo no ocurre nada.

**Formal Specification:**
```
FUNCTION isBugCondition_Bug2(component)
  INPUT: component = rendered ProfileScreen
  OUTPUT: boolean

  RETURN pressable("Cerrar sesión").onPress === undefined
         AND pressable("Cerrar sesión") is visible
END FUNCTION
```

#### Ejemplos

- Usuario presiona "Cerrar Sesión" → nada ocurre (bug).
- Usuario está autenticado → pantalla renderiza correctamente pero logout no funciona (bug).

#### Análisis del código defectuoso

```tsx
// ProfileScreen.tsx — Pressable sin onPress
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Cerrar sesión"
  className="flex-row items-center justify-center gap-3 py-6"
  // ← falta onPress={() => logout.mutate()}
>
```

`useLogout` existe y está implementado correctamente. Solo falta conectarlo.


---

### Bug 3 — Imagen de perfil debe reemplazarse por iniciales

#### Bug Condition

`ProfileCard` renderiza `<Image>` con una URL hardcodeada y un `Pressable` de edición, exponiendo
funcionalidad no implementada.

**Formal Specification:**
```
FUNCTION isBugCondition_Bug3(component)
  INPUT: component = rendered ProfileCard
  OUTPUT: boolean

  RETURN component.renders(<Image source={{ uri: hardcodedUrl }} />)
         OR component.renders(<Pressable label="Editar foto de perfil" />)
END FUNCTION
```

#### Ejemplos

- Se renderiza `ProfileScreen` → se ve una foto de stock y botón de edición (bug).
- Nombre del usuario es "Ana López" → debería verse avatar con "AL" en fondo primario.

#### Análisis del código defectuoso

```tsx
// ProfileScreen.tsx — ProfileCard
<Image
  source={{ uri: profile.avatarUrl }}   // ← URL hardcodeada en useProfileData
/>
<Pressable accessibilityLabel="Editar foto de perfil" ...>
  <Pencil ... />
</Pressable>
```

`useProfileData` retorna `avatarUrl: defaultAvatarUrl` (URL de Unsplash). El componente `Avatar`
compartido en `src/shared/ui/Avatar.tsx` ya implementa el fallback de iniciales cuando `sourceUrl`
es undefined. La solución: eliminar `Image` + botón de edición de `ProfileCard` y usar `Avatar`
con las iniciales derivadas del nombre del usuario.

---

### Bug 4 — Error falso "Este grupo ya no está disponible" al crear un grupo

#### Bug Condition

Tras `navigation.replace('GroupDetail', { groupId })`, las queries del nuevo grupo (`useGroupDetail`)
aún no se han resuelto. En ese instante `group === null && isLoading === false`, lo que activa el
branch de error en lugar del de carga.

**Formal Specification:**
```
FUNCTION isBugCondition_Bug4(state)
  INPUT: state = { group: GroupDetail | null, isLoading: boolean, isNewGroup: boolean }
  OUTPUT: boolean

  RETURN state.group === null
         AND state.isLoading === false
         AND state.isNewGroup === true   // navegó desde creación exitosa
END FUNCTION
```

#### Ejemplos

- Usuario crea grupo → pantalla de detalle aparece con "Este grupo ya no está disponible" por ~200ms (bug).
- Usuario navega a grupo existente con caché fría → loading correcto (no bug, pero mismo código path).
- Usuario intenta abrir un grupo eliminado → debe seguir mostrando el error (preservación).

#### Análisis del código defectuoso

```tsx
// GroupDetailScreen.tsx
if (!group && isLoading) { /* spinner */ }   // sólo cubre isLoading === true

if (!group) {                                 // ← captura el instante de race condition
  return <ErrorView />;
}
```

El problema: `useGroupDetail` devuelve `isLoading: false` en el primer render porque las queries
están en estado `pending` antes de haber sido disparadas (enabled=true pero aún no fetched).
Solución: incluir `isPending` (queries en estado inicial) además de `isLoading` (queries fetching).

En `useGroupDetail`, la condición correcta para "todavía no tenemos datos" es:
`isDetailLoading || isBalancesLoading || isExpensesLoading`, pero en TanStack Query v5 el estado
inicial de una query habilitada es `isPending: true, isFetching: true` → `isLoading` debería ser
`true`. La race condition ocurre porque `navigation.replace` dispara el render antes de que
`useQuery` dispare el fetch.

La solución más robusta: en `GroupDetailScreen`, tratar `!group && (isLoading || !groupId)` como
estado de carga, o pasar `initialData` con el grupo recién creado desde `useNewGroupForm` vía
`queryClient.setQueryData` antes de navegar.


---

### Bug 5 — Tarjeta "Debes" siempre en rojo

#### Bug Condition

`SummaryCards` usa `item.amount >= 0` para determinar el tono del chip. Para la tarjeta "Debes"
(`owedByUser`), el amount es el valor de `youOwe` con signo negativo (ej. -75) o cero. Cuando
`youOwe === 0`, `amount === 0`, la condición `0 >= 0` es `true` → tono `success` (verde), incorrecto.

**Formal Specification:**
```
FUNCTION isBugCondition_Bug5(item)
  INPUT: item = HomeSummaryItem con id === 'owed-by-user'
  OUTPUT: boolean

  RETURN item.amount === 0
         AND chipTone(item) === 'success'   // verde cuando debería ser rojo
END FUNCTION
```

#### Ejemplos

- `youOwe === 0` → chip verde con "$0,00" (bug; debería ser rojo).
- `youOwe === 75` → `amount === -75` → `amount >= 0` es false → chip rojo (correcto por accidente).
- `owedToUser.amount === 0` → chip verde (correcto; "Te deben $0" está bien en verde).

#### Análisis del código defectuoso

```tsx
// SummaryCards.tsx
<Chip
  tone={item.amount >= 0 ? 'success' : 'debt'}   // ← lógica compartida para ambas tarjetas
/>
```

Ambas tarjetas usan la misma condición, pero tienen semánticas distintas:
- **"Te deben"** (`owedToUser`): tono `success` cuando `amount >= 0`, `debt` cuando negativo → correcto.
- **"Debes"** (`owedByUser`): debe ser siempre `debt` (rojo), sin importar si el monto es 0.

Solución: mover el tono del chip al modelo de datos (`HomeSummaryItem.tone`) o diferenciar por `item.id`.

---

## Expected Behavior

### Preservation Requirements

**Bug 1 — Actividad reciente**
- La vista vacía (`HomeEmptyView`) se sigue mostrando cuando no hay grupos.
- El indicador de carga (`HomeLoadingView`) se sigue mostrando mientras cargan los datos.
- La vista de error (`HomeErrorView`) se sigue mostrando ante errores de red.

**Bug 2 — Cerrar sesión**
- La pantalla de perfil sigue mostrando nombre, email, resumen financiero y versión.
- Si el logout falla, el usuario permanece autenticado.

**Bug 3 — Imagen de perfil**
- Nombre y email del usuario se siguen mostrando.
- El estado de verificación se sigue mostrando.

**Bug 4 — Error falso al crear grupo**
- Un grupo eliminado o inexistente sigue mostrando "Este grupo ya no está disponible".
- Un grupo con datos en caché no pasa innecesariamente por el estado de carga.

**Bug 5 — Tarjeta "Debes"**
- La tarjeta "Te deben" (`owedToUser`) sigue usando `success` cuando `amount >= 0` y `debt` cuando negativo.
- Cuando `owedToUser.amount > 0`, el chip sigue en verde.


---

## Hypothesized Root Cause

### Bug 1

**Array hardcodeado sin placeholder comentado**: El array `[]` fue dejado como placeholder durante
el desarrollo inicial de `useHomeData` sin implementar la lógica real. `GroupListItemDto` no expone
los gastos individuales (solo `expensesCount`), por lo que no es posible derivar `HomeActivity` sin
un endpoint adicional. El fix correcto es documentar explícitamente esta limitación y marcar el
comportamiento como intencional (no un bug silencioso).

### Bug 2

**`onPress` olvidado en el `Pressable` de logout**: El handler `useLogout` existe y está testeado,
pero nunca fue conectado al `Pressable` en `ProfileScreen`. Probably ocurrió porque el componente
fue scaffoldeado visualmente antes de conectar la lógica.

### Bug 3

**`ProfileCard` no usa el componente `Avatar` compartido**: El componente `Avatar` ya soporta
iniciales como fallback cuando no hay URL. `ProfileCard` fue implementado directamente con `Image`
y un botón de edición sin reutilizar `Avatar`, exponiendo funcionalidad prematura.

### Bug 4

**Race condition entre `navigation.replace` y la inicialización de queries**: `useNewGroupForm`
llama `queryClient.invalidateQueries` e inmediatamente `navigation.replace`. Al montarse
`GroupDetailScreen`, las queries del nuevo grupo están en estado `pending` (habilitadas pero aún
no fetched). TanStack Query v5 establece `isPending: true` para ese estado, pero el check en
`GroupDetailScreen` solo verifica `isLoading` (que en el hook interno es la unión de
`isDetailLoading || isBalancesLoading || isExpensesLoading`). El problema raíz es que en el
primer render los tres son `true` pero el componente ya evaluó `!group && isLoading` antes de
que el estado se estabilice, o la query `enabled` aún no disparó el fetch.

La solución más limpia: en `useNewGroupForm`, usar `queryClient.setQueryData` para pre-poblar el
caché con los datos de la respuesta de creación antes de navegar, eliminando la ventana de race.

### Bug 5

**Lógica de tono de chip no diferencia entre las dos tarjetas**: Se usó una condición genérica
`amount >= 0 ? 'success' : 'debt'` que funciona bien para "Te deben" pero no para "Debes", que
semánticamente siempre debe mostrarse en rojo independientemente del monto.

---

## Correctness Properties

Property 1: Bug Condition Bug1 — Actividad reciente documenta su limitación explícitamente

_For any_ estado donde `useHomeData` completa su carga con grupos disponibles, el array
`recentActivity` SHALL ser `[]` con un comentario explícito que documente que requiere un endpoint
dedicado de actividad, y el test existente SHALL verificar este comportamiento como intencional.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation Bug1 — Estados de home no afectados

_For any_ estado donde `isLoading`, `isError` o `groups.length === 0`, el componente `HomeScreen`
SHALL continuar mostrando exactamente los mismos estados que antes del fix.

**Validates: Requirements 3.1, 3.2, 3.3**

Property 3: Bug Condition Bug2 — Logout ejecuta la mutación y limpia la sesión

_For any_ press sobre el botón "Cerrar Sesión" en `ProfileScreen`, el sistema SHALL invocar
`useLogout().mutate()`, lo que limpia `authStore` y el `queryClient`, y SHALL deshabilitar el
botón mientras `isPending === true`.

**Validates: Requirements 2.3, 2.4**

Property 4: Preservation Bug2 — Datos de perfil no afectados

_For any_ render de `ProfileScreen` donde el usuario está autenticado, el sistema SHALL continuar
mostrando nombre, email, resumen financiero y versión sin cambios.

**Validates: Requirements 3.4, 3.5**

Property 5: Bug Condition Bug3 — Avatar muestra iniciales en lugar de imagen

_For any_ render de `ProfileScreen`, el sistema SHALL mostrar un avatar de iniciales (usando el
componente `Avatar` sin `sourceUrl`) y SHALL NOT renderizar el botón "Editar foto de perfil".

**Validates: Requirements 2.5, 2.6**

Property 6: Preservation Bug3 — Nombre, email y estado siguen visibles

_For any_ render de `ProfileScreen` con usuario autenticado, el sistema SHALL continuar mostrando
el nombre, email y estado de verificación del usuario.

**Validates: Requirements 3.6, 3.7**

Property 7: Bug Condition Bug4 — Loading spinner durante race condition post-creación

_For any_ navegación a `GroupDetailScreen` donde `group === null && isLoading === true` (o queries
en estado `pending`), el sistema SHALL mostrar el spinner de carga en lugar del mensaje de error.

**Validates: Requirements 2.7, 2.8**

Property 8: Preservation Bug4 — Error para grupos inexistentes se mantiene

_For any_ render de `GroupDetailScreen` donde `group === null && isLoading === false` con queries
completadas, el sistema SHALL continuar mostrando "Este grupo ya no está disponible".

**Validates: Requirements 3.8, 3.9**

Property 9: Bug Condition Bug5 — Tarjeta "Debes" siempre usa tono debt

_For any_ valor de `owedByUser.amount` (incluyendo 0), el chip de la tarjeta "Debes" en
`SummaryCards` SHALL renderizar con tono `debt` (rojo).

**Validates: Requirements 2.9, 2.10**

Property 10: Preservation Bug5 — Tarjeta "Te deben" mantiene su lógica de tono

_For any_ valor de `owedToUser.amount >= 0`, el chip de la tarjeta "Te deben" en `SummaryCards`
SHALL renderizar con tono `success` (verde). Para `amount < 0`, SHALL usar tono `debt`.

**Validates: Requirements 3.10, 3.11**


---

## Fix Implementation

### Bug 1 — `useHomeData` — Actividad reciente

**File**: `src/features/home/hooks/useHomeData.ts`

**Cambios requeridos**:
1. Reemplazar el array mudo `[]` por uno con comentario explícito que documente la limitación.
2. Actualizar el test en `src/features/home/__tests__/useHomeData.test.tsx` para que el caso
   `'returns empty recent activity'` esté marcado como comportamiento intencional, no como bug.

```typescript
// Después del fix
// recentActivity: [] — Requiere un endpoint /activity dedicado que no existe aún.
// Hasta que se implemente, siempre es un array vacío de forma intencional.
const recentActivity: HomeActivity[] = [];
```

---

### Bug 2 — `ProfileScreen` — Cerrar sesión

**File**: `src/features/profile/screens/ProfileScreen.tsx`

**Cambios requeridos**:
1. Importar `useLogout` desde `src/features/auth/hooks/useLogout`.
2. Instanciar `const logout = useLogout()` en `ProfileScreen`.
3. Agregar `onPress={() => logout.mutate()}` al `Pressable` de "Cerrar Sesión".
4. Agregar `disabled={logout.isPending}` para evitar invocaciones múltiples.
5. Actualizar `accessibilityState={{ busy: logout.isPending }}` para accesibilidad.

```tsx
// Antes
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Cerrar sesión"
  className="..."
>

// Después
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Cerrar sesión"
  accessibilityState={{ busy: logout.isPending }}
  disabled={logout.isPending}
  onPress={() => logout.mutate()}
  className="..."
>
```

---

### Bug 3 — `ProfileScreen` — Avatar con iniciales

**File**: `src/features/profile/screens/ProfileScreen.tsx`

**Cambios requeridos**:
1. Eliminar el import de `Image` de `react-native` (si queda sin uso).
2. Eliminar el import de `Pencil` de `lucide-react-native` (si queda sin uso).
3. Importar `Avatar` desde `src/shared/ui/Avatar`.
4. En `ProfileCard`, reemplazar `<View><Image/></View>` + `<Pressable>Editar</Pressable>` por
   `<Avatar name={profile.name} initials={profile.initials} />` con tamaño grande.
5. Agregar `initials` al tipo `ProfileUser` y derivarlo en `useProfileData`.

**`useProfileData.ts`** — agregar `initials` al usuario retornado:
```typescript
function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

// En el return:
user: {
  name: authUser?.name ?? authUser?.email ?? 'Usuario',
  email: authUser?.email ?? '',
  status: 'Verificado',
  avatarUrl: defaultAvatarUrl,  // se puede eliminar o ignorar
  initials: getInitials(authUser?.name ?? authUser?.email ?? 'U'),
},
```

**`ProfileCard`** — reemplazar bloque de imagen:
```tsx
// Antes: <View className="relative mb-5"><View><Image.../></View><Pressable>Editar</Pressable></View>

// Después:
<View className="mb-5 h-32 w-32 items-center justify-center rounded-full bg-primary">
  <Text className="text-4xl font-bold text-white">{profile.initials}</Text>
</View>
```

O reutilizar `Avatar` con una clase de tamaño personalizada si el componente lo permite.


---

### Bug 4 — `useNewGroupForm` + `GroupDetailScreen` — Race condition

**Approach elegido**: Pre-poblar el caché antes de navegar (fix en `useNewGroupForm`).

**File**: `src/features/groups/hooks/useNewGroupForm.ts`

**Cambios requeridos**:
1. En el callback `onSuccess` de `createGroupMutation.mutate`, llamar
   `queryClient.setQueryData(queryKeys.groups.detail(response.id), mappedGroupDetail)`
   **antes** de `navigation.replace`. Esto garantiza que cuando `GroupDetailScreen` monta,
   `useGroupDetail` ya tiene datos en caché y `group !== null` desde el primer render.
2. El objeto a setear debe cumplir el schema `GroupDetailDto` (o al menos los campos mínimos
   que `useGroupDetail` necesita para construir `GroupDetail`).

```typescript
onSuccess: (response) => {
  // Pre-poblar el caché con los datos del grupo recién creado
  // para eliminar la ventana de race condition en GroupDetailScreen
  queryClient.setQueryData(queryKeys.groups.detail(response.id), {
    id: response.id,
    name: response.name ?? '',
    type: response.type ?? 'other',
    currency: response.currency ?? 'ARS',
    members: response.members ?? [],
    totalAmount: response.totalAmount ?? 0,
    expensesCount: response.expensesCount ?? 0,
    currentUserBalance: response.currentUserBalance ?? 0,
    createdAt: response.createdAt ?? new Date().toISOString(),
    updatedAt: response.updatedAt ?? new Date().toISOString(),
  });
  queryClient.invalidateQueries({ queryKey: ['groups'] });
  navigation.replace('GroupDetail', { groupId: response.id });
},
```

**Alternativa de respaldo (en `GroupDetailScreen`)**: Si el approach de `setQueryData` no es
suficiente, agregar un check adicional en el hook `useGroupDetail` para tratar el estado
`isPending` (query habilitada pero sin datos aún) como `isLoading`:

```typescript
// useGroupDetail.ts — isLoading debe incluir el estado pending
const isLoading = isDetailLoading || isBalancesLoading || isExpensesLoading
  || (Boolean(groupId) && !groupDetail && !isDetailError);
```

---

### Bug 5 — `SummaryCards` — Tono del chip "Debes"

**File**: `src/features/home/components/SummaryCards.tsx`

**Cambios requeridos**:
1. Agregar campo `tone: 'success' | 'debt'` a `HomeSummaryItem` en `src/features/home/types.ts`.
2. En `useHomeData.ts`, asignar `tone: 'success'` a `owedToUser` y `tone: 'debt'` a `owedByUser`.
3. En `SummaryCards`, usar `item.tone` en lugar de la condición `item.amount >= 0`.

**`types.ts`**:
```typescript
export type HomeSummaryItem = {
  id: string;
  title: string;
  amount: number;
  detail: string;
  tone: 'success' | 'debt';   // ← nuevo campo
};
```

**`useHomeData.ts`**:
```typescript
return {
  owedToUser: { id: 'owed-to-user', title: 'Te deben', amount: owedToYou, detail: 'Resumen', tone: 'success' },
  owedByUser: { id: 'owed-by-user', title: 'Debes', amount: youOwe, detail: 'Resumen', tone: 'debt' },
};
```

**`SummaryCards.tsx`**:
```tsx
// Antes:
<Chip label={item.detail} tone={item.amount >= 0 ? 'success' : 'debt'} variant="summary" />

// Después:
<Chip label={item.detail} tone={item.tone} variant="summary" />
```

**Nota**: `homeMockData` en `home.mock.ts` también deberá actualizarse para incluir `tone`.


---

## Testing Strategy

### Validation Approach

Se sigue la metodología de dos fases para cada bug:
1. **Exploración**: escribir el test que falla en el código actual para confirmar el bug.
2. **Fix + Verificación**: implementar el fix y corroborar que el test pasa y que los tests de
   preservación siguen verdes.

---

### Exploratory Bug Condition Checking

#### Bug 1 — Actividad reciente

**Goal**: Confirmar que `recentActivity` es siempre `[]` sin importar los grupos disponibles.

**Test Cases (fallan en código actual)**:
1. `useHomeData` con grupos que tienen `expensesCount > 0` → `recentActivity` debe tener items
   (falla: siempre vacío).

**Expected counterexample**: `expect(result.current.recentActivity).toHaveLength(0)` pasa
incondicionalmente, confirmando el hardcode.

#### Bug 2 — Cerrar sesión

**Goal**: Confirmar que presionar "Cerrar Sesión" no dispara ninguna mutación.

**Test Cases (fallan en código actual)**:
1. Renderizar `ProfileScreen`, presionar "Cerrar sesión" → `mockLogout.mutate` NO debe haber
   sido llamado (falla: falta `onPress`).
2. Verificar que el botón esté deshabilitado durante `isPending` (falla: no hay disabled).

#### Bug 3 — Imagen de perfil

**Goal**: Confirmar que se renderiza `Image` con URL hardcodeada y botón de edición.

**Test Cases (fallan en código actual)**:
1. Renderizar `ProfileScreen` → `getByLabelText('Editar foto de perfil')` debe lanzar (falla:
   actualmente existe el botón).
2. `queryByRole('image')` debe ser null (falla: hay una `Image`).

#### Bug 4 — Race condition

**Goal**: Confirmar que `group === null && isLoading === false` muestra el error en lugar del loader.

**Test Cases (fallan en código actual)**:
1. Mockear `useGroupDetail` con `{ group: null, isLoading: false }` → debe mostrarse el spinner
   (falla: muestra "Este grupo ya no está disponible").

#### Bug 5 — Tarjeta "Debes" en rojo

**Goal**: Confirmar que cuando `youOwe === 0`, el chip de "Debes" usa `success` (verde).

**Test Cases (fallan en código actual)**:
1. Renderizar `SummaryCards` con `owedByUser.amount === 0` → el chip debe tener `tone="debt"`
   (falla: usa `success`).

---

### Fix Checking

**Pseudocode aplicado a cada bug:**
```
FOR ALL input WHERE isBugCondition_BugN(input) DO
  result := fixedFunction(input)
  ASSERT expectedBehavior_BugN(result)
END FOR
```

- **Bug 1**: Comentario explícito presente + test actualizado como comportamiento intencional.
- **Bug 2**: `logout.mutate` llamado al presionar; botón deshabilitado durante `isPending`.
- **Bug 3**: Sin `<Image>` hardcodeada; sin botón "Editar foto"; iniciales del usuario visibles.
- **Bug 4**: `GroupDetailScreen` con `{ group: null, isLoading: false }` post-creación muestra
  spinner (gracias a `setQueryData` pre-carga).
- **Bug 5**: Chip de "Debes" siempre `tone="debt"` independientemente del amount.

---

### Preservation Checking

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition_BugN(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

- **Bug 1**: Home loading/error/empty states sin cambio.
- **Bug 2**: Datos de perfil renderizados correctamente sin cambio.
- **Bug 3**: Nombre, email y estado de verificación visibles sin cambio.
- **Bug 4**: Grupos eliminados siguen mostrando error; grupos con caché no pasan por loading.
- **Bug 5**: Tarjeta "Te deben" con `amount >= 0` sigue verde; con `amount < 0` roja.

---

### Unit Tests

Ubicación: archivos `__tests__/` dentro de cada feature.

- **Bug 1** — `useHomeData.test.tsx`: actualizar test `'returns empty recent activity'` con
  descripción intencional; no agregar nuevo test de datos reales.
- **Bug 2** — `ProfileScreen.test.tsx` (nuevo): renderiza ProfileScreen, presiona "Cerrar sesión",
  verifica que `useLogout().mutate` fue llamado; verifica disabled durante isPending.
- **Bug 3** — `ProfileScreen.test.tsx`: verifica que no existe `Image` hardcodeada; verifica que
  no existe botón "Editar foto de perfil"; verifica que las iniciales del usuario son visibles.
- **Bug 4** — `GroupDetailScreen.test.tsx`: el test existente
  `'shows a loading state instead of unavailable copy while the group query is loading'`
  ya pasa para `isLoading: true`; agregar test para el estado de race condition (isLoading
  transitivamente false pero grupo no disponible aún).
- **Bug 5** — `SummaryCards.test.tsx` (nuevo): renderiza con `owedByUser.amount === 0` →
  chip `tone="debt"`; renderiza con `owedByUser.amount === -75` → chip `tone="debt"`;
  renderiza con `owedToUser.amount === 100` → chip `tone="success"`.

### Property-Based Tests

- **Bug 5**: Para cualquier número `n >= 0`, `SummaryCards` con `owedByUser.amount = -n` (o 0)
  siempre renderiza el chip de "Debes" con `tone="debt"`.
- **Bug 5**: Para cualquier número `n >= 0`, `SummaryCards` con `owedToUser.amount = n` siempre
  renderiza el chip de "Te deben" con `tone="success"`.

### Integration Tests

- **Bug 2**: Flujo completo de logout: press → `authStore.clearSession()` llamado →
  `queryClient.clear()` llamado → usuario redirigido a pantalla de auth.
- **Bug 4**: Flujo completo: crear grupo → navegar a detalle → spinner → datos cargados.
- **Bug 3**: Flujo: perfil renderizado → solo iniciales visibles, no URL de imagen.
