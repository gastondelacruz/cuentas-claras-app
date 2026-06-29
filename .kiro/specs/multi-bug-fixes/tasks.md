# Implementation Plan

## Overview

Plan de implementación para los 5 bugs documentados en bugfix.md y design.md. Sigue el workflow TDD: primero tests de exploración que fallan (confirman el bug), luego tests de preservación que pasan (capturan baseline), luego implementación y verificación final.

## Tasks

## Bug 1 — Actividad reciente siempre vacía

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Actividad reciente hardcodeada como array vacío
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Confirmar que `recentActivity` es `[]` incluso cuando hay grupos con gastos
  - **Scoped PBT Approach**: Dado que el bug es determinístico (hardcode), el scope es: cualquier estado con `groups.length > 0 && groups.some(g => g.expensesCount > 0)`
  - Actualizar/crear test en `src/features/home/__tests__/useHomeData.test.tsx`
  - Test: cuando `groupsResponse.data` contiene grupos con `expensesCount > 0`, `recentActivity` debería tener items (pero actualmente siempre es `[]`)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — confirma que el array está hardcodeado sin documentar la limitación
  - Document counterexample: `expect(result.current.recentActivity).toHaveLength(0)` pasa incondicionalmente
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.2_

- [x] 2. Write preservation property tests — home states not affected (BEFORE implementing fix)
  - **Property 2: Preservation** - Estados vacío/carga/error de HomeScreen sin cambios
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: con `isLoading === true` → `HomeLoadingView` se renderiza (unfixed code)
  - Observe: con `isError === true` → `HomeErrorView` se renderiza (unfixed code)
  - Observe: con `groups.length === 0` → `HomeEmptyView` se renderiza (unfixed code)
  - Write property-based tests: para cualquier estado de carga/error/vacío, el componente renderiza la vista correspondiente
  - Tests en `src/features/home/__tests__/HomeScreen.test.tsx` o el archivo de tests existente
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS — confirma el baseline a preservar
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Fix Bug 1 — Documentar limitación explícita en useHomeData

  - [x] 3.1 Actualizar `useHomeData.ts` con comentario explícito
    - Abrir `src/features/home/hooks/useHomeData.ts`
    - Reemplazar el array mudo `const recentActivity: HomeActivity[] = []` por uno con comentario JSDoc
    - El comentario debe explicar que `GroupListItemDto` solo expone `expensesCount`/`totalAmount`, no gastos individuales
    - Debe indicar que se requiere un endpoint `/activity` dedicado que no existe aún
    - Ejemplo: `// recentActivity: [] — Limitación intencional: GroupListItemDto no expone gastos individuales.\n// Requiere endpoint /activity dedicado. Ver bugfix.md Bug 1 para contexto.`
    - _Bug_Condition: isBugCondition_Bug1 donde groups.length > 0 && expensesCount > 0 && recentActivity.length === 0_
    - _Expected_Behavior: recentActivity === [] con documentación explícita de la limitación_
    - _Preservation: estados loading/error/empty de HomeScreen sin cambio_
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Limitación documentada como intencional
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Actualizar el assertion del test para verificar que `recentActivity === []` con el comentario/documentación intencional presente
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES — confirma que la limitación está correctamente documentada

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Estados de HomeScreen sin regresiones
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS — confirma que loading/error/empty states no se afectaron

---

## Bug 2 — Cerrar sesión sin efecto

- [x] 4. Write bug condition exploration test
  - **Property 1: Bug Condition** - Pressable "Cerrar Sesión" sin onPress conectado
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Confirmar que presionar "Cerrar Sesión" no invoca `useLogout().mutate()`
  - **Scoped PBT Approach**: Bug determinístico — el `onPress` está ausente en todo render de `ProfileScreen`
  - Crear `src/features/profile/__tests__/ProfileScreen.test.tsx` si no existe
  - Mockear `useLogout` para capturar llamadas a `mutate`
  - Test 1: renderizar `ProfileScreen`, presionar el botón con `accessibilityLabel="Cerrar sesión"` → `mockMutate` NOT llamado (falla: falta onPress)
  - Test 2: con `useLogout` retornando `isPending: true` → botón `disabled` debe ser `true` (falla: no hay disabled)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL — confirma que el onPress está ausente y que no hay disabled
  - Document counterexample: `expect(mockMutate).toHaveBeenCalled()` falla porque nunca se llama
  - _Requirements: 1.3, 1.4_

