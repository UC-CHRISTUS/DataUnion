# Testing - FASE 3 (Parte 1): Componentes Base

## Resumen de Implementación

Se han completado 5 de 6 tareas de la FASE 3:

### ✅ Tareas Completadas
1. **useWorkflowStatus Hook** - Hook compartido para verificar workflow activo
2. **WorkflowAlert Component** - Banner de notificaciones
3. **SubmitConfirmModal Component** - Modal de doble confirmación
4. **FileUpload Modification** - Validación de archivo único con workflow
5. **Sidebar Modification** - Menú dinámico según rol de usuario

### ⏳ Tarea Pendiente
6. **ExcelEditor Modification** - Campos editables + auto-save (FASE 3B)

---

## Archivos Creados

### 1. `/src/hooks/useWorkflowStatus.ts`
**Propósito:** Hook compartido para verificar si existe un archivo en workflow activo

**Funcionalidades:**
- Llama a `GET /api/v1/grd/active-workflow`
- Auto-refresh opcional (configurable)
- Retorna: `{ hasActiveWorkflow, grdId, episodio, estado, loading, error, refetch }`

**Parámetros:**
- `autoFetch`: boolean (default: true) - Fetch automático al montar
- `refreshInterval`: number (default: 0) - Intervalo de auto-refresh en ms

---

### 2. `/src/components/WorkflowAlert.tsx` + `.module.css`
**Propósito:** Banner de notificaciones simples

**Props:**
- `message`: string - Mensaje a mostrar
- `type`: 'info' | 'warning' | 'success' | 'error' - Tipo de alerta
- `action`: { label, onClick } - Botón de acción opcional
- `dismissible`: boolean - Si puede cerrarse
- `onDismiss`: callback - Función al cerrar

**Estilos:**
- Colores diferenciados por tipo (azul, amarillo, verde, rojo)
- Iconos SVG según tipo
- Animación de entrada (slideDown)
- Responsive

---

### 3. `/src/components/SubmitConfirmModal.tsx` + `.module.css`
**Propósito:** Modal de doble confirmación para Submit de Encoder/Finance

**Props:**
- `isOpen`: boolean - Estado del modal
- `onClose`: callback - Cerrar modal
- `onConfirm`: async callback - Confirmación final
- `role`: 'encoder' | 'finance' - Rol del usuario
- `grdId`: number - ID del archivo GRD
- `isSubmitting`: boolean - Estado de carga

**Flujo:**
1. **Paso 1:** Confirmación inicial
   - Muestra GRD ID y destino
   - Pregunta: "¿Estás seguro de entregar este archivo?"
   - Botones: Cancelar / Continuar

2. **Paso 2:** Advertencia final
   - ⚠️ Advertencias importantes
   - Lista de puntos clave
   - Pregunta de confirmación final
   - Botones: Volver / Confirmar y Entregar (con loading state)

**Estilos:**
- Modal centrado con overlay
- Iconos dinámicos (check en paso 1, warning en paso 2)
- Gradientes azul-cyan (paso 1), naranja-rojo (paso 2)
- Responsive (mobile: botones en columna)

---

## Archivos Modificados

### 4. `/src/components/FileUpload.tsx`
**Cambios realizados:**

**Imports agregados:**
```typescript
import { useEffect } from 'react'; // Ya existía, pero ahora se usa
import { useWorkflowStatus } from '@/hooks/useWorkflowStatus';
import WorkflowAlert from './WorkflowAlert';
```

**Lógica agregada:**
- Hook `useWorkflowStatus` con auto-refresh cada 30s
- Variable `isUploadDisabled` = hasActiveWorkflow || uploading || workflowLoading
- Validación en handlers: `handleDrop`, `handleFileInputChange`
- Banner `WorkflowAlert` cuando `hasActiveWorkflow === true`
- Dropzone con clase `disabled` cuando hay workflow activo
- Texto dinámico: "Carga deshabilitada - Archivo en proceso"
- Botón "Elegir archivo" oculto cuando hay workflow activo
- Input file deshabilitado cuando hay workflow activo
- FileInfo solo se muestra si NO hay workflow activo
- Refetch de workflow después de upload exitoso

