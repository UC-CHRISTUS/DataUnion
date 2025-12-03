# TASK.md - Backlog de Tareas del Proyecto

**Última actualización:** 2 de Diciembre, 2025  
**Sprint Actual:** PASO 3 Completado ✅ - Listo para siguiente fase  
**Estado del Proyecto:** Flujo rechazo → corrección → aprobación funcional 100% (PASO 3 E2E validado)

---

## 📋 Índice

1. [Resumen del Sprint Actual](#resumen-del-sprint-actual)
2. [Tareas Completadas](#tareas-completadas)
3. [Tareas En Progreso](#tareas-en-progreso)
4. [Backlog Priorizado](#backlog-priorizado)
5. [Tareas Bloqueadas](#tareas-bloqueadas)
6. [Tareas Técnicas (Tech Debt)](#tareas-técnicas-tech-debt)
7. [Descubierto Durante el Trabajo](#descubierto-durante-el-trabajo)

---

## 🎯 Resumen del Sprint Actual

**Sprint 3-4** (4/nov/2025 - ACTUALIZADO)

- **Objetivo:** Completar HU-03 (Workflow y Acceso por Rol) con flujo end-to-end funcional ✅
- **Duración:** 2-3 semanas estimadas
- **Progreso General:** 87.5% completado (7/8 bloques)
- **Tareas Comprometidas:** 8 bloques definidos
- **Tareas Completadas:** 7 bloques (BLOQUES 1-7) ✅
- **Tareas Pendientes:** 1 bloque (Testing Manual E2E)

**Bloques Completados (100% FUNCIONALES):**

- ✅ **BLOQUE 1:** Migración estado 'rechazado' - Base de datos
- ✅ **BLOQUE 2:** API validar archivo único - Control de workflow
- ✅ **BLOQUE 3:** API Review (Aprobar/Rechazar) - Admin actions
- ✅ **BLOQUE 4:** Botón Submit Encoder - Entregar a Finance
- ✅ **BLOQUE 5:** Botón Submit Finance - Entregar a Admin
- ✅ **BLOQUE 6:** Botones Admin (Aprobar/Rechazar) - Review workflow
- ✅ **BLOQUE 7:** Integración completa con /visualizator - Estado rechazado
- ✅ **BLOQUE 8:** Testing Manual E2E - Validación Completa

**Bloque Completado:**

- ✅ **PASO 3 E2E:** Testing end-to-end del flujo rechazo → corrección → aprobación (VALIDADO 2/dic/2025)

**Regla Crítica del Flujo:**
⚠️ Solo puede existir UN archivo en proceso a la vez. Estados activos: `borrador_encoder`, `pendiente_finance`, `borrador_finance`, `pendiente_admin`, `rechazado`. Estados que liberan el sistema: `exportado`.

---

## ✅ Tareas Completadas

### Sprint 1 - Setup Inicial (Completadas: 22/sep/2025)

#### SETUP-001: Configuración inicial del proyecto

- **Estado:** ✅ Completado
- **Fecha:** 15/sep/2025
- **Asignado:** Equipo completo
- **Descripción:** Setup de Next.js 14 con TypeScript, configuración de Tailwind CSS
- **Subtareas:**
  - ✅ Crear proyecto con `create-next-app`
  - ✅ Configurar TypeScript y tsconfig
  - ✅ Setup de Tailwind CSS
  - ✅ Configurar ESLint y Prettier
  - ✅ Setup de pnpm

#### SETUP-002: Configuración de Supabase

- **Estado:** ✅ Completado
- **Fecha:** 16/sep/2025
- **Asignado:** Cristóbal Cuneo
- **Descripción:** Crear proyecto en Supabase, configurar variables de entorno
- **Subtareas:**
  - ✅ Crear proyecto en Supabase dashboard
  - ✅ Configurar variables de entorno
  - ✅ Setup cliente de Supabase
  - ✅ Crear archivo `.env.local.example`

#### SETUP-003: CI/CD en Vercel

- **Estado:** ✅ Completado
- **Fecha:** 17/sep/2025
- **Asignado:** Sebastián Rosselot
- **Descripción:** Configurar deployment automático en Vercel
- **Subtareas:**
  - ✅ Conectar repositorio GitHub con Vercel
  - ✅ Configurar variables de entorno en Vercel
  - ✅ Setup de preview deployments
  - ✅ Configurar dominios

#### SETUP-004: Estructura base de carpetas

- **Estado:** ✅ Completado
- **Fecha:** 18/sep/2025
- **Asignado:** María Trinidad Gil
- **Descripción:** Crear estructura de carpetas según convenciones de Next.js App Router
- **Subtareas:**
  - ✅ Crear estructura en `src/app`
  - ✅ Crear carpetas de `components/`
  - ✅ Crear carpetas de `lib/`
  - ✅ Setup de `types/` y `constants/`

#### DOC-001: Actualizar Excel de RF

- **Estado:** ✅ Completado (En Revisión)
- **Fecha:** 12/dic/2024 (VENCIDA)
- **Asignado:** Joaquín Peralta, Alexandra San Martín
- **Prioridad:** 🔴 URGENT
- **Descripción:** Actualizar requisitos funcionales en Excel
- **Nota:** Tarea marcada en revisión en ClickUp

#### DOC-002: Cambiar HU y épicas en Excel

- **Estado:** ✅ Completado (En Revisión)
- **Fecha:** 12/dic/2024 (VENCIDA)
- **Asignado:** Joaquín Peralta, Alexandra San Martín
- **Prioridad:** 🔴 URGENT
- **Descripción:** Actualizar historias de usuario y épicas
- **Nota:** Tarea marcada en revisión en ClickUp

---

## 🚧 Tareas En Progreso

### Sprint 2 - Iteración y Refinamiento (En Curso)

#### ARCH-001: Cambiar arquitectura del sistema

- **Estado:** 🚧 En Progreso (En Revisión)
- **Fecha Inicio:** 10/oct/2025
- **Asignado:** Cristóbal Cuneo
- **Descripción:** Revisar y ajustar arquitectura del sistema basado en feedback
- **Progreso:** 80%
- **Subtareas:**
  - ✅ Revisar arquitectura actual
  - ✅ Documentar cambios propuestos
  - 🚧 Implementar nuevos patrones
  - ⏳ Validar con equipo

#### DATA-001: Cambiar modelo de datos

- **Estado:** 🚧 En Progreso (En Revisión)
- **Fecha Inicio:** 12/oct/2025
- **Asignado:** Cristóbal Cuneo, María Trinidad Gil, Matías Adauy, Sebastián Rosselot
- **Prioridad:** 🔴 URGENT
- **Descripción:** Actualizar modelo de datos según nuevos requerimientos
- **Progreso:** 70%
- **Subtareas:**
  - ✅ Revisar modelo actual
  - ✅ Diseñar nuevo esquema
  - 🚧 Crear migraciones
  - ⏳ Testing de migraciones
  - ⏳ Deploy a staging

#### DOC-003: Revisar descripción general del proyecto

- **Estado:** 🚧 En Progreso
- **Fecha Inicio:** 15/oct/2025
- **Asignado:** Sebastián Rosselot
- **Descripción:** Actualizar documento de diseño con descripción del proyecto
- **Progreso:** 50%

#### UI-001: Actualización vista de procesos

- **Estado:** 🚧 En Progreso
- **Fecha Inicio:** 18/oct/2025
- **Asignado:** Alexandra San Martín
- **Prioridad:** 🟡 NORMAL
- **Descripción:** Actualizar visualización de procesos en dashboard
- **Progreso:** 40%

#### DOC-004: Actualización metodología

- **Estado:** 🚧 En Progreso (En Revisión)
- **Fecha Inicio:** 16/oct/2025
- **Asignado:** Alexandra San Martín
- **Prioridad:** 🟡 NORMAL
- **Descripción:** Actualizar documentación de metodología de trabajo
- **Progreso:** 90%
- **Fecha de vencimiento:** 16/oct/2025

#### BACK-001: Tests Endpoints Backend

- **Estado:** 🚧 En Progreso
- **Fecha Inicio:** 27/oct/2025
- **Asignado:** Sebastián Rosselot
- **Prioridad:** 🟡 NORMAL
- **Descripción:** Crear tests para endpoints del backend
- **Progreso:** 30%

---

## 📝 Backlog Priorizado

### Sprint 3 - Auth y Carga de Datos (6/oct/2025)

#### AUTH-001: Sistema de autenticación (Login/Logout)

- **Estado:** ✅ Completado - 100%
- **Sprint:** 3
- **Asignado:** Joaquín Peralta
- **Fecha Completado:** 30/oct/2025
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-01
- **Historia de Usuario:** HU-001, HU-002, HU-003
- **Estimación:** 8 puntos
- **Descripción:** Implementar sistema completo de autenticación con Supabase Auth
- **Criterios de Aceptación:**
  - ✅ Usuario puede hacer login con email/password
  - ✅ Usuario puede hacer logout
  - ✅ Sesión persistente con cookies de Supabase
  - ✅ Redirección correcta según rol y estado de password
  - ✅ Error handling robusto
  - ✅ Integración con tabla `public.users`
  - ✅ Validación de usuarios activos
- **Subtareas:**
  - ✅ Crear componente de Login (`SignIn.tsx`)
  - ✅ API route `/api/auth/signin`
  - ✅ API route `/api/auth/signout`
  - ✅ Middleware de autenticación (simplificado)
  - ✅ Setup de Supabase Auth con @supabase/ssr
  - ✅ Helper functions en `auth-helpers.ts`
  - ✅ Protección de rutas `/dashboard/*`
  - ⏳ Tests unitarios de auth

#### AUTH-002: Sistema de roles y permisos

- **Estado:** ⏳ No Iniciado
- **Sprint:** 3
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-01
- **Historia de Usuario:** HU-002
- **Estimación:** 5 puntos
- **Descripción:** Implementar sistema de roles (admin, codificador, finanzas)
- **Criterios de Aceptación:**
  - RLS policies configuradas en Supabase
  - Middleware valida permisos en cada request
  - UI se adapta según rol del usuario
- **Subtareas:**
  - ⏳ Crear tabla `roles` y `permissions`
  - ⏳ Configurar RLS policies
  - ⏳ Crear middleware de autorización
  - ⏳ Implementar HOC `withRole`
  - ⏳ Tests de permisos

#### HU-005: Carga inicial de Excel desde SIGESA

- **Estado:** ⏳ No Iniciado
- **Sprint:** 3
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-02
- **Estimación:** 13 puntos
- **Descripción:** Implementar funcionalidad de carga de archivos Excel
- **Criterios de Aceptación:**
  - Usuario puede arrastrar y soltar archivo Excel
  - Validación de formato de archivo
  - Progress bar durante procesamiento
  - Feedback claro de errores
  - Archivos guardados en Supabase Storage
- **Subtareas:**
  - ⏳ Crear componente UploadForm
  - ⏳ Implementar parser de Excel (xlsx)
  - ⏳ API route `/api/upload`
  - ⏳ Validación de estructura de archivo
  - ⏳ Progress tracking con WebSockets
  - ⏳ Tests unitarios del parser

#### HU-009: Visualización tipo Excel

- **Estado:** ⏳ No Iniciado
- **Sprint:** 3
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-03
- **Estimación:** 13 puntos
- **Descripción:** Crear interfaz de visualización tipo Excel editable
- **Criterios de Aceptación:**
  - Grid editable con datos de egresos
  - Responsive y performante (1000+ filas)
  - Celdas con validación en tiempo real
  - Copy/paste funcional
  - Ordenamiento y filtrado
- **Subtareas:**
  - ⏳ Evaluar librería Excel (react-spreadsheet vs handsontable)
  - ⏳ Crear componente ExcelViewer
  - ⏳ Implementar validación por celda
  - ⏳ Virtual scrolling para performance
  - ⏳ Auto-guardado cada 30s
  - ⏳ Tests de integración

---

### Sprint 4 - Gestión de Usuarios y Validación (20/oct/2025)

#### HU-001: Creación y gestión de usuarios

- **Estado:** 🚧 En Progreso (ACTIVO) - 70% Completado
- **Sprint:** 2-4
- **Asignado:** Joaquín Peralta
- **Fecha Actualización:** 30/oct/2025
- **ClickUp URL:** <https://app.clickup.com/t/86acn64dk>
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-01
- **Estimación:** 8 puntos
- **Descripción:** CRUD completo de usuarios en el sistema
- **Criterios de Aceptación:**
  - ✅ Admin puede crear usuarios con email/rol
  - ✅ Generación automática de contraseñas temporales
  - ✅ Obligación de cambio de contraseña en primer login
  - ⏳ Admin puede editar usuarios existentes
  - ⏳ Admin puede desactivar (no eliminar) usuarios
  - ✅ Validación de email único
- **Subtareas:**
  - ✅ Crear página `/dashboard/users`
  - ✅ Componente CreateUserModal
  - ✅ API POST `/api/admin/users` (crear usuario)
  - ✅ API GET `/api/admin/users` (listar usuarios)
  - ⏳ API PUT `/api/admin/users/[id]` (editar usuario)
  - ⏳ API DELETE `/api/admin/users/[id]` (desactivar usuario)
  - ⏳ Validación con Zod
  - ⏳ Tests E2E

#### HU-002: Asignación de roles y permisos

- **Estado:** 🚧 En Progreso (ACTIVO)
- **Sprint:** 2-4
- **Asignado:** Joaquín Peralta
- **Fecha Actualización:** 30/oct/2025
- **ClickUp URL:** <https://app.clickup.com/t/86acn64dx>
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-01
- **Estimación:** 5 puntos
- **Descripción:** Permitir asignar y cambiar roles de usuarios
- **Criterios de Aceptación:**
  - Dropdown de roles en UserForm
  - Cambio de rol actualiza permisos inmediatamente
  - Log de cambios de rol en audit_log
- **Subtareas:**
  - 🚧 Componente RoleSelector
  - ⏳ API `/api/users/[id]/role`
  - ⏳ Invalidar sesión al cambiar rol
  - ⏳ Tests de permisos

#### HU-003: Acceso restringido por rol + Workflow de Estados ✅ **CASI COMPLETADO**

- **Estado:** 🚧 En Testing Manual - 87.5% Completado (7/8 bloques)
- **Sprint:** 3-4
- **Asignado:** Joaquín Peralta
- **Fecha Actualización:** 4 de noviembre, 2025 (21:00 hrs)
- **Fecha Inicio:** 31/oct/2025
- **ClickUp URL:** <https://app.clickup.com/t/86acn64fw>
- **Prioridad:** 🔴 URGENTE (CRÍTICO)
- **Épica:** EP-01
- **Estimación:** 18-20 horas totales (distribuidas en 5 fases)
- **Descripción:** Implementar workflow completo con estados + acceso restringido por rol + validación de archivo único
- **Objetivo:** Lograr flujo end-to-end: Encoder → Finance → Admin → Export con restricción de archivo único

**Criterios de Aceptación:**

- ✅ Sistema de usuarios con 3 roles funcionando (admin, encoder, finance)
- ✅ Estado `rechazado` agregado al ENUM (migración aplicada)
- ✅ Encoder solo puede subir archivo si NO hay uno en flujo activo
- ✅ Encoder edita solo campos AT en filas, auto-guardado cada 5s
- ✅ Encoder hace Submit con doble confirmación → pasa a Finance
- ✅ Finance recibe notificación y edita sus campos en filas
- ✅ Finance hace Submit con doble confirmación → pasa a Admin
- ✅ Admin puede aprobar, rechazar (vuelve a Encoder) o exportar
- ✅ Sistema permite re-descarga de archivos exportados
- ✅ Sidebar muestra opciones según rol del usuario
- ✅ Campos bloqueados dinámicamente según estado y rol
- ✅ Sistema de notificaciones simples (banners) entre roles

**Plan de Implementación Completo - 8 BLOQUES:**

**Estado General:** ✅ 7/8 Bloques Completados (87.5%) - Solo queda Testing Manual

---

### **BLOQUE 1: Migración Estado 'rechazado' - ⏰ 30 min** - ✅ **COMPLETADO**

- ✅ **WORKFLOW-001B**: Agregar estado `rechazado` al ENUM
  - **Fecha Completado:** 3/nov/2025
  - **Estado:** ✅ COMPLETADO
  - **Archivo:** `supabase/migrations/20251103_add_rechazado_state.sql`
  - **Detalles:**

      ```sql
      ALTER TYPE workflow_estado ADD VALUE IF NOT EXISTS 'rechazado';
      ```

  - **Resultado:** 7 estados disponibles en total

---

### **BLOQUE 2: API Validar Archivo Único - ⏰ 1 hora** - ✅ **COMPLETADO**

- ✅ **WORKFLOW-002**: API GET `/api/v1/grd/active-workflow`
  - **Fecha Completado:** 3/nov/2025
  - **Estado:** ✅ COMPLETADO
  - **Archivo:** `src/app/api/v1/grd/active-workflow/route.ts`
  - **Descripción:** Verifica si existe archivo en flujo activo
  - **Estados bloqueantes:** `borrador_encoder`, `pendiente_finance`, `borrador_finance`, `pendiente_admin`, `rechazado`
  - **Response:**

      ```json
      {
        "hasActiveWorkflow": true,
        "grdId": 123,
        "estado": "pendiente_finance"
      }
      ```

---

### **BLOQUE 3: API Review (Aprobar/Rechazar) - ⏰ 2 horas** - ✅ **COMPLETADO**

- ✅ **WORKFLOW-003**: API POST `/api/v1/grd/[grdId]/review`
  - **Fecha Completado:** 4/nov/2025
  - **Estado:** ✅ COMPLETADO
  - **Archivo:** `src/app/api/v1/grd/[grdId]/review/route.ts`
  - **Descripción:** Admin aprueba o rechaza archivo
  - **Request body:**

      ```json
      { 
        "action": "approve" | "reject",
        "reason": "Razón del rechazo (opcional para approve, obligatorio para reject)"
      }
      ```

  - **Validaciones:**
    - Usuario debe ser `admin`
    - Estado debe ser `pendiente_admin`
    - Approve → `aprobado`
    - Reject → `rechazado`
    - Reason obligatoria para reject (mínimo 10 caracteres)
  - **Bug Fix:** Cambio de `.single()` a `.limit(1)` para actualización masiva

---

### **BLOQUE 4: Botón Submit Encoder - ⏰ 2 horas** - ✅ **COMPLETADO**

- ✅ **WORKFLOW-004**: Implementar botón "Entregar a Finanzas"
  - **Fecha Completado:** 4/nov/2025
  - **Estado:** ✅ COMPLETADO
  - **Archivo:** `src/components/ExcelEditor.tsx`
  - **Funcionalidad:**
    - Botón visible solo en estados: `borrador_encoder`, `rechazado`
    - Texto: "Entregar" o "Reenviar" según estado
    - Doble confirmación con modal `SubmitConfirmModal`
    - Handler: `handleSubmitToFinance()`
    - API llamada: `POST /api/v1/grd/[grdId]/submit-encoder`
    - Transición: `borrador_encoder` → `pendiente_finance`

---

### **BLOQUE 5: Botón Submit Finance - ⏰ 1.5 horas** - ✅ **COMPLETADO**

- ✅ **WORKFLOW-005**: Implementar botón "Entregar a Administración"
  - **Fecha Completado:** 4/nov/2025
  - **Estado:** ✅ COMPLETADO
  - **Archivo:** `src/components/ExcelEditor.tsx`
  - **Funcionalidad:**
    - Botón visible solo en estados: `pendiente_finance`, `borrador_finance`
    - Doble confirmación con modal `SubmitConfirmModal`
    - Handler: `handleSubmitToAdmin()`
    - API llamada: `POST /api/v1/grd/[grdId]/submit-finance`
    - Transición: `borrador_finance` → `pendiente_admin`
  - **Nota:** Validación de campo `validado` temporalmente comentada para testing

---

### **BLOQUE 6: Botones Admin (Aprobar/Rechazar) - ⏰ 2 horas** - ✅ **COMPLETADO**

- ✅ **WORKFLOW-006**: Implementar botones Admin con RejectModal
  - **Fecha Completado:** 4/nov/2025 (20:30 hrs)
  - **Estado:** ✅ COMPLETADO
  - **Archivos:**
    - `src/components/ExcelEditor.tsx` (handlers y UI)
    - `src/components/RejectModal.tsx` (modal completo)
  - **Funcionalidad:**
    - Botones visibles solo si: `role='admin'` AND `estado='pendiente_admin'`
    - **Botón "✅ Aprobar Archivo":**
      - Handler: `handleApprove()`
      - API: `POST /api/v1/grd/[grdId]/review` con `{ action: 'approve' }`
      - Transición: `pendiente_admin` → `aprobado`
    - **Botón "❌ Rechazar Archivo":**
      - Handler: `handleReject(reason: string)`
      - Abre modal `RejectModal`
      - Validación: razón mínimo 10 caracteres
      - API: `POST /api/v1/grd/[grdId]/review` con `{ action: 'reject', reason }`
      - Transición: `pendiente_admin` → `rechazado`
    - Estados: `isApproving`, `isRejecting`, `approveError`
    - Loading states con spinners
    - Error handling con mensajes descriptivos
  - **Git:** Commit 48b6c9f - "feat: Add Admin approve/reject buttons with RejectModal (BLOQUE 6)"

---

### **BLOQUE 7: Integración con /visualizator - ⏰ 1 hora** - ✅ **COMPLETADO**

- ✅ **WORKFLOW-007**: Soportar estado 'rechazado' en visualizador
  - **Fecha Completado:** 4/nov/2025 (20:45 hrs)
  - **Estado:** ✅ COMPLETADO
  - **Archivos:**
    - `src/app/visualizator/page.tsx` (query y allowedStates)
    - `src/components/ExcelEditor.tsx` (isFieldEditable y alerta)
  - **Funcionalidad:**
    - **Query actualizado:** incluye estado `rechazado` en `IN` clause
    - **allowedStates para encoder:** `['borrador_encoder', 'rechazado']`
    - **Alerta de rechazo:** Banner rojo cuando `estado='rechazado'`
      - Título: "⚠️ Archivo Rechazado por el Administrador"
      - Descripción: Instrucciones para corregir y reenviar
    - **isFieldEditable():** permite edición de AT cuando `estado='rechazado'`
    - **Botón Submit:** cambia texto a "Reenviar" cuando `estado='rechazado'`
    - **TypeScript:** actualizado tipo `estado` para incluir 'rechazado'
  - **Git:** Commit f0c0cce - "feat: Add 'rechazado' state support in visualizator (BLOQUE 7)"

---

### **BLOQUE 8: Testing Manual E2E - ⏰ 2-3 horas** - ✅ **COMPLETADO**

- ✅ **WORKFLOW-008**: Testing end-to-end completo
  - **Fecha Completado:** 2 de Diciembre, 2025
  - **Estado:** ✅ COMPLETADO
  - **Documento:** `TEST-FLUJO-E2E.md` (referencia)
  - **Descripción:** Testing manual validado de ambos flujos
  - **Flujos testeados:**
      1. ✅ **FLUJO 1 (Happy Path):** Encoder → Finance → Admin → Approve ✅
      2. ✅ **FLUJO 2 (Rechazo):** Admin Reject → Encoder Fix → Resubmit → Approve ✅
  - **Validaciones completadas:**
    - ✅ Archivo único validado
    - ✅ Permisos de edición por rol y estado
    - ✅ Transiciones de estado correctas
    - ✅ Modales de confirmación funcionando
    - ✅ Alerta de rechazo visible para encoder
    - ✅ Botones visibles según rol y estado
    - ✅ Loading states y error handling
  - **Resultado:** PASO 3 E2E validado completamente

---

### **RESUMEN DE IMPLEMENTACIÓN:**

| Bloque | Descripción | Estimación | Estado | Fecha | Commit |
|--------|-------------|-----------|--------|-------|--------|
| BLOQUE 1 | Migración 'rechazado' | 30 min | ✅ | 3/nov | - |
| BLOQUE 2 | API archivo único | 1 hora | ✅ | 3/nov | - |
| BLOQUE 3 | API Review (Admin) | 2 horas | ✅ | 4/nov | - |
| BLOQUE 4 | Submit Encoder | 2 horas | ✅ | 4/nov | - |
| BLOQUE 5 | Submit Finance | 1.5 horas | ✅ | 4/nov | - |
| BLOQUE 6 | Admin Approve/Reject | 2 horas | ✅ | 4/nov | 48b6c9f |
| BLOQUE 7 | Visualizator integration | 1 hora | ✅ | 4/nov | f0c0cce |
| BLOQUE 8 | Testing E2E | 2-3 horas | ⏳ | Pendiente | - |
| **TOTAL** | - | **12-13 hrs** | **87.5%** | - | - |

---

### **TECH DEBT IDENTIFICADO:**

| BLOQUE 8 | Testing E2E | 2-3 horas | ✅ | 2/dic | - |` en submit-finance
  - Actualmente comentada (líneas 102-110)
  - Razón: Permitir testing sin bloqueos
  - Prioridad: Media
  - Estimación: 15 minutos

  - ⏳ **WORKFLOW-008**: Modificar API POST `/api/v1/sigesa/upload`
    - **Estado:** ⏳ NO INICIADO
    - **Estimación:** 1 hora
    - **Descripción:** Validar que NO exista archivo en flujo activo antes de subir
    - **Cambios:**
      - Llamar a `GET /api/v1/grd/active-workflow`
      - Si `hasActiveWorkflow === true`: retornar Error 409 (Conflict)
      - Mensaje: "Ya existe un archivo en proceso. Completa el flujo actual antes de subir uno nuevo."

---

### **FASE 3: Modificación de Componentes Existentes - ⏰ 5-6 horas** - **0% COMPLETADO**

- ⏳ **UI-002**: Modificar `FileUpload.tsx` - Validación de archivo único
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 1.5 horas
  - **Archivo:** `src/components/FileUpload.tsx`
  - **Cambios:**
    - Agregar `useEffect` para llamar a `GET /api/v1/grd/active-workflow`
    - Si `hasActiveWorkflow === true`:
      - Mostrar banner: "⚠️ Ya existe un archivo en proceso (Estado: {estado})"
      - Deshabilitar dropzone y botón de carga
    - Si `hasActiveWorkflow === false`: permitir carga normal

- ⏳ **UI-003**: Modificar `Sidebar.tsx` - Menú dinámico por rol
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 2 horas
  - **Archivo:** `src/components/Sidebar.tsx`
  - **Cambios:**
    - Agregar `useEffect` para obtener rol (`GET /api/auth/session`)
    - Crear lógica condicional de menú según rol:
      - **Encoder:** Dashboard, Subir Archivo, SIGESA, Editor, Norma
      - **Finance:** Dashboard, SIGESA, Editor (solo si hay archivo pendiente)
      - **Admin:** Dashboard, Usuarios, SIGESA, Visualizador
    - Páginas ya existen, solo cambiar visibilidad

- ⏳ **UI-004**: Modificar `ExcelEditor.tsx` - Campos editables dinámicos + Auto-guardado
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 3 horas
  - **Archivo:** `src/components/ExcelEditor.tsx`
  - **Cambios:**
      1. **Agregar prop `role`** para saber qué campos bloquear
      2. **Lógica de bloqueo por rol:**
         - **Encoder:** Solo `AT`, `AT_detalle`, `monto_AT` editables
         - **Finance:** Solo `validado`, `n_folio`, `estado_rn`, `monto_rn`, `documentacion` editables
         - **Admin:** Todo bloqueado (read-only)
      3. **Filtro de estado:**
         - Obtener `grdId` activo del workflow
         - **Encoder:** `estado = 'borrador_encoder'`
         - **Finance:** `estado IN ('pendiente_finance', 'borrador_finance')`
         - **Admin:** `estado IN ('pendiente_admin', 'aprobado')`
      4. **Auto-guardado cada 5 segundos:**
         - `useEffect` con `setInterval`
         - Solo si hay cambios pendientes
         - `PUT /api/v1/grd/rows/[episodio]`
      5. **Botón "Entregar"** (solo Encoder y Finance)

- ⏳ **UI-005**: Crear `SubmitConfirmModal.tsx` - Modal doble confirmación
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 1.5 horas
  - **Archivo a crear:** `src/components/SubmitConfirmModal.tsx`
  - **Funcionalidad:**
    - Modal con 2 pasos de confirmación
    - Paso 1: "¿Estás seguro de entregar?"
    - Paso 2: "⚠️ No podrás editar hasta que finalice"
    - Al confirmar:
      - Si `role === 'encoder'`: `POST /api/v1/grd/[grdId]/submit-encoder`
      - Si `role === 'finance'`: `POST /api/v1/grd/[grdId]/submit-finance`

- ⏳ **UI-006**: Crear `WorkflowAlert.tsx` - Notificaciones simples
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 1 hora
  - **Archivo a crear:** `src/components/WorkflowAlert.tsx`
  - **Funcionalidad:**
    - Banner en dashboard
    - Llamar a `GET /api/v1/grd/active-workflow`
    - Mostrar mensaje según rol:
      - **Finance:** "🔔 Tienes archivo pendiente"
      - **Admin:** "🔔 Tienes archivo pendiente de aprobación"
      - **Encoder:** "⚠️ Admin rechazó tu archivo"

- ⏳ **UI-007**: Crear hook `useWorkflowStatus.ts`
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 30 min
  - **Archivo a crear:** `src/hooks/useWorkflowStatus.ts`
  - **Funcionalidad:** Hook compartido para obtener estado de workflow

---

### **FASE 4: Integración en Páginas Existentes - ⏰ 3-4 horas** - **0% COMPLETADO**

- ⏳ **PAGE-001**: Modificar `/visualizator/page.tsx`
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 2 horas
  - **Archivo:** `src/app/visualizator/page.tsx`
  - **Cambios:**
    - Obtener rol del usuario
    - Pasar prop `role` a `ExcelEditor`
    - Agregar botón "Entregar" (encoder/finance)
    - Agregar botones "Aprobar"/"Rechazar" (admin, si `pendiente_admin`)
    - Agregar filtro "Solo AT = 'S'" (admin, filtro visual)
    - Botón "Exportar" (admin, si `aprobado`)

- ⏳ **PAGE-002**: Modificar `/dashboard/page.tsx`
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 1 hora
  - **Archivo:** `src/app/dashboard/page.tsx`
  - **Cambios:**
    - Agregar `<WorkflowAlert />` al inicio
    - Mostrar tarjetas según rol

- ⏳ **PAGE-003**: Modificar `/sigesa/page.tsx`
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 30 min
  - **Archivo:** `src/app/sigesa/page.tsx`
  - **Cambios:**
    - Asegurar modo read-only estricto
    - Mostrar solo archivo activo en workflow

- ⏳ **PAGE-004**: Modificar `/upload/page.tsx`
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 30 min
  - **Archivo:** `src/app/upload/page.tsx`
  - **Cambios:**
    - Integrar validación de archivo único de `FileUpload` modificado

---

### **FASE 5: Exportación y Cierre de Flujo - ⏰ 2-3 horas** - **0% COMPLETADO**

- ⏳ **EXPORT-001**: Crear/Modificar API GET `/api/v1/grd/[grdId]/export`
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 2 horas
  - **Archivo:** `src/app/api/v1/grd/[grdId]/export/route.ts` (puede existir)
  - **Funcionalidad:**
    - Validar que usuario sea `admin`
    - Validar que archivo esté en estado `aprobado`
    - Generar Excel con 29 columnas formato FONASA
    - Cambiar estado a `exportado` (solo primera vez)
    - Permitir re-descarga sin cambiar estado
    - Retornar archivo para download

- ⏳ **EXPORT-002**: Testing del flujo completo end-to-end
  - **Estado:** ⏳ NO INICIADO
  - **Estimación:** 1 hora
  - **Descripción:** Probar flujo completo: Encoder → Finance → Admin → Export

---

**Bloqueadores:**

- ⚠️ **BLOQUEANTE:** Migración para agregar estado `rechazado` (WORKFLOW-001B)

**Notas Técnicas:**

- ⚠️ **VALIDACIONES DE CAMPOS OBLIGATORIOS DESHABILITADAS** (actualizado 4/nov/2025)
  - **APIs modificadas:** `/api/v1/grd/[grdId]/submit-finance` (líneas comentadas)
  - **Objetivo:** Permitir flujo end-to-end sin bloqueos por validaciones
  - **Razón:** Focus en implementar workflow completo primero, validaciones estrictas después
  - **Tech Debt creado:** TECH-006 (ver sección Tech Debt)
- ✅ Páginas ya existen: `/sigesa`, `/norma`, `/upload`, `/visualizator`, `/dashboard`
- ✅ Componentes ya existen: `SigesaPreview`, `ExcelEditor`, `NormaMinsal`, `FileUpload`, `Sidebar`
- ✅ Focus en modificar lo existente, NO duplicar trabajo
- ✅ Guardado manual con protección beforeunload (auto-guardado ELIMINADO por UX)
- ✅ Doble confirmación en Submit (2 pasos)
- ✅ Notificaciones simples con banners (no emails)
- ✅ Filtro visual de AT no afecta exportación

**Resumen de Archivos a Modificar (NO crear nuevos):**

- `src/components/FileUpload.tsx`
- `src/components/Sidebar.tsx`
- `src/components/ExcelEditor.tsx`
- `src/app/visualizator/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/sigesa/page.tsx`
- `src/app/upload/page.tsx`
- `src/app/api/v1/sigesa/upload/route.ts`
- `src/app/api/v1/grd/[grdId]/rows/route.ts`
- `src/app/api/v1/grd/[grdId]/export/route.ts` (si existe)

**Archivos Nuevos a Crear:**

- `supabase/migrations/20251103_add_rechazado_state.sql`
- `src/app/api/v1/grd/active-workflow/route.ts`
- `src/app/api/v1/grd/[grdId]/submit-encoder/route.ts`
- `src/app/api/v1/grd/[grdId]/submit-finance/route.ts`
- `src/app/api/v1/grd/[grdId]/review/route.ts`
- `src/components/SubmitConfirmModal.tsx`
- `src/components/WorkflowAlert.tsx`
- `src/hooks/useWorkflowStatus.ts`

### **FASE 5: Exportación Final - DÍA 3** ⏰ 1-2 horas

- ⏳ **EXPORT-001**: Crear API POST `/api/v1/grd/[grdId]/export`
  - Valida que usuario sea admin
  - Valida que estado sea `aprobado`
  - Genera Excel con 29 columnas formato FONASA
  - Cambia estado a `exportado`
  - Retorna URL de descarga
- ⏳ **EXPORT-002**: Integrar botón Export en dashboard admin
  - Solo visible si estado === `aprobado`
  - Descarga archivo automáticamente
  - Feedback de éxito

**Bloqueadores:**

- Ninguno actual

**Notas Técnicas:**

- ⚠️ **VALIDACIONES DE CAMPOS OBLIGATORIOS DESHABILITADAS** (actualizado 4/nov/2025)
- ⚠️ No implementaremos concurrencia/bloqueo de filas (Sprint futuro)
- ✅ Focus en flujo end-to-end funcional primero
- ⚠️ No implementaremos cálculos de `precio_base_tramo` (Sprint futuro)
- ✅ Priorizar funcionalidad sobre perfección
- ✅ Focus en flujo end-to-end funcional

#### HU-004: Visualización de usuarios

- **Estado:** ✅ Completado (Básico) - 100%
- **Sprint:** 2-4
- **Asignado:** Joaquín Peralta
- **Fecha Actualización:** 30/oct/2025
- **Fecha Completado:** 30/oct/2025
- **ClickUp URL:** <https://app.clickup.com/t/86acn64gh>
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-01
- **Estimación:** 5 puntos
- **Descripción:** Lista de usuarios activos con filtros
- **Criterios de Aceptación:**
  - ✅ Tabla con todos los usuarios
  - ✅ Visualización de rol y estado
  - ✅ Dashboard de administración funcional
  - ⏳ Filtros por rol y estado (futuro)
  - ⏳ Búsqueda por nombre/email (futuro)
  - ⏳ Paginación server-side (futuro)
  - ✅ Acciones rápidas (crear usuario)
- **Subtareas:**
  - ✅ Componente UserTable básico
  - ✅ Página `/dashboard/users`
  - ✅ Integración con API GET `/api/admin/users`
  - ⏳ Filtros y búsqueda avanzada
  - ⏳ Paginación server-side
  - ⏳ Tests unitarios
- **Nota:** Funcionalidad básica completada. Mejoras futuras: filtros avanzados, búsqueda, y paginación.

#### HU-007: Cruce automático con Norma MINSAL

- **Estado:** ⏳ No Iniciado
- **Sprint:** 4
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-02
- **Estimación:** 13 puntos
- **Descripción:** Implementar lógica de cruce con tabla norma_minsal
- **Criterios de Aceptación:**
  - Cada egreso se cruza por GRD automáticamente
  - Se obtienen: peso_relativo, puntos_corte, descripción
  - Manejo de GRD no encontrados
  - Performance: 1000 cruces en < 10s
- **Subtareas:**
  - ⏳ Crear tabla `norma_minsal` y seeders
  - ⏳ Función `matchGRD(diagnostico, procedimiento)`
  - ⏳ API route `/api/match-grd`
  - ⏳ Batch processing para múltiples registros
  - ⏳ Caching de resultados
  - ⏳ Tests de matching

#### HU-012: Guardado de progreso

- **Estado:** ⏳ No Iniciado
- **Sprint:** 4
- **Asignado:** Por asignar
- **Prioridad:** 🟢 BAJA
- **Épica:** EP-03
- **Estimación:** 5 puntos
- **Descripción:** Auto-guardado de cambios cada 30 segundos
- **Criterios de Aceptación:**
  - Cambios se guardan automáticamente
  - Indicador visual de "Guardando..." / "Guardado"
  - No interrumpe edición del usuario
  - Manejo de conflictos (multiple users)
- **Subtareas:**
  - ⏳ Hook `useAutoSave`
  - ⏳ Debouncing de cambios
  - ⏳ API `/api/egresos/[id]/save`
  - ⏳ Optimistic UI updates
  - ⏳ Tests de concurrencia

#### HU-013: Complemento financiero

- **Estado:** ⏳ No Iniciado
- **Sprint:** 4
- **Asignado:** Por asignar
- **Prioridad:** 🟡 MEDIA
- **Épica:** EP-03
- **Estimación:** 5 puntos
- **Descripción:** Módulo para agregar información financiera
- **Criterios de Aceptación:**
  - Usuario finanzas puede agregar folio
  - Campos adicionales: fecha_factura, observaciones
  - Solo lectura de datos clínicos
- **Subtareas:**
  - ⏳ Crear página `/egresos/[id]/finanzas`
  - ⏳ Componente FinanzasForm
  - ⏳ API `/api/egresos/[id]/finanzas`
  - ⏳ Tests de permisos

#### HU-020: Exportación de Excel final

- **Estado:** ⏳ No Iniciado
- **Sprint:** 4
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-05
- **Estimación:** 8 puntos
- **Descripción:** Exportar archivo Excel en formato FONASA
- **Criterios de Aceptación:**
  - Genera Excel con formato oficial
  - Incluye todos los campos requeridos
  - Validación pre-exportación
  - Download directo del archivo
- **Subtareas:**
  - ⏳ Investigar formato FONASA oficial
  - ⏳ Función `generateExcelFonasa()`
  - ⏳ API `/api/export`
  - ⏳ Validación pre-exportación
  - ⏳ Tests de formato

---

### Sprint 5 - Enriquecimiento y Validaciones (3/nov/2025)

#### HU-006: Validación de datos automática

- **Estado:** ⏳ No Iniciado
- **Sprint:** 5
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-02
- **Estimación:** 8 puntos
- **Descripción:** Motor de validación automática de campos
- **Criterios de Aceptación:**
  - Validación de RUT chileno
  - Validación de códigos CIE-10
  - Validación de fechas lógicas
  - Validación de rangos numéricos
  - Alertas en tiempo real
- **Subtareas:**
  - ⏳ Crear `validation-engine.ts`
  - ⏳ Validators para cada tipo de campo
  - ⏳ API `/api/validate`
  - ⏳ Componente de alertas
  - ⏳ Tests exhaustivos

#### HU-008: Cálculo automático de montos

- **Estado:** ⏳ No Iniciado
- **Sprint:** 5
- **Asignado:** Por asignar
- **Prioridad:** 🟡 MEDIA
- **Épica:** EP-03
- **Estimación:** 8 puntos
- **Descripción:** Cálculo automático de valores financieros
- **Criterios de Aceptación:**
  - Cálculo de valor_grd (peso_relativo * precio_base)
  - Suma de ajustes tecnológicos
  - Cálculo de monto_total
  - Re-cálculo automático al cambiar inputs
  - Precision decimal correcta
- **Subtareas:**
  - ⏳ Función `calculateMontos(egreso)`
  - ⏳ Triggers en cambios de campos
  - ⏳ Tests de fórmulas

#### HU-010: Registro de Ajustes Tecnológicos (AT)

- **Estado:** ⏳ No Iniciado
- **Sprint:** 5
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-03
- **Estimación:** 8 puntos
- **Descripción:** Módulo para seleccionar y aplicar ATs
- **Criterios de Aceptación:**
  - Dropdown con ATs vigentes
  - Selección múltiple
  - Actualización automática de monto_total
  - Validación de vigencia de AT
- **Subtareas:**
  - ⏳ Crear tabla `ajustes_tecnologicos`
  - ⏳ Seeders con ATs oficiales
  - ⏳ Componente ATSelector
  - ⏳ Lógica de suma de ATs
  - ⏳ Tests

#### HU-011: Asignación de precio base por convenio

- **Estado:** ⏳ No Iniciado
- **Sprint:** 5
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-03
- **Estimación:** 5 puntos
- **Descripción:** Módulo para asignar precio base según tipo de convenio
- **Criterios de Aceptación:**
  - Dropdown de convenios (FONASA, GES, NO GES, Privado)
  - Precio base se ajusta automáticamente
  - Tabla maestra de precios por convenio
- **Subtareas:**
  - ⏳ Crear tabla `precios_convenio`
  - ⏳ Componente ConvenioSelector
  - ⏳ Lógica de asignación de precio
  - ⏳ Tests

#### HU-014: Validación automática de outliers

- **Estado:** ⏳ No Iniciado
- **Sprint:** 5
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-04
- **Estimación:** 8 puntos
- **Descripción:** Detectar casos que exceden puntos de corte
- **Criterios de Aceptación:**
  - Comparación con punto_corte_superior/inferior
  - Alerta automática si es outlier
  - Flag visual en la tabla
  - Dashboard de outliers para revisión
- **Subtareas:**
  - ⏳ Función `isOutlier(egreso)`
  - ⏳ Query de outliers
  - ⏳ Página `/outliers`
  - ⏳ Tests

#### HU-016: Alertas de valores fuera de rango

- **Estado:** ⏳ No Iniciado
- **Sprint:** 5
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-04
- **Estimación:** 5 puntos
- **Descripción:** Sistema de alertas para valores inválidos
- **Criterios de Aceptación:**
  - Alerta si días_estadia < 0 o > 365
  - Alerta si montos negativos
  - Alerta si fechas inconsistentes
  - Clasificación por severidad (error, warning, info)
- **Subtareas:**
  - ⏳ Sistema de alertas
  - ⏳ Componente AlertBanner
  - ⏳ Dashboard de alertas
  - ⏳ Tests

#### HU-018: Aprobación/rechazo de registros

- **Estado:** ⏳ No Iniciado
- **Sprint:** 5
- **Asignado:** Por asignar
- **Prioridad:** 🟡 MEDIA
- **Épica:** EP-05
- **Estimación:** 8 puntos
- **Descripción:** Workflow de aprobación para admin
- **Criterios de Aceptación:**
  - Admin puede aprobar/rechazar registros
  - Estados: pendiente, en_revision, aprobado, rechazado
  - Campo de observaciones al rechazar
  - Notificaciones a codificador
- **Subtareas:**
  - ⏳ Componente ApprovalWorkflow
  - ⏳ API `/api/egresos/[id]/approve`
  - ⏳ Sistema de notificaciones
  - ⏳ Tests de workflow

#### HU-019: Filtrado de usuarios con AT vigente

- **Estado:** ⏳ No Iniciado
- **Sprint:** 5
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-05
- **Estimación:** 3 puntos
- **Descripción:** Vista filtrada de egresos con AT aplicado
- **Criterios de Aceptación:**
  - Filtro checkbox "Solo con AT"
  - Lista todos los ATs aplicados
  - Export de reporte con ATs
- **Subtareas:**
  - ⏳ Query con filtro de AT
  - ⏳ Componente de filtro
  - ⏳ Tests

---

### Sprint 6 - Revisión Final y Exportación (17/nov/2025)

#### HU-015: Validación de campos obligatorios

- **Estado:** ⏳ No Iniciado
- **Sprint:** 6
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-04
- **Estimación:** 5 puntos
- **Descripción:** Validación pre-guardado de campos requeridos
- **Criterios de Aceptación:**
  - No permite guardar si faltan campos obligatorios
  - Highlight de campos faltantes
  - Mensaje claro de qué falta
- **Subtareas:**
  - ⏳ Schema de validación con Zod
  - ⏳ Validación en formulario
  - ⏳ Tests

#### HU-017: Visualización administrativa final

- **Estado:** ⏳ No Iniciado
- **Sprint:** 6
- **Asignado:** Por asignar
- **Prioridad:** 🟢 BAJA
- **Épica:** EP-05
- **Estimación:** 5 puntos
- **Descripción:** Dashboard final para administrador
- **Criterios de Aceptación:**
  - Vista consolidada de todos los egresos
  - Resumen de estados
  - Filtros avanzados
  - Exportación masiva
- **Subtareas:**
  - ⏳ Página `/admin/dashboard`
  - ⏳ Componentes de métricas
  - ⏳ Tests

#### HU-021: Revisión de archivo SIGESA original

- **Estado:** ⏳ No Iniciado
- **Sprint:** 6
- **Asignado:** Por asignar
- **Prioridad:** 🔴 ALTA
- **Épica:** EP-05 (nueva)
- **Estimación:** 3 puntos
- **Descripción:** Vista del archivo Excel original cargado
- **Criterios de Aceptación:**
  - Link a archivo original en Supabase Storage
  - Preview del Excel en modal
  - Download del archivo original
- **Subtareas:**
  - ⏳ Componente FilePreview
  - ⏳ API `/api/files/[id]`
  - ⏳ Tests

#### TEST-001: Testing End-to-End completo

- **Estado:** ⏳ No Iniciado
- **Sprint:** 6
- **Asignado:** Equipo completo
- **Prioridad:** 🔴 ALTA
- **Estimación:** 13 puntos
- **Descripción:** Suite completa de tests E2E
- **Criterios de Aceptación:**
  - Cobertura > 70%
  - Tests de flujos críticos
  - Tests de roles y permisos
  - Tests de carga de archivos
  - Tests de exportación
- **Subtareas:**
  - ⏳ Setup Playwright o Cypress
  - ⏳ Tests de autenticación
  - ⏳ Tests de CRUD usuarios
  - ⏳ Tests de carga Excel
  - ⏳ Tests de exportación
  - ⏳ CI/CD con tests

#### DOC-005: Documentación final del proyecto

- **Estado:** ⏳ No Iniciado
- **Sprint:** 6
- **Asignado:** Equipo completo
- **Prioridad:** 🟡 MEDIA
- **Estimación:** 5 puntos
- **Descripción:** Documentación completa para usuarios y desarrolladores
- **Criterios de Aceptación:**
  - README actualizado
  - Manual de usuario
  - Documentación técnica
  - Guías de deployment
- **Subtareas:**
  - ⏳ Actualizar README.md
  - ⏳ Crear Manual de Usuario (PDF)
  - ⏳ Documentar API
  - ⏳ Guía de deployment

---

## 🚫 Tareas Bloqueadas

### BLOCK-001: Mostrar Norma MINSAL en interfaz

- **Estado:** ⏳ Bloqueada
- **Bloqueada por:** Pendiente definición de formato de visualización
- **Asignado:** Matías Adauy
- **Prioridad:** 🟡 MEDIA
- **Descripción:** Mostrar información de Norma MINSAL cruzada
- **Razón de bloqueo:** Cliente debe validar qué campos mostrar
- **Próximo paso:** Reunión con Constanza

---

## 🔧 Tareas Técnicas (Tech Debt)

### TECH-001: Configurar logging centralizado

- **Estado:** ⏳ No Iniciado
- **Prioridad:** 🟡 MEDIA
- **Estimación:** 3 puntos
- **Descripción:** Setup de Winston o Pino para logs
- **Razón:** Mejor debugging y monitoring
- **Subtareas:**
  - ⏳ Setup Winston
  - ⏳ Configurar niveles de log
  - ⏳ Integrar con Vercel logs
  - ⏳ Error tracking (Sentry?)

### TECH-002: Implementar rate limiting

- **Estado:** ⏳ No Iniciado
- **Prioridad:** 🔴 ALTA
- **Estimación:** 3 puntos
- **Descripción:** Proteger endpoints de abuse
- **Razón:** Seguridad
- **Subtareas:**
  - ⏳ Setup Upstash Redis
  - ⏳ Middleware de rate limiting
  - ⏳ Tests

### TECH-003: Setup de Sentry para error tracking

- **Estado:** ⏳ No Iniciado
- **Prioridad:** 🟡 MEDIA
- **Estimación:** 2 puntos
- **Descripción:** Monitoreo de errores en producción
- **Subtareas:**
  - ⏳ Crear proyecto en Sentry
  - ⏳ Integrar SDK
  - ⏳ Configurar source maps

### TECH-004: Optimizar queries de Supabase

- **Estado:** ⏳ No Iniciado
- **Prioridad:** 🟡 MEDIA
- **Estimación:** 5 puntos
- **Descripción:** Mejorar performance de queries
- **Razón:** Tiempo de carga de tablas grandes
- **Subtareas:**
  - ⏳ Analizar queries lentas
  - ⏳ Crear índices necesarios
  - ⏳ Implementar paginación server-side
  - ⏳ Tests de performance

### TECH-005: Implementar caché con React Query

- **Estado:** ⏳ No Iniciado
- **Prioridad:** 🟡 MEDIA
- **Estimación:** 3 puntos
- **Descripción:** Mejorar UX con caché inteligente
- **Subtareas:**
  - ⏳ Setup React Query
  - ⏳ Configurar estrategias de caché
  - ⏳ Invalidación de caché

### TECH-006: Re-habilitar validaciones de campos obligatorios ✅

- **Estado:** ✅ COMPLETADO
- **Fecha Completado:** 5/nov/2025
- **Prioridad:** 🔴 ALTA (BLOQUEABA PRODUCCIÓN)
- **Estimación:** 3 puntos
- **Descripción:** Re-habilitar validaciones comentadas en APIs de submit
- **Contexto:** Deshabilitadas temporalmente para permitir flujo end-to-end sin bloqueos
- **Archivos modificados:**
  - ✅ `src/app/api/v1/grd/[grdId]/submit-finance/route.ts` (validaciones re-habilitadas)
  - **Validación implementada:** Campo `validado` obligatorio en TODAS las filas
- **Criterios de Aceptación:**
  - ✅ Validaciones re-habilitadas en submit-finance
  - ✅ Validación de campo `validado` en todas las filas (no solo primera)
  - ✅ Mensajes de error claros indicando episodios afectados
  - ✅ Muestra primeros 5 episodios + contador total si hay más
  - ⏳ Tests de validación (pendiente)
- **Bloquea:** ❌ Ya no bloquea producción (RESUELTO)
- **Relacionado con:** HU-015 (Validación de campos obligatorios)
- **Mejoras implementadas:**
  - Validación de TODAS las filas (no solo primera)
  - Mensajes descriptivos con episodios afectados
  - Contador total de filas inválidas
  - Hint con lista de episodios (máximo 5 ejemplos)
- **Subtareas:**
  - ✅ Re-habilitar validación en submit-finance
  - ✅ Mejorar validación para revisar todas las filas
  - ✅ Mensajes de error descriptivos
  - ✅ Actualizar comentarios del archivo
  - ⏳ Agregar tests de validación (Sprint 6)
  - ⏳ Documentar campos obligatorios en PLANNING.md (opcional)

### TECH-007: Fix Admin UX - Eliminar Redirección Después de Aprobar ✅

- **Estado:** ✅ COMPLETADO
- **Fecha Completado:** 5/nov/2025 (Tarde)
- **Prioridad:** 🔴 CRÍTICO (BLOQUEABA WORKFLOW ADMIN)
- **Estimación:** 1-2 horas (completado en < 30 min)
- **Descripción:** Eliminar redirección al dashboard después de aprobar/rechazar archivo
- **Contexto:** Admin perdía contexto del archivo aprobado y no podía descargarlo inmediatamente
- **Archivos modificados:**
  - ✅ `src/components/ExcelEditor.tsx` (líneas ~407, ~451, ~1120-1180)
- **Cambios implementados:**
  1. ✅ Reemplazar `router.push('/dashboard')` con `window.location.reload()`
  2. ✅ Agregar botón "Aprobado" (bloqueado) cuando estado='aprobado' o 'exportado'
  3. ✅ Hacer botón "Descargar" condicional (solo visible si aprobado/exportado)
- **Criterios de Aceptación:**
  - ✅ Admin NO es redirigido después de aprobar
  - ✅ Admin NO es redirigido después de rechazar
  - ✅ Página se recarga automáticamente para actualizar estado
  - ✅ Botón "Aprobado" aparece bloqueado cuando estado='aprobado'
  - ✅ Botón "Descargar Excel" solo visible cuando estado='aprobado' o 'exportado'
  - ✅ Admin puede descargar inmediatamente después de aprobar
- **Mejora de UX:**
  - ❌ Antes: Aprobar → Redirect → Dashboard → Buscar archivo → Ver → Descargar (6 pasos)
  - ✅ Ahora: Aprobar → Reload → [Aprobado ✓] [Descargar 📥] → Click Descargar (2 pasos)
- **Documentación:**
  - ✅ `docs/FASE1_ADMIN_UX_FIX.md` creado con testing manual
- **Relacionado con:** BLOQUE 7 (Admin UX), Plan simplificado de 2 fases
- **Subtareas:**
  - ✅ Modificar handleApprove() - eliminar redirect
  - ✅ Modificar handleReject() - eliminar redirect
  - ✅ Agregar botón "Aprobado" bloqueado
  - ✅ Hacer "Descargar" condicional según estado
  - ⏳ Testing manual (FASE 1) - Ver docs/FASE1_ADMIN_UX_FIX.md
  - ✅ FASE 2: Crear página /dashboard/archivos (lista de archivos procesados) - COMPLETADO

### TECH-008: FASE 2 - Lista de Archivos Procesados para Admin ✅

- **Estado:** ✅ COMPLETADO
- **Fecha Completado:** 5/nov/2025 (Tarde)
- **Prioridad:** 🟡 MEDIA (COMPLEMENTA FASE 1)
- **Estimación:** 2-3 horas (completado en ~1 hora con fixes)
- **Descripción:** Crear página simple para que Admin vea todos los archivos aprobados
- **Contexto:** Admin necesita vista consolidada de archivos históricos
- **Archivos creados:**
  - ✅ `src/app/api/v1/admin/approved-files/route.ts` (API nueva)
  - ✅ `src/app/dashboard/archivos/page.tsx` (Página nueva)
  - ✅ `src/app/dashboard/archivos/page.module.css` (Estilos nuevos)
- **Archivos modificados:**
  - ✅ `src/components/Sidebar.tsx` (agregado ítem "Archivos" para admin + fix useEffect duplicado)
  - ✅ `src/app/dashboard/archivos/page.tsx` (eliminado Layout duplicado)
- **Funcionalidad implementada:**
  1. ✅ API GET `/api/v1/admin/approved-files` - Solo archivos APROBADOS
  2. ✅ Página `/dashboard/archivos` - Grid responsive de cards
  3. ✅ Cards simples: nombre, ID GRD, episodios, badge "Aprobado"
  4. ✅ Botón "Descargar" - Ancho completo, solo archivos aprobados
  5. ✅ Ítem "Archivos" en Sidebar (solo admin)
  6. ✅ Sin descripción innecesaria - título limpio
  7. ✅ Fix: Sidebar useEffect duplicado eliminado
  8. ✅ Fix: Layout duplicado eliminado (causaba dos navbars)
- **Criterios de Aceptación:**
  - ✅ Admin puede ver lista de archivos APROBADOS únicamente
  - ✅ Filtrado automático: solo estado 'aprobado'
  - ✅ Cards muestran información clara y completa
  - ✅ Botón "Descargar" funcional (ancho completo)
  - ✅ NO hay botón "Ver" (simplificado)
  - ✅ Responsive: funciona en mobile y desktop
  - ✅ Estado vacío: "No hay archivos aprobados todavía"
  - ✅ Error handling: banner rojo si falla carga
  - ✅ Sin duplicación de navbars
  - ✅ Sidebar sin bugs de renderizado
- **Mejora de UX:**
  - ✅ Vista centralizada solo de archivos aprobados
  - ✅ Descarga directa sin navegación extra
  - ✅ Simple y efectivo: THE SIMPLER THE BETTER
  - ✅ Etiqueta "Episodios" más descriptiva que "Total filas"
- **Bugs corregidos:**
  - ✅ Sidebar: useEffect duplicado causaba doble fetch
  - ✅ Layout: Componente Layout duplicado causaba dos navbars
  - ✅ API: Cambiado de múltiples estados a solo 'aprobado'
  - ✅ UI: Eliminado botón "Ver" innecesario
- **Documentación:**
  - ⏳ `docs/FASE2_ADMIN_FILES_LIST.md` (pendiente actualizar con fixes)
- **Relacionado con:** TECH-007 (FASE 1), Admin UX improvements
- **Subtareas:**
  - ✅ Crear API GET /api/v1/admin/approved-files
  - ✅ Filtrar solo estado 'aprobado'
  - ✅ Crear página /dashboard/archivos con grid de cards
  - ✅ Agregar ítem "Archivos" al Sidebar (solo admin)
  - ✅ Eliminar botón "Ver" - solo "Descargar"
  - ✅ Cambiar "Total filas" → "Episodios"
  - ✅ Eliminar descripción del título
  - ✅ Fix: Sidebar useEffect duplicado
  - ✅ Fix: Layout duplicado (dos navbars)
  - ✅ Estilos responsive con CSS modules
  - ✅ Testing manual y corrección de bugs

---

## 💡 Descubierto Durante el Trabajo

### DISC-001: Agregar componentes faltantes frontend

- **Estado:** 🚧 En Progreso
- **Fecha Descubierto:** 20/oct/2025
- **Asignado:** Alexandra San Martín (sin asignar específico aún)
- **Prioridad:** 🟡 MEDIA
- **Descripción:** Completar componentes faltantes del frontend
- **Contexto:** Durante desarrollo se identificaron componentes necesarios
- **Incluye:**
  - Completar Dashboard
  - Vistas protegidas por usuario (HU-003)
  - Revisar vista carga de archivos (HU-005)
  - Vista editor Excel (HU-009, HU-010)
  - Vista perfil de usuario
  - Vista admin (HU-001, HU-002)
  - Preparar para conexiones con API
  - Agregar filtros avanzados

### DISC-002: Levantar backend

- **Estado:** ⏳ No Iniciado
- **Fecha Descubierto:** 20/oct/2025
- **Prioridad:** 🔴 ALTA
- **Descripción:** Implementar API routes y lógica de backend
- **Estimación:** 21 puntos (Epic)
- **Incluye:**
  - API routes para CRUD
  - Lógica de negocio
  - Integración con Supabase
  - Tests de API

### DISC-003: Gestión por Roles Frontend

- **Estado:** 🚧 En Progreso (ACTIVO)
- **Fecha Descubierto:** 18/oct/2025
- **Asignado:** Joaquín Peralta
- **Prioridad:** 🟠 HIGH
- **Descripción:** Implementar lógica de roles en frontend
- **Progreso:** En desarrollo activo - 30/oct/2025
- **Relacionado con:** HU-003, AUTH-002
- **ClickUp URL:** <https://app.clickup.com/t/86ach8k5f>
- **Nota:** Depende de HU-001 y HU-002 para completarse

---

## 📊 Estadísticas del Proyecto

### Por Estado

- ✅ Completadas: 8 tareas
- 🚧 En Progreso: 9 tareas
- ⏳ No Iniciadas: 32 tareas (+1 Tech Debt: TECH-006)
- 🚫 Bloqueadas: 1 tarea

### Por Prioridad

- 🔴 ALTA: 23 tareas (+1: TECH-006)
- 🟡 MEDIA: 15 tareas
- 🟢 BAJA: 3 tareas

### Por Sprint

- Sprint 1: 6/6 (100%) ✅
- Sprint 2: 2/8 (25%) 🚧
- Sprint 3: 1/4 (25%) 🚧 - AUTH-001 ✅
- Sprint 4: 1/9 (11%) 🚧 - HU-004 ✅, HU-001 70%
- Sprint 5: 0/8 (0%) ⏳
- Sprint 6: 0/5 (0%) ⏳

### Velocity Estimada

- **Sprint 1:** 20 puntos completados
- **Sprint 2:** En progreso
- **Sprint 3-4:** 13 puntos completados (AUTH-001: 8pts, HU-004: 5pts)
- **Promedio:** Por determinar

---

## 📝 Notas

- **Actualizar este documento:** Al inicio y fin de cada sprint
- **Mover tareas completadas:** Inmediatamente al finalizar
- **Agregar nuevas tareas descubiertas:** En la sección correspondiente
- **Revisar bloqueos:** En daily standup

**Última actualización:** 30/octubre/2025 por Joaquín Peralta  
**Próxima revisión:** Daily Standup (31/octubre/2025)

---

## 🔧 NOTAS TÉCNICAS

### Estado de Supabase (30/oct/2025)

- **Proyecto ID:** cgjeiyevnlypgghsfemc
- **Región:** US East 1
- **Estado:** ACTIVE_HEALTHY
- **Postgres:** 17.6.1.021

**Tablas existentes:**

- ✅ `sigesa` - Archivos SIGESA
- ✅ `sigesa_fila` - Datos de egresos
- ✅ `norma_minsal` - Tabla normativa GRD
- ✅ `grd_fila` - GRD procesados
- ✅ `ajustes_tecnologias` - Ajustes tecnológicos
- ✅ `users` - Tabla de usuarios con auth (**COMPLETADO 30/oct**)

**Pendiente crear:**

- [ ] Tabla `audit_log` para trazabilidad
- [ ] RLS Policies adicionales para `sigesa` y tablas relacionadas

### Sistema de Autenticación (30/oct/2025)

- ✅ **Login/Logout funcional** con Supabase Auth
- ✅ **Integración dual:** `auth.users` + `public.users`
- ✅ **Gestión de contraseñas temporales:** Auto-generadas (12 chars)
- ✅ **Cambio obligatorio de contraseña** en primer login
- ✅ **RLS Policies configuradas** con función `get_current_user_role()`
- ✅ **Middleware de protección** para rutas `/dashboard/*`
- ✅ **Helper functions:** `getCurrentUser()`, `requireAdmin()`, `requireRole()`
- ✅ **Cliente Supabase:** Usando `@supabase/ssr` para manejo de cookies

**Rutas implementadas:**

- `/login` - Página de login
- `/change-password` - Cambio obligatorio de contraseña
- `/dashboard/users` - Dashboard de administración de usuarios
- `/api/auth/signin` - Autenticación
- `/api/auth/signout` - Cierre de sesión
- `/api/admin/users` - CRUD de usuarios (POST, GET implementados)

**Roles del sistema:**

- `admin` - Administrador (acceso total)
- `encoder` - Codificador (módulo de egresos)
- `finance` - Finanzas (módulo de complemento)

### Package Manager (30/oct/2025)

- ✅ **Actualizado a npm** (eliminado pnpm@10.5.2)
- Correr: `npm install` para instalar dependencias

### Migraciones de Base de Datos

**30/oct/2025:**

- ✅ `20251030_create_users_table.sql` - Creación de tabla users
- ✅ `20251030_add_user_sync_trigger.sql` - Trigger de sincronización auth
- ✅ `20251030_change_user_role_to_english.sql` - Migración roles a inglés
- ✅ `20251030_add_must_change_password_to_users.sql` - Campo must_change_password
- ✅ `20251030_fix_rls_infinite_recursion.sql` - Corrección RLS con SECURITY DEFINER

**31/oct/2025 (HU-03):**

- ✅ `20251031_fix_rls_policies_insert.sql` - Políticas RLS INSERT para encoder/admin en sigesa_fila y grd_fila
- ✅ `20251031_add_estado_workflow_to_grd_fila.sql` - **Sistema de workflow con 6 estados**
  - ENUM `workflow_estado` (borrador_encoder → pendiente_finance → borrador_finance → pendiente_admin → aprobado → exportado)
  - Campo `estado` en tabla `grd_fila`
  - Índices para optimización de queries

**3/nov/2025 (HU-03 - Plan Completo):**

- ⏳ **PENDIENTE:** `20251103_add_rechazado_state.sql` - **Agregar estado `rechazado` al ENUM** (BLOQUEANTE)

---

## 📝 Changelog de TASK.md

### 4 de Noviembre, 2025 (Tarde) - Inicio Bloque 6: Botones Admin

**HU-003: Implementando Approve/Reject para Admin**

**En desarrollo:**

- 🚧 **Bloque 6:** Botones Admin (Aprobar/Rechazar) - EN PROGRESO
  - ✅ Bug fix API review: Cambiado `.single()` por `.limit(1)` + actualización masiva
  - 🚧 Creando componente `RejectModal.tsx` (modal con textarea para razón de rechazo)
  - 🚧 Implementando `handleApprove()` y `handleReject()` en ExcelEditor
  - ⏳ Agregando botones verde (Aprobar) y rojo (Rechazar) para admin
  - ⏳ Integración con API POST `/api/v1/grd/[grdId]/review`

**Estados objetivo:**

- `pendiente_admin` → `aprobado` (Admin aprueba)
- `pendiente_admin` → `rechazado` (Admin rechaza con razón)

**Estimación:** 1 hora
**Progreso:** 20% (API corregida, modal en desarrollo)

**Próximo paso:**

- Completar RejectModal component
- Implementar handlers en ExcelEditor
- Testing manual del flujo completo

---

### 4 de Noviembre, 2025 (Mañana) - Testing Bloques 4 y 5 + Bypass Validaciones

**HU-003: Avance en Testing de Workflow End-to-End**

**Cambios principales:**

- ✅ **Bug fix crítico:** APIs submit-encoder y submit-finance ahora actualizan TODAS las filas (no .single())
- ✅ **Bypass de validaciones:** Comentadas validaciones de campos obligatorios en submit-finance
- ✅ **Tech Debt creado:** TECH-006 (Re-habilitar validaciones antes de producción)
- ✅ **Testing en progreso:** Bloques 4 y 5 funcionales
- ✅ **Documentación actualizada:** Notas técnicas reflejan estado actual del código

**Problemas resueltos:**

1. ❌ "Archivo GRD no encontrado" → ✅ Cambiado `.single()` por `.limit(1)` + actualización masiva
2. ❌ "Faltan campos obligatorios" en Finance → ✅ Validaciones comentadas temporalmente

**Justificación bypass validaciones:**

- **Objetivo:** Completar flujo end-to-end Encoder → Finance → Admin sin bloqueos
- **Alcance:** Solo API submit-finance (líneas 102-110 comentadas)
- **Próximo paso:** Re-habilitar validaciones después de Bloque 8 (Testing completo)
- **Registro:** Tech Debt TECH-006 (Prioridad ALTA, bloquea producción)

**Archivos modificados:**

- `src/app/api/v1/grd/[grdId]/submit-encoder/route.ts` - Fix .single() → múltiples filas
- `src/app/api/v1/grd/[grdId]/submit-finance/route.ts` - Fix .single() + bypass validaciones
- `planning/TASK.md` - Documentación actualizada, TECH-006 agregado

**Estado del testing:**

- ✅ Encoder → Finance: Funcional
- 🧪 Finance → Admin: En testing (validaciones bypasseadas)
- ⏳ Admin → Approve/Reject: Pendiente (Bloque 6)

---

### 3 de Noviembre, 2025 - Actualización Mayor

**HU-003: Plan Completo de Implementación Definido**

**Cambios principales:**

- ✅ **Plan detallado de 5 fases** con 17 tareas nuevas identificadas
- ✅ **Progreso actualizado:** 35% completado (antes 30%)
- ✅ **Estado BLOQUEANTE identificado:** Migración para agregar estado `rechazado`
- ✅ **Revisión completa del codebase:** Identificadas páginas y componentes existentes
- ✅ **Estrategia anti-duplicación:** Modificar existente en lugar de crear nuevo
- ✅ **Estimaciones de tiempo actualizadas:** 18-20 horas totales
- ✅ **Archivos a modificar vs crear:** Lista completa documentada

**Regla de Archivo Único:**

- Solo puede existir UN archivo en proceso a la vez
- Estados activos: `borrador_encoder`, `pendiente_finance`, `borrador_finance`, `pendiente_admin`
- Estados que liberan: `exportado`, `rechazado`

**Tareas Bloqueantes Críticas:**

1. WORKFLOW-001B: Migración estado `rechazado` (30 min) ⚠️
2. WORKFLOW-002: API active-workflow (1 hora)
3. WORKFLOW-008: Modificar upload para validar unicidad (1 hora)

**Páginas Existentes (NO duplicar):**

- `/sigesa` - Vista SIGESA (SigesaPreview)
- `/norma` - Vista Norma MINSAL (NormaMinsal)
- `/upload` - Carga de archivos (FileUpload)
- `/visualizator` - Editor (ExcelEditor)
- `/dashboard` - Dashboard principal
- `/dashboard/users` - Gestión de usuarios

**Componentes Existentes (NO duplicar):**

- `SigesaPreview.tsx`
- `ExcelEditor.tsx`
- `NormaMinsal.tsx`
- `FileUpload.tsx`
- `Sidebar.tsx`
- `Layout.tsx`

**Próxima Acción:** Comenzar FASE 1 completando migración de estado `rechazado`