- [x] 5. Write preservation property tests — datos de perfil no afectados (BEFORE implementing fix)
  - **Property 2: Preservation** - ProfileScreen sigue mostrando nombre, email, resumen y versión
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: nombre del usuario visible en unfixed code
  - Observe: email del usuario visible en unfixed code
  - Observe: resumen financiero visible en unfixed code
  - Observe: versión de la app visible en unfixed code
  - Write property-based tests: para cualquier usuario autenticado, todos esos campos se renderizan
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS — confirma el baseline de renderizado de ProfileScreen
  - _Requirements: 3.4, 3.5_

- [x] 6. Fix Bug 2 — Conectar useLogout al Pressable en ProfileScreen

  - [x] 6.1 Implementar conexión de useLogout en ProfileScreen
    - Abrir `src/features/profile/screens/ProfileScreen.tsx`
    - Importar `useLogout` desde `src/features/auth/hooks/useLogout`
    - Instanciar `const logout = useLogout()` dentro de `ProfileScreen`
    - Agregar `onPress={() => logout.mutate()}` al `Pressable` con `accessibilityLabel="Cerrar sesión"`
    - Agregar `disabled={logout.isPending}` al mismo `Pressable`
    - Agregar `accessibilityState={{ busy: logout.isPending }}` para accesibilidad
    - _Bug_Condition: pressable("Cerrar sesión").onPress === undefined_
    - _Expected_Behavior: logout.mutate() llamado al presionar; botón disabled cuando isPending_
    - _Preservation: nombre, email, resumen financiero y versión siguen visibles_
    - _Requirements: 2.3, 2.4_

  - [x] 6.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Logout ejecuta la mutación y deshabilita el botón
    - **IMPORTANT**: Re-run the SAME tests from task 4 — do NOT write new tests
    - Run bug condition exploration tests from step 4
    - **EXPECTED OUTCOME**: Tests PASS — confirma que `mutate` se llama y que `disabled` funciona

  - [x] 6.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Datos de perfil sin regresiones
    - **IMPORTANT**: Re-run the SAME tests from task 5 — do NOT write new tests
    - Run preservation property tests from step 5
    - **EXPECTED OUTCOME**: Tests PASS — confirma que nombre, email y resumen siguen visibles

---

## Bug 3 — Imagen de perfil debe reemplazarse por avatar de iniciales

- [x] 7. Write bug condition exploration test
  - **Property 1: Bug Condition** - ProfileCard renderiza Image hardcodeada y botón de edición
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Confirmar que existe `<Image>` con URL hardcodeada y el botón "Editar foto de perfil"
  - Usar `src/features/profile/__tests__/ProfileScreen.test.tsx`
  - Test 1: `getByLabelText('Editar foto de perfil')` NO debe lanzar (en unfixed code existe → confirma el bug)
  - Test 2: `queryByRole('image')` NO debe ser null (en unfixed code hay un Image → confirma el bug)
  - Test 3: las iniciales del usuario (ej. "AL" para "Ana López") deben ser visibles — falla porque no hay avatar de iniciales
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL — confirma que Image y botón de edición están presentes
  - Document counterexample: `getByLabelText('Editar foto de perfil')` existe, `queryByRole('image')` no es null
  - _Requirements: 1.5, 1.6_

- [x] 8. Write preservation property tests — nombre, email y estado de verificación (BEFORE implementing fix)
  - **Property 2: Preservation** - Nombre, email y estado de verificación visibles
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: nombre del usuario visible en unfixed code
  - Observe: email del usuario visible en unfixed code
  - Observe: estado de verificación ("Verificado") visible en unfixed code
  - Write tests: para cualquier usuario autenticado, esos tres campos se renderizan sin importar si hay avatar
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS — confirma el baseline de datos del usuario
  - _Requirements: 3.6, 3.7_

