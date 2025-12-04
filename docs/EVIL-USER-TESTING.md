# EVIL USER TESTING - Pruebas de Seguridad y Límites

**Fecha:** 3 de Diciembre, 2025  
**Objetivo:** Encontrar todas las vulnerabilidades, fugas de seguridad y problemas de usabilidad  
**Metodología:** Comportarse como el peor usuario posible

---

## 📋 Índice

1. [Testing de Autenticación y Roles](#1-testing-de-autenticación-y-roles)
2. [Testing de Control de Acceso (Authorization)](#2-testing-de-control-de-acceso-authorization)
3. [Testing de Validación de Datos](#3-testing-de-validación-de-datos)
4. [Testing de Workflow y Estados](#4-testing-de-workflow-y-estados)
5. [Testing de APIs Directas](#5-testing-de-apis-directas)
6. [Testing de Upload de Archivos](#6-testing-de-upload-de-archivos)
7. [Testing de Edición de Datos](#7-testing-de-edición-de-datos)
8. [Testing de Exportación](#8-testing-de-exportación)
9. [Testing de Performance y Límites](#9-testing-de-performance-y-límites)
10. [Testing de UI/UX](#10-testing-de-uiux)

---

## 🎯 Resumen de Prioridades

### 🔴 CRÍTICO - Seguridad
- Bypass de autenticación
- Escalación de privilegios
- SQL Injection
- Acceso no autorizado a datos
- Manipulación de estados

### 🟡 IMPORTANTE - Integridad de Datos
- Validación de inputs
- Límites de archivos
- Datos inválidos
- Estados inconsistentes

### 🟢 MEJORAS - UX/UI
- Mensajes de error
- Manejo de edge cases
- Performance con datos masivos

---

## 1. Testing de Autenticación y Roles

### 1.1 Bypass de Login

#### TEST-AUTH-001: Acceso sin login
- **Descripción:** Intentar acceder directamente a rutas protegidas
- **Pasos:**
  1. Cerrar sesión completamente
  2. Ir directo a: `https://dataunion.vercel.app/dashboard`
  3. Ir directo a: `https://dataunion.vercel.app/visualizator`
  4. Ir directo a: `https://dataunion.vercel.app/dashboard/users`
- **Resultado Esperado:** Redirección a `/login`
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-AUTH-002: Token expirado
- **Descripción:** Usar sesión después de que expire
- **Pasos:**
  1. Login normal
  2. Esperar > 1 hora (o manipular token en localStorage)
  3. Intentar hacer una acción (guardar, submit)
- **Resultado Esperado:** Error 401 + logout automático
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-AUTH-003: Múltiples sesiones simultáneas
- **Descripción:** Login en 2 navegadores diferentes
- **Pasos:**
  1. Login como `encoder@dataunion.cl` en Chrome
  2. Login como mismo usuario en Firefox
  3. Intentar editar misma fila en ambos
- **Resultado Esperado:** Sistema debería manejar concurrencia
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-AUTH-004: Manipulación de localStorage
- **Descripción:** Editar datos de sesión manualmente
- **Pasos:**
  1. Login como encoder
  2. Abrir DevTools > Application > Local Storage
  3. Buscar variable de rol/usuario
  4. Cambiar rol a "admin" manualmente
  5. Refrescar página
- **Resultado Esperado:** Sistema ignora cambio local, valida en backend
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-AUTH-005: SQL Injection en login
- **Descripción:** Intentar inyectar SQL en formulario de login
- **Pasos:**
  1. Ir a `/login`
  2. Email: `' OR '1'='1' --`
  3. Password: `cualquiercosa`
  4. Intentar login
- **Resultado Esperado:** Error de validación, no ejecuta query
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

---

## 2. Testing de Control de Acceso (Authorization)

### 2.1 Escalación de Privilegios - Encoder

#### TEST-AUTHZ-001: Encoder accede a gestión de usuarios
- **Descripción:** Encoder intenta acceder a página de admin
- **Pasos:**
  1. Login como `encoder@dataunion.cl`
  2. Ir a: `https://dataunion.vercel.app/dashboard/users`
- **Resultado Esperado:** 403 Forbidden o redirección
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-AUTHZ-002: Encoder aprueba archivo vía API
- **Descripción:** Encoder llama API de aprobación directamente
- **Pasos:**
  1. Login como encoder
  2. Abrir DevTools > Console
  3. Ejecutar:
     ```javascript
     fetch('/api/v1/grd/1/review', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ action: 'aprobar' })
     })
     ```
- **Resultado Esperado:** Error 403 - No autorizado
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-AUTHZ-003: Encoder edita campos de Finance
- **Descripción:** Encoder intenta editar `validado`, `n_folio`
- **Pasos:**
  1. Login como encoder en estado `borrador_encoder`
  2. Abrir fila en visualizador
  3. Intentar editar campo `validado` (debería estar bloqueado)
  4. Si está bloqueado en UI, intentar vía API:
     ```javascript
     fetch('/api/v1/grd/rows/12345', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ validado: true })
     })
     ```
- **Resultado Esperado:** Campo bloqueado en UI + API rechaza con 403
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-AUTHZ-004: Encoder edita en estado pendiente_finance
- **Descripción:** Encoder intenta editar después de Submit
- **Pasos:**
  1. Login como encoder
  2. Subir archivo, editar, hacer Submit
  3. Archivo pasa a `pendiente_finance`
  4. Intentar abrir visualizador
  5. Intentar editar alguna fila
- **Resultado Esperado:** Campos bloqueados + API rechaza cambios
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

### 2.2 Escalación de Privilegios - Finance

#### TEST-AUTHZ-005: Finance edita campos de Encoder
- **Descripción:** Finance intenta editar `AT`, `AT_detalle`
- **Pasos:**
  1. Login como `finanzas@dataunion.cl`
  2. Abrir archivo en `borrador_finance`
  3. Intentar editar campo `AT`
  4. Si bloqueado en UI, intentar vía API:
     ```javascript
     fetch('/api/v1/grd/rows/12345', {
       method: 'PUT',
       body: JSON.stringify({ AT: 'NUEVO_AT' })
     })
     ```
- **Resultado Esperado:** Bloqueado en UI + API rechaza
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-AUTHZ-006: Finance aprueba archivo
- **Descripción:** Finance intenta aprobar sin pasar por Admin
- **Pasos:**
  1. Login como finance
  2. Llamar API:
     ```javascript
     fetch('/api/v1/grd/1/review', {
       method: 'POST',
       body: JSON.stringify({ action: 'aprobar' })
     })
     ```
- **Resultado Esperado:** Error 403 - Solo admin puede aprobar
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

### 2.3 Escalación de Privilegios - Admin

#### TEST-AUTHZ-007: Admin edita datos (debería ser read-only)
- **Descripción:** Admin NO debería poder editar nada
- **Pasos:**
  1. Login como `admin@dataunion.cl`
  2. Abrir archivo en `pendiente_admin`
  3. Verificar que TODOS los campos estén bloqueados
  4. Intentar editar cualquier campo vía API:
     ```javascript
     fetch('/api/v1/grd/rows/12345', {
       method: 'PUT',
       body: JSON.stringify({ AT: 'HACK', validado: false })
     })
     ```
- **Resultado Esperado:** Bloqueado en UI + API rechaza
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

---

## 3. Testing de Validación de Datos

### 3.1 Validación de Inputs Críticos

#### TEST-VAL-001: Campos obligatorios vacíos
- **Descripción:** Intentar guardar fila con campos vacíos
- **Pasos:**
  1. Login como encoder
  2. Editar fila, dejar campos obligatorios vacíos
  3. Intentar guardar
- **Resultado Esperado:** Error de validación
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-VAL-002: XSS en campos de texto
- **Descripción:** Inyectar scripts maliciosos
- **Pasos:**
  1. Editar campo `AT_detalle`
  2. Ingresar: `<script>alert('XSS')</script>`
  3. Guardar
  4. Recargar página y ver si ejecuta
- **Resultado Esperado:** Texto escapado, no ejecuta script
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-VAL-003: SQL Injection en campos
- **Descripción:** Inyectar SQL en campos editables
- **Pasos:**
  1. Editar campo `n_folio`
  2. Ingresar: `'; DROP TABLE grd_fila; --`
  3. Guardar
- **Resultado Esperado:** Valor guardado como string, no ejecuta SQL
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-VAL-004: Números negativos donde no deberían
- **Descripción:** Montos negativos
- **Pasos:**
  1. Editar campo `monto_rn`
  2. Ingresar: `-999999`
  3. Guardar
- **Resultado Esperado:** Error de validación (monto debe ser >= 0)
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-VAL-005: Strings donde deberían ir números
- **Descripción:** Texto en campos numéricos
- **Pasos:**
  1. Editar campo `monto_rn`
  2. Ingresar: `HOLA_MUNDO`
  3. Guardar
- **Resultado Esperado:** Error de tipo de dato
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-VAL-006: Fechas inválidas
- **Descripción:** Fechas fuera de rango
- **Pasos:**
  1. Editar campo de fecha (si existe)
  2. Ingresar: `99/99/9999`
  3. Guardar
- **Resultado Esperado:** Error de validación
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-VAL-007: Emails inválidos
- **Descripción:** Email sin formato correcto
- **Pasos:**
  1. Login como admin
  2. Ir a `/dashboard/users`
  3. Crear usuario con email: `nodot@com`
  4. Crear usuario con email: `sindominio@`
  5. Crear usuario con email: `@solodomain.com`
- **Resultado Esperado:** Error de validación en cada caso
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-VAL-008: Contraseñas débiles
- **Descripción:** Passwords sin requisitos mínimos
- **Pasos:**
  1. Crear usuario con password: `123`
  2. Crear usuario con password: `password`
  3. Crear usuario con password: (vacío)
- **Resultado Esperado:** Error indicando requisitos mínimos
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-VAL-009: Strings extremadamente largos
- **Descripción:** Buffers overflow
- **Pasos:**
  1. Editar campo `AT_detalle`
  2. Ingresar string de 10,000 caracteres
  3. Guardar
- **Resultado Esperado:** Error de límite de caracteres
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-VAL-010: Caracteres especiales
- **Descripción:** Unicode, emojis, caracteres raros
- **Pasos:**
  1. Editar campo `AT_detalle`
  2. Ingresar: `🚀💩🔥 ñáéíóú ™®©`
  3. Guardar y recargar
- **Resultado Esperado:** Caracteres se preservan correctamente
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

---

## 4. Testing de Workflow y Estados

### 4.1 Manipulación de Estados

#### TEST-WF-001: Cambiar estado manualmente vía API
- **Descripción:** Saltar estados del workflow
- **Pasos:**
  1. Login como encoder
  2. Archivo en `borrador_encoder`
  3. Llamar API para cambiar directamente a `aprobado`:
     ```javascript
     fetch('/api/v1/grd/1', {
       method: 'PATCH',
       body: JSON.stringify({ estado: 'aprobado' })
     })
     ```
- **Resultado Esperado:** API rechaza, estados deben seguir flujo
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-WF-002: Submit sin completar campos obligatorios
- **Descripción:** Encoder hace Submit con datos incompletos
- **Pasos:**
  1. Subir archivo
  2. NO editar ningún AT
  3. Hacer clic en "Entregar a Finanzas"
- **Resultado Esperado:** Error indicando qué falta
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-WF-003: Finance Submit sin validar todas las filas
- **Descripción:** Finance entrega sin completar `validado`
- **Pasos:**
  1. Login como finance
  2. Dejar filas sin campo `validado` completado
  3. Hacer Submit a Admin
- **Resultado Esperado:** Error indicando filas sin validar
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-WF-004: Volver a estado anterior
- **Descripción:** Regresar a estado previo sin autorización
- **Pasos:**
  1. Archivo en `pendiente_admin`
  2. Intentar cambiar a `borrador_finance` vía API
- **Resultado Esperado:** API rechaza
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-WF-005: Múltiples archivos en flujo simultáneamente
- **Descripción:** Subir 2 archivos al mismo tiempo
- **Pasos:**
  1. Login como encoder
  2. Subir archivo 1
  3. Sin hacer Submit, intentar subir archivo 2
- **Resultado Esperado:** Error "Ya existe archivo en proceso"
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-WF-006: Aprobar archivo sin revisar
- **Descripción:** Admin aprueba inmediatamente sin abrir
- **Pasos:**
  1. Login como admin
  2. Archivo llega a `pendiente_admin`
  3. Aprobar SIN abrir el visualizador
- **Resultado Esperado:** Sistema permite (decisión de negocio)
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA (agregar confirmación)

#### TEST-WF-007: Rechazar sin motivo
- **Descripción:** Admin rechaza sin escribir razón
- **Pasos:**
  1. Login como admin
  2. Hacer clic en "Rechazar"
  3. Dejar campo de razón vacío
  4. Intentar enviar
- **Resultado Esperado:** Error "Razón obligatoria"
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-WF-008: Editar archivo exportado
- **Descripción:** Modificar archivo después de exportar
- **Pasos:**
  1. Admin exporta archivo → estado `exportado`
  2. Intentar editar cualquier fila vía API
- **Resultado Esperado:** API rechaza, archivo inmutable
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

---

## 5. Testing de APIs Directas

### 5.1 Llamadas sin Autenticación

#### TEST-API-001: GET active-workflow sin token
- **Descripción:** Llamar API sin estar logueado
- **Pasos:**
  1. Abrir terminal o Postman
  2. Ejecutar:
     ```bash
     curl https://dataunion.vercel.app/api/v1/grd/active-workflow
     ```
- **Resultado Esperado:** Error 401 Unauthorized
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-API-002: POST submit-encoder sin token
- **Descripción:** Submit sin autenticación
- **Pasos:**
  ```bash
  curl -X POST https://dataunion.vercel.app/api/v1/grd/1/submit-encoder
  ```
- **Resultado Esperado:** Error 401
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-API-003: GET datos sensibles sin autenticación
- **Descripción:** Acceder a datos de pacientes sin login
- **Pasos:**
  ```bash
  curl https://dataunion.vercel.app/api/v1/grd/rows/12345
  ```
- **Resultado Esperado:** Error 401
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

### 5.2 Llamadas con Token pero Sin Permisos

#### TEST-API-004: Encoder llama API de admin
- **Descripción:** Token válido pero rol incorrecto
- **Pasos:**
  1. Login como encoder (obtener token)
  2. Llamar:
     ```javascript
     fetch('/api/v1/admin/approved-files', {
       headers: { 'Authorization': 'Bearer <token_encoder>' }
     })
     ```
- **Resultado Esperado:** Error 403 Forbidden
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

### 5.3 Inyecciones y Payloads Maliciosos

#### TEST-API-005: SQL Injection en query params
- **Descripción:** Inyectar SQL en parámetros
- **Pasos:**
  ```bash
  curl "https://dataunion.vercel.app/api/v1/grd/rows?episodio=' OR '1'='1"
  ```
- **Resultado Esperado:** Error de validación, no ejecuta
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-API-006: JSON extremadamente grande
- **Descripción:** Payload de 100MB
- **Pasos:**
  1. Crear JSON de 100MB
  2. POST a `/api/v1/grd/rows/12345`
- **Resultado Esperado:** Error 413 Payload Too Large
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-API-007: Rate limiting
- **Descripción:** Hacer 1000 requests en 1 segundo
- **Pasos:**
  1. Script que hace loop de 1000 llamadas
  2. Todas al mismo endpoint
- **Resultado Esperado:** Rate limit después de N requests
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-API-008: IDs inexistentes
- **Descripción:** Acceder a recursos que no existen
- **Pasos:**
  ```bash
  curl https://dataunion.vercel.app/api/v1/grd/999999999
  ```
- **Resultado Esperado:** Error 404 Not Found
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

#### TEST-API-009: Content-Type incorrecto
- **Descripción:** Enviar XML en lugar de JSON
- **Pasos:**
  ```bash
  curl -X POST /api/v1/grd/rows/12345 \
    -H "Content-Type: application/xml" \
    -d "<data>invalid</data>"
  ```
- **Resultado Esperado:** Error 415 Unsupported Media Type
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

---

## 6. Testing de Upload de Archivos

### 6.1 Archivos Maliciosos

#### TEST-UPLOAD-001: Archivo ejecutable (.exe)
- **Descripción:** Subir .exe en lugar de .xlsx
- **Pasos:**
  1. Renombrar `virus.exe` a `datos.xlsx`
  2. Intentar subir
- **Resultado Esperado:** Error de validación de tipo
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-UPLOAD-002: Archivo de 1GB
- **Descripción:** Archivo extremadamente grande
- **Pasos:**
  1. Crear Excel de 1GB (millones de filas)
  2. Intentar subir
- **Resultado Esperado:** Error de límite de tamaño
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-UPLOAD-003: Archivo vacío
- **Descripción:** Excel sin datos
- **Pasos:**
  1. Crear Excel con solo headers, 0 filas
  2. Subir
- **Resultado Esperado:** Error "Archivo vacío"
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-UPLOAD-004: Archivo corrupto
- **Descripción:** Excel dañado/corrupto
- **Pasos:**
  1. Editar bytes de un .xlsx válido con hex editor
  2. Subir
- **Resultado Esperado:** Error de parsing
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-UPLOAD-005: Columnas faltantes
- **Descripción:** Excel sin columnas obligatorias
- **Pasos:**
  1. Crear Excel sin columna "RUT"
  2. Subir
- **Resultado Esperado:** Error "Columna RUT requerida"
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-UPLOAD-006: Columnas extras
- **Descripción:** Excel con 200 columnas
- **Pasos:**
  1. Agregar 100 columnas adicionales no esperadas
  2. Subir
- **Resultado Esperado:** Sistema ignora columnas extra o avisa
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

#### TEST-UPLOAD-007: Caracteres especiales en nombre
- **Descripción:** Archivo con nombre raro
- **Pasos:**
  1. Archivo llamado: `<script>alert('xss')</script>.xlsx`
  2. Subir
- **Resultado Esperado:** Nombre sanitizado
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-UPLOAD-008: Path traversal en nombre
- **Descripción:** Nombre con path malicioso
- **Pasos:**
  1. Archivo: `../../etc/passwd.xlsx`
  2. Subir
- **Resultado Esperado:** Nombre sanitizado, sin path traversal
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-UPLOAD-009: Subir 10 archivos simultáneamente
- **Descripción:** Race condition en validación de archivo único
- **Pasos:**
  1. Abrir 10 tabs
  2. Subir archivo en todas al mismo tiempo
- **Resultado Esperado:** Solo 1 se acepta, otros rechazan
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-UPLOAD-010: Formato incorrecto pero extensión .xlsx
- **Descripción:** Archivo .txt renombrado a .xlsx
- **Pasos:**
  1. Crear `datos.txt` con texto plano
  2. Renombrar a `datos.xlsx`
  3. Subir
- **Resultado Esperado:** Error de formato
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

---

## 7. Testing de Edición de Datos

### 7.1 Edición Concurrente

#### TEST-EDIT-001: 2 usuarios editan misma fila
- **Descripción:** Race condition
- **Pasos:**
  1. Encoder 1 abre fila 100
  2. Encoder 2 abre fila 100
  3. Ambos editan campo `AT`
  4. Ambos guardan
- **Resultado Esperado:** Último en guardar gana, o error de conflicto
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-EDIT-002: Editar y cerrar sin guardar
- **Descripción:** Pérdida de cambios
- **Pasos:**
  1. Editar fila
  2. NO guardar
  3. Cerrar tab/navegador
  4. Reabrir
- **Resultado Esperado:** Cambios perdidos (esperado)
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA (aviso de cambios sin guardar)

#### TEST-EDIT-003: Editar offline
- **Descripción:** Sin conexión a internet
- **Pasos:**
  1. Abrir archivo
  2. Desconectar internet
  3. Intentar editar y guardar
- **Resultado Esperado:** Error de conexión claro
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

### 7.2 Validaciones de Negocio

#### TEST-EDIT-004: Monto mayor a límite FONASA
- **Descripción:** Montos irreales
- **Pasos:**
  1. Editar `monto_rn` a 9,999,999,999
  2. Guardar
- **Resultado Esperado:** Warning o error de límite
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-EDIT-005: Fecha de egreso antes de ingreso
- **Descripción:** Fechas inconsistentes
- **Pasos:**
  1. Fecha ingreso: 2025-01-10
  2. Fecha egreso: 2025-01-05
  3. Guardar
- **Resultado Esperado:** Error de validación
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-EDIT-006: RUT inválido
- **Descripción:** RUT sin dígito verificador correcto
- **Pasos:**
  1. Editar RUT a: 12.345.678-0 (inválido)
  2. Guardar
- **Resultado Esperado:** Error de validación de RUT
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

---

## 8. Testing de Exportación

### 8.1 Exportación Manipulada

#### TEST-EXPORT-001: Exportar sin aprobar
- **Descripción:** Exportar en estado incorrecto
- **Pasos:**
  1. Archivo en `pendiente_admin`
  2. Llamar API:
     ```javascript
     fetch('/api/v1/grd/1/export')
     ```
- **Resultado Esperado:** Error "Archivo no aprobado"
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-EXPORT-002: Encoder exporta archivo
- **Descripción:** Rol sin permisos intenta exportar
- **Pasos:**
  1. Login como encoder
  2. Llamar API de exportación
- **Resultado Esperado:** Error 403 Forbidden
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

#### TEST-EXPORT-003: Exportar archivo inexistente
- **Descripción:** ID inválido
- **Pasos:**
  ```bash
  curl /api/v1/grd/999999/export
  ```
- **Resultado Esperado:** Error 404
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

#### TEST-EXPORT-004: Múltiples exportaciones simultáneas
- **Descripción:** Descargar 100 veces al mismo tiempo
- **Pasos:**
  1. Aprobar archivo
  2. Hacer clic en "Descargar" 100 veces rápido
- **Resultado Esperado:** Sistema maneja concurrencia sin problemas
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-EXPORT-005: Validar integridad de datos exportados
- **Descripción:** Verificar que datos exportados = datos en BD
- **Pasos:**
  1. Exportar archivo
  2. Comparar con datos en base de datos
  3. Verificar que no falten filas
  4. Verificar que no haya datos corruptos
- **Resultado Esperado:** 100% match
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🔴 CRÍTICO

---

## 9. Testing de Performance y Límites

### 9.1 Carga Masiva de Datos

#### TEST-PERF-001: 10,000 filas
- **Descripción:** Archivo con muchas filas
- **Pasos:**
  1. Crear Excel con 10,000 episodios
  2. Subir
  3. Medir tiempo de carga
- **Resultado Esperado:** < 2 minutos
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-PERF-002: 100,000 filas
- **Descripción:** Archivo extremadamente grande
- **Pasos:**
  1. Crear Excel con 100,000 episodios
  2. Intentar subir
- **Resultado Esperado:** Error de límite o timeout claro
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-PERF-003: Scroll infinito en visualizador
- **Descripción:** Performance de AG-Grid con muchos datos
- **Pasos:**
  1. Abrir archivo con 10,000 filas
  2. Hacer scroll rápido
  3. Filtrar columnas
  4. Ordenar por varias columnas
- **Resultado Esperado:** UI responsive, sin lag
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

#### TEST-PERF-004: Múltiples usuarios simultáneos
- **Descripción:** 50 usuarios al mismo tiempo
- **Pasos:**
  1. Simular 50 conexiones simultáneas
  2. Todos editando diferentes filas
- **Resultado Esperado:** Sistema estable, sin crashes
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

### 9.2 Memoria y CPU

#### TEST-PERF-005: Memory leak
- **Descripción:** Uso de memoria crece sin control
- **Pasos:**
  1. Abrir archivo
  2. Editar 100 filas
  3. Guardar
  4. Repetir 50 veces
  5. Monitorear memoria en DevTools
- **Resultado Esperado:** Memoria estable, sin crecimiento infinito
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

---

## 10. Testing de UI/UX

### 10.1 Mensajes de Error

#### TEST-UX-001: Error genérico vs específico
- **Descripción:** Calidad de mensajes de error
- **Pasos:**
  1. Provocar varios errores diferentes
  2. Verificar que mensajes sean claros
- **Resultado Esperado:** Mensajes descriptivos, no "Error 500"
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

#### TEST-UX-002: Loading states
- **Descripción:** Indicadores de carga
- **Pasos:**
  1. Subir archivo grande
  2. Verificar que hay spinner/progress bar
  3. Submit que tarda
  4. Verificar indicador de carga
- **Resultado Esperado:** Siempre hay feedback visual
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

#### TEST-UX-003: Confirmaciones destructivas
- **Descripción:** Eliminar/Rechazar sin confirmación
- **Pasos:**
  1. Admin hace clic en "Rechazar"
  2. Verificar que hay modal de confirmación
- **Resultado Esperado:** Siempre confirma acciones destructivas
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟡 IMPORTANTE

### 10.2 Responsive Design

#### TEST-UX-004: Mobile
- **Descripción:** Probar en celular
- **Pasos:**
  1. Abrir en iPhone/Android
  2. Intentar workflow completo
- **Resultado Esperado:** UI usable (o mensaje "Solo desktop")
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

#### TEST-UX-005: Tablet
- **Descripción:** iPad/tablet
- **Pasos:**
  1. Probar en tablet
  2. Editar filas
- **Resultado Esperado:** UI adaptada
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

#### TEST-UX-006: Resoluciones extremas
- **Descripción:** 4K y 1024x768
- **Pasos:**
  1. Probar en pantalla 4K
  2. Probar en 1024x768
- **Resultado Esperado:** UI legible en ambas
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

### 10.3 Accesibilidad

#### TEST-UX-007: Navegación con teclado
- **Descripción:** Uso sin mouse
- **Pasos:**
  1. Intentar navegar solo con Tab/Enter
  2. Editar filas con teclado
  3. Submit con teclado
- **Resultado Esperado:** Todo funcional
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

#### TEST-UX-008: Screen reader
- **Descripción:** Probar con lector de pantalla
- **Pasos:**
  1. Activar NVDA/JAWS
  2. Intentar navegar
- **Resultado Esperado:** Contenido accesible
- **Resultado Real:** ❌ / ✅ (Por llenar)
- **Severidad:** 🟢 MEJORA

---

## 🎯 Checklist de Ejecución

### Prioridad CRÍTICA (HACER PRIMERO)

- [ ] TEST-AUTH-001: Acceso sin login
- [ ] TEST-AUTH-004: Manipulación de localStorage
- [ ] TEST-AUTH-005: SQL Injection en login
- [ ] TEST-AUTHZ-001: Encoder accede a /dashboard/users
- [ ] TEST-AUTHZ-002: Encoder aprueba archivo vía API
- [ ] TEST-AUTHZ-003: Encoder edita campos de Finance
- [ ] TEST-AUTHZ-004: Encoder edita en estado pendiente_finance
- [ ] TEST-AUTHZ-005: Finance edita campos de Encoder
- [ ] TEST-AUTHZ-007: Admin edita datos (debería ser read-only)
- [ ] TEST-VAL-002: XSS en campos de texto
- [ ] TEST-VAL-003: SQL Injection en campos
- [ ] TEST-WF-001: Cambiar estado manualmente vía API
- [ ] TEST-WF-005: Múltiples archivos en flujo simultáneamente
- [ ] TEST-WF-008: Editar archivo exportado
- [ ] TEST-API-001-003: APIs sin autenticación
- [ ] TEST-API-004: Encoder llama API de admin
- [ ] TEST-API-005: SQL Injection en query params
- [ ] TEST-UPLOAD-001: Archivo ejecutable
- [ ] TEST-UPLOAD-008: Path traversal en nombre
- [ ] TEST-UPLOAD-009: 10 archivos simultáneamente
- [ ] TEST-EXPORT-001: Exportar sin aprobar
- [ ] TEST-EXPORT-002: Encoder exporta archivo
- [ ] TEST-EXPORT-005: Integridad de datos exportados

### Prioridad IMPORTANTE (HACER DESPUÉS)

- [ ] TEST-AUTH-002: Token expirado
- [ ] TEST-AUTH-003: Múltiples sesiones simultáneas
- [ ] TEST-VAL-001-010: Validaciones de inputs
- [ ] TEST-WF-002-007: Validaciones de workflow
- [ ] TEST-API-006-009: Edge cases de API
- [ ] TEST-UPLOAD-002-007: Validaciones de archivos
- [ ] TEST-EDIT-001-006: Edición concurrente y validaciones
- [ ] TEST-EXPORT-004: Múltiples exportaciones
- [ ] TEST-PERF-001-004: Performance y carga

### Prioridad MEJORA (HACER AL FINAL)

- [ ] TEST-VAL-010: Caracteres especiales
- [ ] TEST-WF-006: Aprobar sin revisar
- [ ] TEST-API-008: IDs inexistentes
- [ ] TEST-UPLOAD-006: Columnas extras
- [ ] TEST-EDIT-002-003: UX de edición
- [ ] TEST-EXPORT-003: Exportar archivo inexistente
- [ ] TEST-PERF-005: Memory leak
- [ ] TEST-UX-001-008: UI/UX y accesibilidad

---

## 📊 Plantilla de Reporte de Bug

Cuando encuentres un problema, documentarlo así:

```markdown
## BUG-XXX: [Título descriptivo]

**Severidad:** 🔴 CRÍTICO / 🟡 IMPORTANTE / 🟢 MEJORA
**Test ID:** TEST-XXX-XXX
**Fecha:** DD/MM/YYYY
**Usuario que reporta:** [Nombre]

### Descripción
[Descripción clara del problema]

### Pasos para Reproducir
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### Resultado Esperado
[Lo que debería pasar]

### Resultado Real
[Lo que pasa realmente]

### Evidencia
- Screenshots: [Links]
- Videos: [Links]
- Logs: [Paste logs]
- DevTools Console: [Errores]

### Impacto
[Explicar gravedad y impacto en negocio]

### Recomendación de Fix
[Sugerencia de cómo arreglarlo]
```

---

## 🚀 Próximos Pasos

1. **Día 1:** Ejecutar todos los tests CRÍTICOS
2. **Día 2:** Ejecutar tests IMPORTANTES
3. **Día 3:** Ejecutar tests MEJORA
4. **Día 4:** Documentar todos los bugs encontrados
5. **Día 5:** Priorizar fixes con el equipo
6. **Día 6-10:** Implementar fixes
7. **Día 11:** Re-testing completo

---

## 📝 Notas Finales

- Este documento es VIVO - agregar tests según se descubran nuevos casos
- Priorizar SEGURIDAD sobre UX
- Documentar TODO, incluso si funciona correctamente
- Si algo "parece funcionar pero no estás seguro", agregarlo aquí
- Siempre pensar: "¿Cómo rompería esto un hacker?"

**Último update:** 3 de Diciembre, 2025
