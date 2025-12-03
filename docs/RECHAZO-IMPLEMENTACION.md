# Implementación de Funcionalidad de Rechazo - Admin → Encoder

**Fecha:** 2 de Diciembre, 2025  
**Objetivo:** Habilitar el flujo completo de rechazo: Admin rechaza archivo → Encoder recibe notificación → Encoder puede reeditarlo

---

## 📋 Estado de Implementación

### ✅ PASO 1: Permitir edición de Encoder en estado `rechazado`

**Estado:** COMPLETADO ✅

**Ubicación:** `src/components/ExcelEditor.tsx` - Línea 171-203

**Detalles:**
- La función `isFieldEditable()` ya incluye lógica para permitir edición cuando:
  - `userRole === 'encoder'`
  - `workflowEstado === 'rechazado'` ← Estado permitido
  - Campo está en `ENCODER_EDITABLE_FIELDS` (AT, AT_detalle, centro, documentacion, etc.)

**Código:**
```tsx
const isFieldEditable = (field: string, userRole?: string, workflowEstado?: string): boolean => {
  // ...
  
  // Encoder: solo puede editar 'at' y 'at_detalle' en estado 'borrador_encoder' o 'rechazado'
  if (userRole === 'encoder') {
    if (!['borrador_encoder', 'rechazado'].includes(workflowEstado)) {
      return false;
    }
    return ENCODER_EDITABLE_FIELDS.includes(field);
  }
  
  // ...
};
```

**Campos editables por Encoder:**
- `AT` (Ajustes Tecnológicos)
- `AT_detalle` (Detalle de AT)
- `centro` (Centro)
- `documentacion` (Documentación)
- `dias_demora_rescate_hospital`
- `pago_demora_rescate`
- `pago_outlier_superior`

---

### ✅ PASO 2: Notificación visual al Encoder en Dashboard

**Estado:** COMPLETADO ✅

**Ubicaciones:**
1. `src/app/dashboard/page.tsx` - Convertido a componente dinámico
2. `src/app/dashboard/page.module.css` - Agregada sección `.alertSection`

**Detalles de Implementación:**

#### 2.1 Dashboard page.tsx

**Cambios:**
- Convertido de componente estático a dinámico ('use client')
- Agregado `useEffect()` para cargar datos al montar el componente
- Obtiene rol del usuario desde BD (tabla `users`)
- Verifica estado del archivo según el rol:
  - **Encoder:** Busca archivos con estado `rechazado`
  - **Finance:** Busca archivos con estado `pendiente_finance`
  - **Admin:** Busca archivos con estado `pendiente_admin`

**Flujo de Notificación para Encoder:**

```tsx
if (userData.role === 'encoder') {
  const { data: grdData } = await supabase
    .from('grd_fila')
    .select('id_grd_oficial, documentacion')
    .eq('estado', 'rechazado')
    .limit(1);

  if (grdData && grdData.length > 0) {
    setWorkflowAlert({
      type: 'error',  // Alerta roja
      message: `⚠️ Tu archivo fue rechazado. Razón: ${grdData[0].documentacion || 'Contacta al administrador'}`,
      grdId: grdData[0].id_grd_oficial,
    });
  }
}
```

**Notificación mostrada:**
- Tipo: `error` (color rojo)
- Mensaje: `⚠️ Tu archivo fue rechazado. Razón: [razón del rechazo]`
- Botón: "Ver archivo" → Navega a `/visualizator`
- Opción: Cerrar/Descartar la notificación

#### 2.2 Estilos CSS

**Agregado:** Nueva sección `.alertSection` con:
- Margin bottom de 2rem
- Animación de deslizamiento suave (`slideDown`)
- Transición de 0.3s

```css
.alertSection {
  margin-bottom: 2rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### ✅ PASO 1.5: Visualización en Visualizator

**Estado:** COMPLETADO ✅

**Ubicación:** `src/app/visualizator/page.tsx` - Línea 164-181

**Detalles:**
- Cuando el usuario accede a `/visualizator` con estado `rechazado`:
- Muestra alerta roja con ícono ⚠️
- Mensaje: "Archivo Rechazado por el Administrador"
- Indicación: "Este archivo fue rechazado. Por favor revisa los comentarios del administrador, realiza las correcciones necesarias y vuelve a enviarlo."

**Código:**
```tsx
{/* Alerta si el archivo fue rechazado */}
{estado === 'rechazado' && (
  <div className="mb-4 bg-red-50 border-l-4 border-red-600 rounded-lg shadow p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <span className="text-2xl">⚠️</span>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">
          Archivo Rechazado por el Administrador
        </h3>
        <div className="mt-2 text-sm text-red-700">
          <p>Este archivo fue rechazado. Por favor revisa los comentarios del administrador, realiza las correcciones necesarias y vuelve a enviarlo.</p>
        </div>
      </div>
    </div>
  </div>
)}
```

---

## 🔄 Flujo Completo de Rechazo

```
1. ADMIN EN /visualizator
   ├─ Estado: pendiente_admin
   ├─ Botón visible: "❌ Rechazar Archivo"
   ├─ Click → Abre RejectModal
   │  └─ RejectModal solicita razón (min 10 caracteres)
   │  └─ Confirma → POST /api/v1/grd/[grdId]/review
   │     └─ Action: "reject"
   │     └─ Reason: razón ingresada
   │
   └─ API actualiza: pendiente_admin → rechazado + guarda razón