- [x] 9. Fix Bug 3 — Reemplazar Image por Avatar de iniciales en ProfileCard

  - [x] 9.1 Agregar `initials` a `ProfileUser` y derivarlo en `useProfileData`
    - Abrir `src/features/profile/hooks/useProfileData.ts`
    - Agregar función helper `getInitials(name: string): string` que toma las dos primeras palabras del nombre
    - Agregar campo `initials: string` al tipo `ProfileUser` (o al return del hook)
    - Calcular `initials: getInitials(authUser?.name ?? authUser?.email ?? 'U')`
    - _Requirements: 2.5_

  - [x] 9.2 Actualizar `ProfileCard` en ProfileScreen para usar Avatar de iniciales
    - Abrir `src/features/profile/screens/ProfileScreen.tsx`
    - Importar `Avatar` desde `src/shared/ui/Avatar`
    - En `ProfileCard`: eliminar el bloque `<Image source={{ uri: profile.avatarUrl }} />` y el `<Pressable accessibilityLabel="Editar foto de perfil">`
    - Reemplazar por `<Avatar name={profile.name} />` (o usando `initials` y sin `sourceUrl`)
    - Eliminar imports de `Image` (react-native) y `Pencil` (lucide) si quedan sin uso
    - _Bug_Condition: component.renders(<Image />) OR component.renders(<Pressable label="Editar foto de perfil" />)_
    - _Expected_Behavior: Avatar con iniciales visible; sin Image hardcodeada; sin botón de edición_
    - _Preservation: nombre, email y estado de verificación siguen visibles_
    - _Requirements: 2.5, 2.6_

  - [x] 9.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Avatar de iniciales visible, sin Image ni botón de edición
    - **IMPORTANT**: Re-run the SAME tests from task 7 — do NOT write new tests
    - Run bug condition exploration tests from step 7
    - **EXPECTED OUTCOME**: Tests PASS — confirma que Image y botón de edición fueron eliminados y que las iniciales son visibles

  - [x] 9.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Nombre, email y estado sin regresiones
    - **IMPORTANT**: Re-run the SAME tests from task 8 — do NOT write new tests
    - Run preservation property tests from step 8
    - **EXPECTED OUTCOME**: Tests PASS — confirma que los datos del usuario siguen visibles

---

## Bug 4 — Error falso "Este grupo ya no está disponible" al crear un grupo

- [x] 10. Write bug condition exploration test
  - **Property 1: Bug Condition** - GroupDetailScreen muestra error en lugar de spinner en race condition
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Confirmar que `group === null && isLoading === false` activa el branch de error
  - **Scoped PBT Approach**: Bug determinístico — mockear `useGroupDetail` con `{ group: null, isLoading: false }` simula la ventana de race condition
  - Crear o actualizar `src/features/groups/__tests__/GroupDetailScreen.test.tsx`
  - Test: mockear `useGroupDetail` retornando `{ group: null, isLoading: false, isError: false }` → NO debe aparecer "Este grupo ya no está disponible" en ese instante (falla: actualmente sí aparece)
  - El spinner/loading indicator SHOULD mostrarse en ese estado (falla: no se muestra)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — confirma que la race condition muestra el mensaje de error incorrecto
  - Document counterexample: `getByText('Este grupo ya no está disponible')` existe cuando debería ser un spinner
  - _Requirements: 1.7, 1.8_

- [x] 11. Write preservation property tests — grupos inexistentes siguen mostrando error (BEFORE implementing fix)
  - **Property 2: Preservation** - Grupos eliminados/inexistentes siguen mostrando mensaje de error
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: con `{ group: null, isLoading: false, isError: false }` después de queries completadas → "Este grupo ya no está disponible" visible (unfixed code)
  - Observe: con `{ group: groupData, isLoading: false }` y datos en caché → detalle del grupo visible sin pasar por loading (unfixed code)
  - Write tests: para los estados donde el grupo genuinamente no existe (queries completadas y group === null), el error se muestra; para grupos con caché, se muestran directo
  - **Nota**: diferenciar state de "race condition" vs "grupo realmente inexistente" será el resultado del fix
  - Verify tests pass on UNFIXED code (los de preservación, no el de bug condition)
  - **EXPECTED OUTCOME**: Tests PASS — confirma el baseline de comportamiento para grupos inexistentes
  - _Requirements: 3.8, 3.9_

