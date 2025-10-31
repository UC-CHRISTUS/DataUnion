# TASK.md - Backlog de Tareas del Proyecto

**Última actualización:** 31 de Octubre, 2025  
**Sprint Actual:** Sprint 3-4 (HU-03)  
**Estado del Proyecto:** En desarrollo activo - Implementando Workflow y Acceso por Rol

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

**Sprint 2** (29/sep/2025)
- **Objetivo:** Refinamiento de arquitectura y diseño, preparación para Sprint 3
- **Duración:** 1 semana
- **Tareas Comprometidas:** 8
- **Tareas Completadas:** 2
- **Tareas En Progreso:** 6

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
- **ClickUp URL:** https://app.clickup.com/t/86acn64dk
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
- **ClickUp URL:** https://app.clickup.com/t/86acn64dx
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

#### HU-003: Acceso restringido por rol + Workflow de Estados 🚧 **PRIORIDAD 1**
- **Estado:** 🚧 En Progreso (ACTIVO) - 30% Completado
- **Sprint:** 3-4
- **Asignado:** Joaquín Peralta
- **Fecha Actualización:** 31/oct/2025 (18:20 hrs)
- **Fecha Inicio:** 31/oct/2025
- **ClickUp URL:** https://app.clickup.com/t/86acn64fw
- **Prioridad:** 🔴 URGENTE (CRÍTICO)
- **Épica:** EP-01
- **Estimación:** 13 puntos (10-12 horas)
- **Descripción:** Implementar workflow completo con estados + acceso restringido por rol
- **Objetivo:** Lograr flujo end-to-end: Encoder → Finance → Admin → Export

**Criterios de Aceptación:**
  - ✅ Sistema de usuarios con 3 roles funcionando (admin, encoder, finance)
  - 🚧 Sistema de 6 estados implementado en `grd_fila`
  - 🚧 Dashboards diferenciados por rol (`/dashboard/encoder`, `/dashboard/finance`, `/dashboard/admin`)
  - 🚧 Encoder solo ve archivos en estado `borrador_encoder`
  - 🚧 Finance solo ve archivos en estado `pendiente_finance` o `borrador_finance`
  - 🚧 Admin solo ve archivos en estado `pendiente_admin` o posteriores
  - 🚧 Bloqueo dinámico de campos según rol y estado
  - 🚧 Botón Submit con doble confirmación (modal de peligro)
  - 🚧 Admin puede aprobar y exportar archivos
  - ⏳ Validaciones de campos obligatorios (FLEXIBLE por ahora)

**Subtareas por FASE:**

### **FASE 1: Base de Datos (Bloqueante) - DÍA 1** ⏰ 2-3 horas - **60% COMPLETADO** ✅
  - ✅ **WORKFLOW-001**: Crear migración para agregar campo `estado` a `grd_fila` (ENUM)
    - ✅ Tipo: `CREATE TYPE workflow_estado AS ENUM ('borrador_encoder', 'pendiente_finance', 'borrador_finance', 'pendiente_admin', 'aprobado', 'exportado')`
    - ✅ Campo: `estado workflow_estado DEFAULT 'borrador_encoder'`
    - ✅ Índice en `estado` para performance
    - ✅ Archivo: `supabase/migrations/20251031_add_estado_workflow_to_grd_fila.sql`
  - ✅ **WORKFLOW-002**: Aplicar migración en Supabase vía MCP
    - ✅ ENUM `workflow_estado` creado exitosamente
    - ✅ Campo `estado` agregado a tabla `grd_fila`
    - ✅ 31 registros existentes actualizados a 'borrador_encoder'
    - ✅ Índices creados: `idx_grd_fila_estado`, `idx_grd_fila_grd_oficial_estado`
  - ✅ **WORKFLOW-003**: Regenerar tipos TypeScript desde Supabase
    - ✅ Archivo `src/types/database.types.ts` actualizado
    - ✅ Tipos incluyen campo `estado` y ENUM `workflow_estado`
    - ✅ Todas las tablas con tipos actualizados
  - ⏳ **WORKFLOW-004**: Crear API POST `/api/v1/grd/[grdId]/submit`
    - Valida que usuario tenga permiso (encoder o finance)
    - Cambia estado según rol actual
    - Retorna nuevo estado
  - ⏳ **WORKFLOW-005**: Testing de API submit (Postman o tests)

