# 🧪 GUÍA DE TESTING - BLOQUES 4 Y 5

**Fecha:** 4 de Noviembre, 2025  
**Objetivo:** Validar funcionalidad de botones Submit para Encoder y Finance  
**Componentes Testeados:** ExcelEditor, SubmitConfirmModal, APIs submit-encoder y submit-finance

---

## 📋 Pre-requisitos

### 1. Base de Datos
- ✅ Migración de estados aplicada (`workflow_estado` ENUM)
- ✅ Tabla `grd_fila` con columna `estado`
- ✅ Al menos 3 usuarios en la base de datos:
  - 1 usuario con rol `encoder`
  - 1 usuario con rol `finance`
  - 1 usuario con rol `admin`

### 2. Datos de Prueba
Necesitas tener UN archivo SIGESA cargado en estado `borrador_encoder`:

```sql
-- Verificar que existe un archivo en borrador_encoder
SELECT id_grd_oficial, episodio, estado 
FROM grd_fila 
WHERE estado = 'borrador_encoder' 
LIMIT 1;
```

Si no existe, sube un archivo usando el usuario **encoder** en `/upload`.

---

## 🧪 TEST 1: BOTÓN SUBMIT ENCODER

### Escenario: Encoder entrega archivo a Finanzas

**Usuario:** `encoder`  
**Estado inicial:** `borrador_encoder`  
**Estado esperado final:** `pendiente_finance`

### Pasos:

1. **Login como Encoder**
   - Ir a `/login`
   - Ingresar credenciales de usuario encoder
   - Verificar redirección a `/dashboard`

2. **Navegar al Visualizador**
   - Click en "Visualizador" en el sidebar
   - URL: `/visualizator`
   - **Verificar:**
     - ✅ Página carga correctamente
     - ✅ Header muestra: "Archivo #[ID] - Estado: borrador_encoder"
     - ✅ Badge muestra: "Rol: ENCODER"

3. **Verificar Campos Editables**
   - **Verificar:**
     - ✅ Campos `AT` y `AT_detalle` son editables
     - ✅ Otros campos tienen icono de candado 🔒
     - ✅ Tooltip dice "Este campo solo puede ser editado por [rol]"

4. **Hacer Cambios (Opcional)**
   - Editar campo `AT` en alguna fila
   - **Verificar:**
     - ✅ Aparece indicador: "⚠️ Tienes X cambio(s) sin guardar"
     - ✅ Botón "Guardar Cambios" aparece

5. **Guardar Cambios**
   - Click en "Guardar Cambios"
   - **Verificar:**
     - ✅ Loading state en botón: "Guardando..."
     - ✅ Alert de éxito: "✅ Cambios guardados"
     - ✅ Indicador de cambios desaparece
     - ✅ Botón "Guardar" desaparece

6. **Verificar Botón Submit Aparece**
   - **Verificar:**
     - ✅ Botón verde "✅ Entregar a Finanzas" es visible
     - ✅ Botón está habilitado (no disabled)
     - ✅ Color: `bg-green-600`

7. **Click en Submit (Paso 1 - Modal)**
   - Click en "Entregar a Finanzas"
   - **Verificar Modal Paso 1:**
     - ✅ Modal se abre
     - ✅ Título: "Entregar a Finanzas"
     - ✅ Subtítulo: "Enviarás este archivo al equipo de Finanzas..."
     - ✅ Info muestra: "Archivo GRD ID: #[ID]"
     - ✅ Info muestra: "Destino: Finanzas"
     - ✅ Pregunta: "¿Estás seguro de entregar este archivo?"
     - ✅ Botones: "Cancelar" y "Continuar"

8. **Cancelar Modal (Prueba 1)**
   - Click en "Cancelar"
   - **Verificar:**
     - ✅ Modal se cierra
     - ✅ Nada cambia (estado sigue igual)
     - ✅ Botón Submit sigue visible

9. **Abrir Modal de Nuevo**
   - Click en "Entregar a Finanzas"
   - Click en "Continuar"

10. **Modal Paso 2 - Confirmación Final**
    - **Verificar Modal Paso 2:**
      - ✅ Icono amarillo de advertencia
      - ✅ Título: "⚠️ Confirmación Final"
      - ✅ Lista de advertencias:
        - "No podrás editar el archivo hasta que Finanzas lo revise"
        - "El archivo cambiará de estado automáticamente"
        - "Recibirás una notificación cuando sea procesado"
        - "El equipo de Finanzas podrá editar sus campos correspondientes"
      - ✅ Pregunta: "¿Confirmas que deseas entregar el archivo #[ID]?"
      - ✅ Botones: "Volver" y "Confirmar y Entregar"