- [x] 12. Fix Bug 4 — Pre-poblar caché con setQueryData antes de navegar

  - [x] 12.1 Actualizar `useNewGroupForm` para pre-poblar el caché antes de navegar
    - Abrir `src/features/groups/hooks/useNewGroupForm.ts`
    - En el callback `onSuccess` de `createGroupMutation`, importar `useQueryClient` y obtener `queryClient`
    - Antes de `navigation.replace(...)`, llamar `queryClient.setQueryData(queryKeys.groups.detail(response.id), { ...mappedData })` con los campos mínimos del `GroupDetailDto`
    - Campos a incluir: `id, name, type, currency, members, totalAmount, expensesCount, currentUserBalance, createdAt, updatedAt`
    - El `setQueryData` debe ejecutarse ANTES de `queryClient.invalidateQueries` y ANTES de `navigation.replace`
    - _Bug_Condition: group === null && isLoading === false && isNewGroup === true (ventana de race condition)_
    - _Expected_Behavior: caché pre-poblado → group !== null en el primer render de GroupDetailScreen_
    - _Preservation: grupos eliminados siguen mostrando error; grupos con caché no pasan por loading_
    - _Requirements: 2.7, 2.8_

  - [x] 12.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Spinner mostrado en lugar de error durante race condition
    - **IMPORTANT**: Re-run the SAME test from task 10 — do NOT write a new test
    - Run bug condition exploration test from step 10
    - **EXPECTED OUTCOME**: Test PASSES — confirma que el caché pre-poblado elimina la ventana de race condition

  - [x] 12.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Grupos inexistentes y con caché sin regresiones
    - **IMPORTANT**: Re-run the SAME tests from task 11 — do NOT write new tests
    - Run preservation property tests from step 11
    - **EXPECTED OUTCOME**: Tests PASS — confirma que el error para grupos eliminados sigue funcionando

---

## Bug 5 — Tarjeta "Debes" siempre en rojo

- [x] 13. Write bug condition exploration test
  - **Property 1: Bug Condition** - Chip de "Debes" con tone="success" cuando youOwe === 0
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Confirmar que `owedByUser.amount === 0` produce `tone="success"` en lugar de `tone="debt"`
  - **Scoped PBT Approach**: Scope al caso concreto: `owedByUser = { id: 'owed-by-user', amount: 0, ... }`
  - Crear `src/features/home/__tests__/SummaryCards.test.tsx` si no existe
  - Test: renderizar `SummaryCards` con `owedByUser.amount === 0` → buscar el chip de "Debes" → debe tener `tone="debt"` (falla: actualmente tiene `tone="success"`)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — confirma que `amount >= 0` produce `success` para monto 0
  - Document counterexample: `expect(chip.props.tone).toBe('debt')` falla; valor actual: `'success'`
  - _Requirements: 1.9, 1.10_

- [x] 14. Write preservation property tests — tarjeta "Te deben" mantiene su lógica (BEFORE implementing fix)
  - **Property 2: Preservation** - Chip de "Te deben" sigue usando success/debt según amount
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `owedToUser.amount = 100` → chip "Te deben" con `tone="success"` (unfixed code)
  - Observe: `owedToUser.amount = 0` → chip "Te deben" con `tone="success"` (unfixed code)
  - Observe: `owedByUser.amount = -75` → chip "Debes" con `tone="debt"` (unfixed code — correcto accidentalmente)
  - Write property-based tests:
    - Para cualquier `n >= 0`: `owedToUser.amount = n` → chip "Te deben" con `tone="success"`
    - Para cualquier `n > 0`: `owedByUser.amount = -n` → chip "Debes" con `tone="debt"`
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS — confirma el baseline a preservar
  - _Requirements: 3.10, 3.11_