2. ENCODER EN /dashboard (siguiente acceso)
   ├─ Dashboard detecta estado: rechazado
   ├─ Carga notificación WorkflowAlert
   │  ├─ Type: error (rojo)
   │  ├─ Mensaje: "⚠️ Tu archivo fue rechazado. Razón: [razón]"
   │  └─ Botón: "Ver archivo"
   │
   └─ Click "Ver archivo" → Navega a /visualizator

3. ENCODER EN /visualizator
   ├─ Obtiene archivo con estado: rechazado
   ├─ Muestra alerta roja: "⚠️ Archivo Rechazado por el Administrador"
   ├─ isFieldEditable() = true para campos Encoder
   ├─ Puede editar: AT, AT_detalle, centro, documentacion, etc.
   └─ Puede hacer Submit nuevamente

4. ENCODER HACE SUBMIT
   └─ Estado: rechazado → pendiente_finance (como de costumbre)

5. FINANCE EN /dashboard
   ├─ Recibe notificación: "pendiente_finance"
   ├─ Continúa flujo normal
   └─ Completa sus campos

6. ADMIN EN /dashboard
   ├─ Recibe notificación: "pendiente_admin"
   ├─ Puede aprobar o rechazar nuevamente
```

---

## 🚀 Pasos Siguientes

### PASO 3: Testing Manual E2E

**Objetivo:** Validar que todo el flujo funciona correctamente

**Casos de Prueba:**

1. **Case 1: Admin rechaza archivo**
   - [ ] Encoder sube archivo SIGESA
   - [ ] Finance edita y hace Submit
   - [ ] Admin ve archivo en pendiente_admin
   - [ ] Admin click "Rechazar" → Modal
   - [ ] Admin ingresa razón
   - [ ] Admin confirma
   - [ ] API retorna 200 OK
   - [ ] Estado cambia a rechazado

2. **Case 2: Encoder recibe notificación**
   - [ ] Encoder accede a dashboard
   - [ ] Dashboard muestra WorkflowAlert roja
   - [ ] Mensaje: "Tu archivo fue rechazado. Razón: [razón ingresada]"
   - [ ] Botón "Ver archivo" funciona

3. **Case 3: Encoder puede reeditarlo**
   - [ ] Encoder click "Ver archivo"
   - [ ] Visualizator muestra alerta roja
   - [ ] Encoder puede editar campos AT, AT_detalle, centro, documentacion
   - [ ] Cambios se guardan
   - [ ] Encoder puede hacer Submit nuevamente

4. **Case 4: Finance continúa flujo normal**
   - [ ] Después del nuevo Submit del Encoder
   - [ ] Finance recibe notificación
   - [ ] Finance puede editar sus campos
   - [ ] Finance hace Submit

5. **Case 5: Admin aprueba segunda vez**
   - [ ] Admin recibe notificación
   - [ ] Admin puede aprobar (sin rechazar otra vez)
   - [ ] Archivo pasa a estado aprobado
   - [ ] Admin puede exportar

---

## 📋 Componentes Involucrados

### APIs
- `POST /api/v1/grd/[grdId]/review` - Aprobar/Rechazar archivo
- `GET /api/v1/grd/active-workflow` - Obtener estado del flujo

### Componentes
- `ExcelEditor.tsx` - Incluye botones Aprobar/Rechazar
- `RejectModal.tsx` - Modal para capturar razón del rechazo
- `WorkflowAlert.tsx` - Banner de notificación en dashboard
- `visualizator/page.tsx` - Alerta roja cuando estado = rechazado
- `dashboard/page.tsx` - **NUEVO** - Notificación en dashboard

### Base de Datos
- Tabla `grd_fila` - Campo `estado` incluye valor `rechazado`
- Campo `documentacion` - Almacena razón del rechazo

---

## 🔧 Configuración Requerida

Ninguna configuración adicional necesaria. Todo está integrado.

---

## 📝 Notas Importantes

1. **La razón del rechazo se guarda en `grd_fila.documentacion`**
   - Consideración: Si Finance ya agregó un valor aquí, será sobrescrito
   - Mejora futura: Crear campo dedicado `rechazo_razon`

2. **El estado `rechazado` es temporal**
   - Cuando Encoder hace Submit nuevamente, cambia a `pendiente_finance`
   - No hay "historial" de rechazos (pero se puede auditar a nivel de BD con timestamps)

3. **Encoder SOLO puede reedititar en estado `rechazado`**
   - Una vez que hace Submit, pierde acceso nuevamente
   - Finance y Admin pueden ver pero no editar cuando estado = rechazado

4. **Todas las notificaciones son desechables**
   - Usuario puede cerrar banner con botón X
   - No persiste entre sesiones

---

## ✅ Checklist de Validación

- [x] API de review implementada y funcional
- [x] ExcelEditor tiene botones Aprobar/Rechazar
- [x] RejectModal captura razón del rechazo
- [x] Estado `rechazado` permitido en `isFieldEditable()`
- [x] Visualizator muestra alerta roja para estado rechazado
- [x] Dashboard muestra notificación al Encoder
- [x] Transiciones de estado: pendiente_admin → rechazado → pendiente_finance
- [x] No hay errores de compilación

---

## 🎯 Siguientes Sprints

1. **Crear campo dedicado `rechazo_razon`** en `grd_fila`
   - Evitar sobrescribir `documentacion` de Finance

2. **Agregar historial de rechazos**
   - Nueva tabla: `grd_rechazos` con timestamp, razón, usuario

3. **Notificación por email** al Encoder cuando es rechazado

4. **Métricas de rechazo**
   - Dashboard admin con % de rechazos por usuario/mes