### **FASE 2: Middleware y Helpers - DÍA 1** ⏰ 2 horas
  - ⏳ **AUTH-003**: Actualizar `middleware.ts` para validar rol en rutas
    - Proteger `/dashboard/encoder` → solo encoder
    - Proteger `/dashboard/finance` → solo finance
    - Proteger `/dashboard/admin` → solo admin
  - ⏳ **AUTH-004**: Crear HOC `withRole(Component, allowedRoles[])`
    - Ejemplo: `withRole(EncoderDashboard, ['encoder'])`
  - ⏳ **HELPER-001**: Crear helper `getEditableFieldsByRole(role, estado)`
    - Retorna lista de campos editables según rol y estado
    - Encoder: ['AT', 'AT_detalle'] si estado === 'borrador_encoder'
    - Finance: ['validado', 'n_folio', 'estado_rn', 'monto_rn', 'documentacion'] si estado === 'pendiente_finance' o 'borrador_finance'
    - Admin: [] (ninguno editable)

### **FASE 3: Dashboards por Rol - DÍA 2** ⏰ 3 horas
  - ⏳ **DASH-001**: Crear `/dashboard/encoder/page.tsx`
    - Lista archivos en estado `borrador_encoder`
    - Botón "Editar" → Abre ExcelEditor
    - Contador de archivos pendientes
  - ⏳ **DASH-002**: Crear `/dashboard/finance/page.tsx`
    - Lista archivos en estado `pendiente_finance` o `borrador_finance`
    - Botón "Editar" → Abre ExcelEditor (campos de encoder bloqueados)
    - Contador de archivos pendientes
  - ⏳ **DASH-003**: Crear `/dashboard/admin/page.tsx`
    - Lista archivos en estado `pendiente_admin`, `aprobado`, `exportado`
    - Botón "Revisar" → Abre ExcelEditor (read-only)
    - Botón "Aprobar" → Cambia estado a `aprobado`
    - Botón "Exportar" → Genera Excel y cambia estado a `exportado`
    - Filtro por AT (mostrar solo episodios con AT)

### **FASE 4: Editor Adaptativo + Submit - DÍA 3** ⏰ 3-4 horas
  - ⏳ **EDITOR-001**: Modificar `ExcelEditor.tsx` para bloqueo dinámico
    - Recibir props: `userRole`, `currentState`
    - Usar helper `getEditableFieldsByRole()`
    - Aplicar `editable: false` en AG-Grid para campos bloqueados
    - Visual feedback (campos bloqueados en gris)
  - ⏳ **EDITOR-002**: Agregar botón Submit con doble confirmación
    - Modal de confirmación tipo "danger" (como GitHub delete repo)
    - Usuario debe escribir "CONFIRMAR" para continuar
    - Al confirmar → POST a `/api/v1/grd/[grdId]/submit`
    - Redireccionar a dashboard después de submit
  - ⏳ **EDITOR-003**: Agregar indicadores visuales de estado
    - Badge de estado en header del editor
    - Colores por estado (naranja: borrador, azul: pendiente, verde: aprobado)
  - ⏳ **EDITOR-004**: Testing end-to-end del flujo completo
    - Crear usuario encoder de prueba
    - Subir archivo SIGESA → Editar AT → Submit
    - Crear usuario finance de prueba
    - Recibir archivo → Editar campos finance → Submit
    - Login como admin → Revisar → Aprobar → Exportar

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
  - ⚠️ Por ahora NO validaremos campos obligatorios (flexible)
  - ⚠️ No implementaremos concurrencia/bloqueo de filas (Sprint futuro)
  - ⚠️ No implementaremos cálculos de `precio_base_tramo` (Sprint futuro)
  - ✅ Priorizar funcionalidad sobre perfección
  - ✅ Focus en flujo end-to-end funcional

#### HU-004: Visualización de usuarios
- **Estado:** ✅ Completado (Básico) - 100%
- **Sprint:** 2-4
- **Asignado:** Joaquín Peralta
- **Fecha Actualización:** 30/oct/2025
- **Fecha Completado:** 30/oct/2025
- **ClickUp URL:** https://app.clickup.com/t/86acn64gh
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
- **ClickUp URL:** https://app.clickup.com/t/86ach8k5f
- **Nota:** Depende de HU-001 y HU-002 para completarse

---

## 📊 Estadísticas del Proyecto

### Por Estado
- ✅ Completadas: 8 tareas (+2)
- 🚧 En Progreso: 9 tareas (-1)
- ⏳ No Iniciadas: 31 tareas (-1)
- 🚫 Bloqueadas: 1 tarea

### Por Prioridad
- 🔴 ALTA: 22 tareas
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