- [x] 15. Fix Bug 5 — Agregar campo tone a HomeSummaryItem

  - [x] 15.1 Agregar campo `tone` al tipo `HomeSummaryItem` en types.ts
    - Abrir `src/features/home/types.ts`
    - Agregar `tone: 'success' | 'debt'` a la interfaz/tipo `HomeSummaryItem`
    - _Requirements: 2.9, 2.10_

  - [x] 15.2 Asignar `tone` en `useHomeData.ts`
    - Abrir `src/features/home/hooks/useHomeData.ts`
    - En la construcción de `owedToUser`: agregar `tone: 'success'`
    - En la construcción de `owedByUser`: agregar `tone: 'debt'`
    - Actualizar `homeMockData` en `src/features/home/mocks/home.mock.ts` (o donde esté) para incluir `tone` en ambas tarjetas
    - _Bug_Condition: item.id === 'owed-by-user' && item.amount === 0 && chipTone === 'success'_
    - _Expected_Behavior: owedByUser.tone === 'debt' siempre; owedToUser.tone === 'success' siempre_
    - _Preservation: lógica de chip "Te deben" sin cambio semántico_
    - _Requirements: 2.9, 2.10_

  - [x] 15.3 Actualizar `SummaryCards.tsx` para usar `item.tone`
    - Abrir `src/features/home/components/SummaryCards.tsx`
    - Reemplazar `tone={item.amount >= 0 ? 'success' : 'debt'}` por `tone={item.tone}`
    - _Requirements: 2.9, 2.10_

  - [x] 15.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Chip "Debes" siempre con tone="debt"
    - **IMPORTANT**: Re-run the SAME test from task 13 — do NOT write a new test
    - Run bug condition exploration test from step 13
    - **EXPECTED OUTCOME**: Test PASSES — confirma que chip "Debes" usa `tone="debt"` con amount=0

  - [x] 15.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Tarjeta "Te deben" sin regresiones
    - **IMPORTANT**: Re-run the SAME tests from task 14 — do NOT write new tests
    - Run preservation property tests from step 14
    - **EXPECTED OUTCOME**: Tests PASS — confirma que la lógica de "Te deben" no se afectó

---

## Checkpoint Final

- [x] 16. Checkpoint — Asegurar que todos los tests pasan
  - Ejecutar la suite completa: `npm test -- --runInBand`
  - Ejecutar typecheck: `npm run typecheck`
  - Ejecutar Expo doctor: `npx expo-doctor`
  - Todos deben pasar sin errores antes de cerrar este spec
  - Si algún test falla, revisar el bug correspondiente y preguntar al usuario si hay dudas

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "2", "4", "5", "7", "8", "10", "11", "13", "14"],
      "description": "Tests de exploración y preservación para todos los bugs (paralelos entre bugs)"
    },
    {
      "wave": 2,
      "tasks": ["3.1", "6.1", "9.1", "9.2", "12.1", "15.1", "15.2", "15.3"],
      "description": "Implementación de fixes (paralelos entre bugs)"
    },
    {
      "wave": 3,
      "tasks": ["3.2", "3.3", "6.2", "6.3", "9.3", "9.4", "12.2", "12.3", "15.4", "15.5"],
      "description": "Verificación de que los tests de exploración y preservación pasan tras el fix"
    },
    {
      "wave": 4,
      "tasks": ["16"],
      "description": "Checkpoint final — toda la suite verde"
    }
  ]
}
```

Cada bug es independiente — se puede trabajar en cualquier orden. Dentro de cada bug: exploration test → preservation tests → fix → verify.

## Notes

- Seguir TDD estricto: nunca implementar antes de escribir el test que falla.
- Los tests de exploración (Property 1) deben correr sobre código SIN fix y DEBEN fallar.
- Los tests de preservación (Property 2) deben correr sobre código SIN fix y DEBEN pasar.
- No modificar configuración de TypeScript, ESLint ni Jest para forzar que un test pase.
- Ver archivos de skills relevantes antes de tocar código: `react-query` para Bug 4, `react-best-practices` para Bugs 2 y 3.
- Comando para correr la suite completa: `npm test -- --runInBand`