11. **Volver (Prueba 2)**
    - Click en "Volver"
    - **Verificar:**
      - ✅ Regresa a Modal Paso 1
      - ✅ Puede cancelar o continuar de nuevo

12. **Confirmar Submit**
    - Click en "Continuar" nuevamente
    - Click en "Confirmar y Entregar"
    - **Verificar:**
      - ✅ Botón cambia a "Entregando..." con spinner
      - ✅ Botón queda disabled
      - ✅ Alert de éxito: "✅ Archivo entregado a Finanzas exitosamente"
      - ✅ Redirección automática a `/dashboard`

13. **Verificar Estado en Base de Datos**
    ```sql
    SELECT id_grd_oficial, episodio, estado 
    FROM grd_fila 
    WHERE id_grd_oficial = [ID_DEL_ARCHIVO]
    LIMIT 1;
    ```
    - **Verificar:**
      - ✅ Estado cambió a `pendiente_finance`

14. **Verificar que Encoder YA NO puede editar**
    - Navegar nuevamente a `/visualizator`
    - **Verificar:**
      - ✅ Error: "No tienes acceso a este archivo en estado: pendiente_finance"
      - ✅ Botón "Volver al Dashboard"

---

## 🧪 TEST 2: BOTÓN SUBMIT FINANCE

### Escenario: Finance entrega archivo a Administración

**Usuario:** `finance`  
**Estado inicial:** `pendiente_finance` (resultado del Test 1)  
**Estado esperado final:** `pendiente_admin`

### Pasos:

1. **Cerrar Sesión de Encoder**
   - Click en "Cerrar Sesión" en TopNav
   - Verificar redirección a `/login`

2. **Login como Finance**
   - Ingresar credenciales de usuario finance
   - Verificar redirección a `/dashboard`

3. **Navegar al Visualizador**
   - Click en "Visualizador" en el sidebar
   - URL: `/visualizator`
   - **Verificar:**
     - ✅ Página carga correctamente
     - ✅ Header muestra: "Archivo #[ID] - Estado: pendiente_finance"
     - ✅ Badge muestra: "Rol: FINANCE"

4. **Verificar Campos Editables**
   - **Verificar:**
     - ✅ Campos `validado`, `n_folio`, `estado_rn`, `monto_rn`, `documentacion` son editables
     - ✅ Campos de Encoder (`AT`, `AT_detalle`) están bloqueados 🔒
     - ✅ Campos de SIGESA están bloqueados 🔒

5. **Hacer Cambios en Campos de Finance**
   - Editar campo `validado` → "Sí"
   - Editar campo `n_folio` → 12345
   - **Verificar:**
     - ✅ Aparece indicador: "⚠️ Tienes 2 cambio(s) sin guardar"
     - ✅ Botón "Guardar Cambios" aparece

6. **Verificar Estado Cambia a borrador_finance**
   - Recargar página (F5)
   - **Verificar:**
     - ✅ Browser muestra alerta: "Tienes cambios sin guardar"
     - ✅ Cancelar recarga
   
   - Guardar cambios
   - **Verificar:**
     - ✅ Alert de éxito
     - ✅ Estado en BD cambió a `borrador_finance` (auto-cambio al editar)

7. **Verificar Botón Submit Aparece**
   - **Verificar:**
     - ✅ Botón púrpura "📊 Entregar a Administración" es visible
     - ✅ Color: `bg-purple-600`
     - ✅ Botón está habilitado

8. **Click en Submit (Paso 1 - Modal)**
   - Click en "Entregar a Administración"
   - **Verificar Modal Paso 1:**
     - ✅ Título: "Entregar a Administración"
     - ✅ Subtítulo: "Enviarás este archivo al equipo de Administración..."
     - ✅ Info muestra: "Destino: Administración"

9. **Confirmar Submit**
   - Click en "Continuar"
   - **Verificar Modal Paso 2:**
     - ✅ Advertencia: "El administrador podrá aprobar, rechazar o solicitar cambios"
   - Click en "Confirmar y Entregar"
   - **Verificar:**
     - ✅ Loading: "Entregando..."
     - ✅ Alert: "✅ Archivo entregado a Administración exitosamente"
     - ✅ Redirección a `/dashboard`

10. **Verificar Estado en Base de Datos**
    ```sql
    SELECT id_grd_oficial, episodio, estado 
    FROM grd_fila 
    WHERE id_grd_oficial = [ID_DEL_ARCHIVO]
    LIMIT 1;
    ```
    - **Verificar:**
      - ✅ Estado cambió a `pendiente_admin`