**CSS agregado en `FileUpload.module.css`:**
```css
.dropZone.disabled { opacity: 0.6; cursor: not-allowed; ... }
.dropZone.disabled:hover { no transform }
.dropZone.disabled .uploadIcon { color: gray }
.chooseFileButton:disabled { opacity: 0.5; cursor: not-allowed }
```

---

### 5. `/src/components/Sidebar.tsx`
**Cambios realizados:**

**Imports agregados:**
```typescript
import { useEffect, useState } from 'react';
```

**State agregado:**
```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
```

**Interface agregada:**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'encoder' | 'finance';
}
```

**useEffect agregado:**
- Fetch de `GET /api/auth/session`
- Guarda usuario en state

**Función `getMenuItemsByRole()` agregada:**
- Define todos los menu items con propiedad `roles: string[]`
- Filtra items según rol del usuario

**Menu items por rol:**
- **Encoder (5 items):**
  - Dashboard
  - Subir Archivos
  - Sigesa
  - Norma
  - Editor

- **Finance (3 items):**
  - Dashboard
  - Sigesa
  - Editor

- **Admin (4 items):**
  - Dashboard
  - Usuarios
  - Sigesa
  - Editor

**Footer actualizado:**
- Muestra `user?.name` en lugar de "Usuario"
- Muestra rol con emoji:
  - 👑 Admin
  - ✏️ Codificador
  - 💰 Finanzas

---

## Guía de Testing

### Pre-requisitos
1. Asegurarse de tener al menos 3 usuarios creados (admin, encoder, finance)
2. Tener al menos un archivo SIGESA cargado en el sistema
3. Servidor de desarrollo corriendo: `npm run dev`

---

### Test 1: Hook useWorkflowStatus
**Objetivo:** Verificar que el hook funciona correctamente

**Pasos:**
1. Abrir navegador en modo desarrollo (F12)
2. Ir a `/upload`
3. Abrir React DevTools
4. Buscar componente `FileUpload`
5. Verificar que el hook `useWorkflowStatus` retorna datos correctos

**Resultados esperados:**
- Si NO hay archivo en workflow:
  - `hasActiveWorkflow: false`
  - `grdId: undefined`
  - `estado: undefined`
  - `loading: false`

- Si HAY archivo en workflow:
  - `hasActiveWorkflow: true`
  - `grdId: <número>`
  - `estado: <string>` (borrador_encoder, pendiente_finance, etc.)
  - `loading: false`

**✅ Criterio de éxito:** Hook retorna datos correctos según estado del sistema

---

### Test 2: WorkflowAlert Component
**Objetivo:** Verificar que el banner de alerta funciona

**Pasos:**
1. Ir a `/upload`
2. Si NO hay archivo en workflow:
   - NO debe verse ningún banner
3. Si HAY archivo en workflow:
   - Debe verse banner amarillo (warning)
   - Texto: "⚠️ Ya existe un archivo en proceso (GRD #X, Estado: Y)"

**Pruebas adicionales:**
- Crear componente de prueba con diferentes tipos:
  ```tsx
  <WorkflowAlert message="Test info" type="info" />
  <WorkflowAlert message="Test warning" type="warning" />
  <WorkflowAlert message="Test success" type="success" />
  <WorkflowAlert message="Test error" type="error" />
  ```
- Verificar colores correctos (azul, amarillo, verde, rojo)

**✅ Criterio de éxito:** Banner se muestra correctamente con estilos adecuados

---

### Test 3: SubmitConfirmModal Component
**Objetivo:** Verificar modal de doble confirmación

**Nota:** Este componente se probará en la FASE 3B cuando se integre con ExcelEditor

**Preview manual (opcional):**
1. Crear página de prueba temporal en `/app/test-modal/page.tsx`:
```tsx
'use client';
import { useState } from 'react';
import SubmitConfirmModal from '@/components/SubmitConfirmModal';

export default function TestModal() {
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = async () => {
    console.log('Confirmado!');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => setShowModal(true)}>Abrir Modal Encoder</button>
      <SubmitConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        role="encoder"
        grdId={123}
      />
    </div>
  );
}
```

**Pasos:**
1. Ir a `/test-modal`
2. Click en "Abrir Modal Encoder"
3. Verificar Paso 1:
   - Título: "Entregar a Finanzas"
   - GRD ID visible
   - Botones: Cancelar / Continuar
4. Click "Continuar"
5. Verificar Paso 2:
   - Título: "⚠️ Confirmación Final"
   - Lista de advertencias visible
   - Botones: Volver / Confirmar y Entregar
6. Click "Confirmar y Entregar"
7. Verificar loading state (spinner + "Entregando...")
8. Modal debe cerrarse después de 2 segundos

**✅ Criterio de éxito:** Modal funciona con 2 pasos y loading state correcto

---

### Test 4: FileUpload con Validación de Workflow
**Objetivo:** Verificar que no se puede subir archivo si hay uno activo

#### Caso A: Sin archivo activo
**Pasos:**
1. Asegurarse de NO tener archivos en workflow
2. Ir a `/upload`
3. Verificar que NO hay banner de warning
4. Dropzone debe estar habilitado (hover con efecto azul)
5. Arrastrar archivo Excel
6. Click "Cargar"
7. Archivo debe subir correctamente
8. Banner de warning debe aparecer después del upload

**✅ Criterio de éxito:** Upload funciona cuando NO hay workflow activo

#### Caso B: Con archivo activo
**Pasos:**
1. Asegurarse de TENER un archivo en workflow (estado != exportado/rechazado)
2. Ir a `/upload`
3. **Verificar banner de warning:**
   - Debe verse banner amarillo
   - Texto debe incluir GRD ID y estado actual
4. **Verificar dropzone deshabilitado:**
   - Fondo gris
   - Texto: "Carga deshabilitada - Archivo en proceso"
   - No hay botón "Elegir archivo"
   - Hover NO tiene efecto
5. **Intentar arrastrar archivo:**
   - NO debe permitir drop
   - Archivo NO debe seleccionarse
6. **Intentar click en dropzone:**
   - NO debe abrir selector de archivos

**✅ Criterio de éxito:** Upload completamente bloqueado cuando HAY workflow activo

#### Caso C: Auto-refresh
**Pasos:**
1. Tener archivo en workflow activo
2. Ir a `/upload`
3. Verificar banner de warning visible
4. En otra pestaña/ventana, cambiar estado del archivo a "exportado" o "rechazado"
5. Esperar 30 segundos (auto-refresh interval)
6. Banner debe desaparecer automáticamente
7. Dropzone debe habilitarse

**✅ Criterio de éxito:** Auto-refresh funciona cada 30 segundos

---

### Test 5: Sidebar con Menú Dinámico
**Objetivo:** Verificar que el sidebar muestra opciones correctas según rol

#### Caso A: Usuario Encoder
**Pasos:**
1. Login como usuario con rol `encoder`
2. Verificar items visibles en sidebar:
   - ✅ Dashboard
   - ✅ Subir Archivos
   - ✅ Sigesa
   - ✅ Norma
   - ✅ Editor
   - ❌ Usuarios (NO debe estar)
3. Verificar footer:
   - Nombre del usuario
   - Emoji y texto: "✏️ Codificador"

**✅ Criterio de éxito:** 5 items visibles, sin opción "Usuarios"

#### Caso B: Usuario Finance
**Pasos:**
1. Login como usuario con rol `finance`
2. Verificar items visibles en sidebar:
   - ✅ Dashboard
   - ✅ Sigesa
   - ✅ Editor
   - ❌ Subir Archivos (NO debe estar)
   - ❌ Norma (NO debe estar)
   - ❌ Usuarios (NO debe estar)
3. Verificar footer:
   - Nombre del usuario
   - Emoji y texto: "💰 Finanzas"

**✅ Criterio de éxito:** 3 items visibles, sin opciones de encoder

#### Caso C: Usuario Admin
**Pasos:**
1. Login como usuario con rol `admin`
2. Verificar items visibles en sidebar:
   - ✅ Dashboard
   - ✅ Usuarios
   - ✅ Sigesa
   - ✅ Editor
   - ❌ Subir Archivos (NO debe estar)
   - ❌ Norma (NO debe estar)
3. Verificar footer:
   - Nombre del usuario
   - Emoji y texto: "👑 Admin"

**✅ Criterio de éxito:** 4 items visibles, incluye "Usuarios"

#### Caso D: Navegación funcional
**Pasos:**
1. Click en cada item del menú
2. Verificar que navega a la página correcta
3. Verificar que el item activo tiene estilo diferente (azul)

**✅ Criterio de éxito:** Navegación funciona, estilos activos correctos

---

## Errores Potenciales y Soluciones

### Error 1: Hook useWorkflowStatus retorna loading infinito
**Causa:** API `/api/v1/grd/active-workflow` no responde o falla
**Solución:**
1. Verificar que la API existe y funciona
2. Abrir Network tab en DevTools
3. Verificar request a `/api/v1/grd/active-workflow`
4. Si error 404: verificar que la API fue creada en FASE 2
5. Si error 500: revisar logs del servidor

### Error 2: Banner WorkflowAlert no se muestra
**Causa:** Condición `hasActiveWorkflow` no se cumple
**Solución:**
1. Verificar que hay un archivo en estado activo en DB
2. Usar React DevTools para ver valor de `hasActiveWorkflow`
3. Revisar query de la API `active-workflow`

### Error 3: Sidebar no muestra ningún item
**Causa:** Usuario no se carga correctamente
**Solución:**
1. Verificar que `/api/auth/session` existe y funciona
2. Revisar Network tab para ver response
3. Verificar que el usuario está autenticado
4. Revisar `user.role` en React DevTools

### Error 4: Dropzone no se deshabilita con workflow activo
**Causa:** Clase CSS `.disabled` no aplicada
**Solución:**
1. Verificar que `isUploadDisabled` es `true`
2. Inspeccionar elemento en DevTools
3. Verificar que clase `.disabled` está en el elemento
4. Revisar estilos CSS compilados

### Error 5: Modal no se cierra después de confirmar
**Causa:** Promesa de `onConfirm` no se resuelve
**Solución:**
1. Asegurarse que `onConfirm` es `async` y retorna `Promise<void>`
2. Verificar que no hay errores en la función de submit
3. Agregar `.catch()` para manejar errores

---

## Checklist de Validación Final

Antes de marcar FASE 3 (Parte 1) como completa, verificar:

### Funcionalidad
- [ ] Hook useWorkflowStatus retorna datos correctos
- [ ] WorkflowAlert se muestra con estilos correctos
- [ ] SubmitConfirmModal tiene 2 pasos funcionales
- [ ] FileUpload se deshabilita con workflow activo
- [ ] FileUpload se habilita cuando no hay workflow
- [ ] Sidebar muestra items correctos para encoder
- [ ] Sidebar muestra items correctos para finance
- [ ] Sidebar muestra items correctos para admin
- [ ] Navegación del sidebar funciona
- [ ] Footer del sidebar muestra usuario y rol

### Estilos
- [ ] WorkflowAlert tiene colores correctos por tipo
- [ ] SubmitConfirmModal es responsive
- [ ] FileUpload disabled tiene estilo gris
- [ ] Sidebar mantiene estilos existentes

### Performance
- [ ] Auto-refresh cada 30s no causa lag
- [ ] Fetch de usuario en sidebar solo ocurre una vez

### Sin Errores
- [ ] No hay errores de compilación
- [ ] No hay warnings de React en consola
- [ ] No hay errores 404 en Network tab
- [ ] No hay errores 500 en API calls

---

## Próximos Pasos

### FASE 3B (Pendiente)
**Tarea 6:** Modificar ExcelEditor.tsx
- Agregar prop `role`
- Lógica de campos bloqueados por rol + estado
- Auto-guardado cada 5 segundos
- Botón "Entregar" (encoder/finance)
- Botones Admin (aprobar/rechazar)

**Estimación:** 3-4 horas

### FASE 4 (Pendiente)
- Integración de componentes en páginas
- Modificar `/visualizator/page.tsx`
- Modificar `/dashboard/page.tsx`
- Modificar `/sigesa/page.tsx`

### FASE 5 (Pendiente)
- Lógica de exportación
- Re-descarga de archivos exportados

---

## Notas Importantes

1. **No eliminar componentes de prueba** hasta verificar que todo funciona en producción
2. **Tomar screenshots** de cada test exitoso para documentación
3. **Reportar cualquier bug** encontrado antes de continuar a FASE 3B
4. **Verificar en diferentes navegadores** (Chrome, Firefox, Safari)
5. **Testing mobile** opcional pero recomendado

---

**Fecha de creación:** 3 de noviembre, 2025
**Estado:** FASE 3 (Parte 1) - Listo para testing
**Progreso general HU-003:** 60% completado