11. **Verificar que Finance YA NO puede editar**
    - Navegar nuevamente a `/visualizator`
    - **Verificar:**
      - ✅ Error: "No tienes acceso a este archivo en estado: pendiente_admin"

---

## 🧪 TEST 3: VALIDACIONES

### Test 3.1: Submit con Cambios Sin Guardar

1. Login como Encoder
2. Cargar nuevo archivo (o cambiar estado a `borrador_encoder` en BD)
3. Editar un campo pero NO guardar
4. Click en "Entregar a Finanzas"
5. **Verificar:**
   - ✅ Modal NO se abre
   - ✅ Error: "Debes guardar los cambios antes de entregar"

### Test 3.2: Protección de Navegación (beforeunload)

1. Login como Encoder
2. Editar un campo
3. Presionar F5 (recargar página)
4. **Verificar:**
   - ✅ Browser muestra alerta: "Tienes cambios sin guardar"
   - ✅ Puede cancelar o continuar
5. Cerrar pestaña (Ctrl+W)
6. **Verificar:**
   - ✅ Browser muestra alerta antes de cerrar

### Test 3.3: Botón Solo Visible en Estados Correctos

**Encoder:**
- Login como encoder
- Solo debe ver botón en estado `borrador_encoder`
- NO debe ver botón en: `pendiente_finance`, `borrador_finance`, `pendiente_admin`

**Finance:**
- Login como finance
- Debe ver botón en estados `pendiente_finance` y `borrador_finance`
- NO debe ver botón en: `borrador_encoder`, `pendiente_admin`

---

## 📊 Checklist Final

### Bloque 4 - Submit Encoder ✅
- [ ] Botón verde "Entregar a Finanzas" visible en `borrador_encoder`
- [ ] Modal de 2 pasos funciona correctamente
- [ ] Validación de cambios sin guardar
- [ ] API POST `/api/v1/grd/[grdId]/submit-encoder` responde 200
- [ ] Estado cambia de `borrador_encoder` → `pendiente_finance`
- [ ] Redirección a `/dashboard` tras éxito
- [ ] Encoder pierde acceso después del submit

### Bloque 5 - Submit Finance ✅
- [ ] Botón púrpura "Entregar a Administración" visible en `pendiente_finance` y `borrador_finance`
- [ ] Modal reutiliza SubmitConfirmModal con handler condicional
- [ ] Finance puede editar sus 5 campos
- [ ] Estado cambia a `borrador_finance` al editar
- [ ] API POST `/api/v1/grd/[grdId]/submit-finance` responde 200
- [ ] Estado cambia de `borrador_finance` → `pendiente_admin`
- [ ] Finance pierde acceso después del submit

### Validaciones Generales ✅
- [ ] beforeunload funciona (F5, cerrar tab)
- [ ] Indicador de cambios sin guardar aparece
- [ ] Botón Submit solo visible sin cambios pendientes
- [ ] Roles correctos pueden acceder a estados correctos
- [ ] TypeScript build sin errores

---

## 🐛 Troubleshooting

### Error: "No hay ningún archivo en proceso"
**Solución:** Asegúrate de tener un archivo en estado activo (`borrador_encoder`, `pendiente_finance`, etc.)

### Error: "No se pudo obtener el rol del usuario"
**Solución:** Verifica que el usuario tenga un registro en `public.users` con `auth_id` correcto

### Botón Submit no aparece
**Solución:** 
- Verificar que no hay cambios sin guardar
- Verificar que el estado es correcto para el rol
- Abrir DevTools → Console para ver errores

### Modal no se cierra
**Solución:** Verificar que `isSubmitting` vuelve a `false` después del submit

### Error 401 en API
**Solución:** Verificar que la sesión está activa y el token es válido

---

## 📝 Notas

- Los cambios sin guardar se pierden si se recarga la página (comportamiento esperado)
- Solo puede haber UN archivo en flujo activo a la vez
- Los estados de workflow son irreversibles (excepto `rechazado` que volverá a `borrador_encoder`)
- El admin aún no puede aprobar/rechazar (Bloque 6 pendiente)

---

## ✅ Resultado Esperado

Si todos los tests pasan:
- ✅ Workflow Encoder → Finance funciona correctamente
- ✅ Finance → Admin funciona correctamente
- ✅ Validaciones de seguridad funcionan
- ✅ UI es intuitiva y clara
- ✅ **Listo para continuar con Bloque 6 (Admin buttons)**

---

**Última actualización:** 4 de Noviembre, 2025
