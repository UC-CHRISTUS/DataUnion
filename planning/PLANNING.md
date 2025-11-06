# PLANNING.md - Sistema de Gestión de Codificación y Facturación Hospitalaria UC Christus

**Última actualización:** 5 de Noviembre, 2025 (Tarde)  
**Versión:** 1.5  
**Estado del proyecto:** Sprint 3-4 completado (HU-03: Workflow ✅ + Admin UX: FASE 1+2 ✅)

---

## 📋 Índice

1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Objetivos](#objetivos)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Épicas y Features](#épicas-y-features)
6. [Roles de Usuario](#roles-de-usuario)
7. [Modelo de Datos](#modelo-de-datos)
8. [Roadmap y Sprints](#roadmap-y-sprints)
9. [Requisitos No Funcionales](#requisitos-no-funcionales)
10. [Riesgos y Mitigación](#riesgos-y-mitigación)
11. [Convenciones de Código](#convenciones-de-código)
12. [Estructura de Carpetas](#estructura-de-carpetas)

---

## 🎯 Visión General del Proyecto

### Contexto

El sistema reemplazará el proceso actual manual de codificación de egresos hospitalarios que se realiza en Excel. Actualmente:
- Los codificadores descargan datos desde SIGESA (Sistema de Gestión de Salud)
- Cruzan manualmente con la Norma MINSAL para obtener GRD (Grupos Relacionados por Diagnóstico)
- Calculan montos, ajustes tecnológicos y preparan archivos para facturación a FONASA

### Problema a Resolver

- **Proceso manual propenso a errores** en cálculos y transcripción
- **Falta de trazabilidad** en los cambios realizados
- **Tiempo excesivo** en validaciones y cruces de datos
- **Riesgo de inconsistencias** en la facturación
- **Dificultad para auditar** y revisar el proceso

### Solución Propuesta

Plataforma web que automatice:
1. Carga de datos desde SIGESA (Excel)
2. Cruce automático con Norma MINSAL
3. Cálculo automático de montos y ajustes
4. Validación en tiempo real de inconsistencias
5. Interfaz tipo Excel para edición intuitiva
6. Exportación de archivo final para FONASA

---

## � Últimas Actualizaciones (5 de Noviembre, 2025)

### ✅ Sprint 3-4 Completado

**HU-003: Workflow y Acceso por Rol**
- ✅ Sistema de workflow con 7 estados implementado
- ✅ Flujo end-to-end funcional: Encoder → Finance → Admin
- ✅ Restricción de archivo único en proceso
- ✅ 7/8 bloques completados (87.5%)
- ⏳ Pendiente: BLOQUE 8 (Testing manual E2E)

**TECH-006: Validaciones Re-habilitadas**
- ✅ Campo `validado` obligatorio en todas las filas
- ✅ Mensajes descriptivos con episodios afectados
- ✅ Validación mejorada para revisar todas las filas

**TECH-007: FASE 1 - Admin UX Fix**
- ✅ Eliminada redirección después de aprobar/rechazar
- ✅ Admin se queda en página con archivo aprobado
- ✅ Botón "Descargar" aparece automáticamente
- ✅ Botón "Aprobado" bloqueado como indicador visual
- ✅ Mejora de UX: de 6 pasos a 2 pasos para descargar

**TECH-008: FASE 2 - Lista de Archivos Aprobados**
- ✅ Nueva página `/dashboard/archivos` para Admin
- ✅ API GET `/api/v1/admin/approved-files`
- ✅ Grid responsive con cards de archivos
- ✅ Solo archivos aprobados (filtrado simplificado)
- ✅ Botón "Descargar" directo (sin botón "Ver")
- ✅ Ítem "Archivos" agregado al Sidebar (solo admin)

**Bugs Corregidos:**
- ✅ Sidebar: useEffect duplicado eliminado
- ✅ Layout: Componente Layout duplicado eliminado (causaba dos navbars)
- ✅ ExcelEditor: Botón "Descargar" ahora condicional según estado
- ✅ APIs submit: Cambiado `.single()` por actualización masiva de filas

**Próximos Pasos (Sprint 5):**
- Testing manual E2E del workflow completo
- Cruce automático con Norma MINSAL
- Cálculo automático de montos
- Exportación formato FONASA oficial

---

## �🎯 Objetivos

### Objetivos de Negocio

1. **Reducir errores de facturación** en un 80%
2. **Agilizar el proceso** de codificación en un 50%
3. **Mejorar trazabilidad** con registro completo de cambios
4. **Asegurar cumplimiento normativo** con FONASA y MINSAL
5. **Facilitar auditorías** con reportes automatizados

### Objetivos Técnicos

1. Sistema web accesible desde cualquier navegador
2. Autenticación y autorización basada en roles
3. Interfaz responsive y de alta performance
4. Carga de archivos Excel de hasta 1,000 registros en < 30 segundos
5. Tiempo de respuesta de acciones críticas < 5 segundos
6. 99.9% de disponibilidad
7. Backup automático de datos

---

## 🏗️ Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │   Login    │  │  Dashboard │  │  Excel Viewer    │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────┐
│              NEXT.JS (Frontend + API Routes)            │
│  ┌────────────────┐  ┌──────────────────────────────┐  │
│  │  Server Side   │  │     API Routes               │  │
│  │  Rendering     │  │  /api/upload                 │  │
│  │                │  │  /api/validate               │  │
│  │                │  │  /api/calculate              │  │
│  └────────────────┘  └──────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ PostgreSQL │  │    Auth    │  │  Storage (Files) │  │
│  │  Database  │  │   (RLS)    │  │                  │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   VERCEL (Deployment)                    │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos Principal (Con Workflow de Estados) - ACTUALIZADO 3/Nov/2025

#### **Regla de Archivo Único en Flujo**
⚠️ **RESTRICCIÓN CRÍTICA:** Solo puede existir UN archivo en proceso a la vez.
- **Estados en flujo activo:** `borrador_encoder`, `pendiente_finance`, `borrador_finance`, `pendiente_admin`
- **Estados que liberan el sistema:** `exportado`, `rechazado`
- Si existe un archivo en flujo activo, NO se puede subir otro hasta completar o rechazar el actual

---

1. **Encoder carga Excel desde SIGESA**
   - **Validación previa:** Sistema verifica si existe archivo en flujo activo
   - Si existe archivo activo → Error 409: "Ya existe un archivo en proceso"
   - Si NO existe → Permite carga
   - Frontend valida formato básico (página `/upload`)
   - API route `/api/v1/sigesa/upload` procesa archivo
   - Parser automático mapea 83 columnas de SIGESA
   - Datos se almacenan en tabla `sigesa` y `sigesa_fila`
   - Sistema crea registros espejo en `grd_fila` con **estado: `borrador_encoder`**
   - Sistema cruza automáticamente con `norma_minsal` para obtener peso del GRD

2. **Encoder edita Ajustes Tecnológicos (AT)**
   - Accede a página `/visualizator` (Editor)
   - Ve solo archivos en estado `borrador_encoder`
   - **Puede visualizar SIGESA original** en `/sigesa` (modo lectura)
   - **Puede consultar Norma MINSAL** en `/norma` (modo lectura)
   - Edita campos: `AT` (boolean), `AT_detalle` (multi-select)
   - Sistema calcula automáticamente `monto_AT`
   - **Auto-guardado cada 5 segundos** con PUT a `/api/v1/grd/rows/[episodio]`
   - **Encoder hace Submit (doble confirmación):**
     1. Modal paso 1: "¿Estás seguro de entregar?"
     2. Modal paso 2: "⚠️ No podrás editar hasta que finalice el proceso"
     3. Confirma → `POST /api/v1/grd/[grdId]/submit-encoder`
     4. Estado cambia a `pendiente_finance`
   - Campos de Encoder quedan **bloqueados** (read-only)
   - Encoder recibe notificación si Admin rechaza

3. **Finance agrega datos complementarios**
   - **Notificación:** Banner en dashboard "🔔 Tienes archivo pendiente"
   - Accede a página `/visualizator` (Editor)
   - Ve solo archivos en estado `pendiente_finance` o `borrador_finance`
   - **Puede visualizar SIGESA original** en `/sigesa` (modo lectura)
   - Campos de Encoder están **bloqueados** (read-only)
   - Edita campos: `validado`, `n_folio`, `estado_rn`, `monto_rn`, `documentacion`
   - **Auto-guardado cada 5 segundos** con PUT a `/api/v1/grd/rows/[episodio]`
   - **Finance hace Submit (doble confirmación):**
     1. Modal paso 1: "¿Estás seguro de entregar?"
     2. Modal paso 2: "⚠️ No podrás editar hasta que finalice el proceso"
     3. Confirma → `POST /api/v1/grd/[grdId]/submit-finance`
     4. Estado cambia a `pendiente_admin`
   - Todos los campos quedan **bloqueados**
   - Finance pierde acceso si Admin rechaza

4. **Admin revisa y exporta archivo final**
   - **Notificación:** Banner en dashboard "🔔 Tienes archivo pendiente de aprobación"
   - Accede a página `/visualizator` (Visualizador)
   - Ve archivos en estado `pendiente_admin`, `aprobado`, `exportado`
   - **Puede visualizar SIGESA original** en `/sigesa` (modo lectura)
   - **Filtro visual:** Checkbox "Solo filas con AT = 'S'" (no afecta exportación)
   - **NO puede editar** (todo read-only)
   - **Opciones de Admin:**
     - ✅ **Aprobar:** `POST /api/v1/grd/[grdId]/review { action: 'approve' }`
       - Estado cambia a `aprobado`
       - Se habilita botón "Exportar"
     - ❌ **Rechazar:** `POST /api/v1/grd/[grdId]/review { action: 'reject' }`
       - Estado cambia a `rechazado`
       - Encoder recibe notificación
       - Encoder puede editar nuevamente (vuelve a `borrador_encoder` al abrir editor)
     - 📥 **Exportar:** `GET /api/v1/grd/[grdId]/export`
       - Solo si estado es `aprobado`
       - Genera Excel con 29 columnas formato FONASA
       - Estado cambia a `exportado`
       - Archivo disponible para descarga local
       - **Permite re-descarga** sin cambiar estado

---

## 💻 Stack Tecnológico

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** Zustand / React Context
- **Excel Component:** react-spreadsheet / handsontable
- **Form Validation:** Zod + React Hook Form
- **HTTP Client:** fetch nativo de Next.js

### Backend
- **Runtime:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **ORM:** Prisma o Supabase Client directo

### DevOps & Tools
- **Hosting:** Vercel
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions + Vercel
- **Linting:** ESLint + Prettier
- **Testing:** Vitest + React Testing Library
- **Package Manager:** pnpm

### Integraciones Externas
- **Excel Processing:** xlsx / exceljs
- **PDF Generation:** jsPDF / pdfkit
- **Logging:** Winston o Pino

---

## 🎭 Épicas y Features

### EP-01: Administración de Perfiles y Permisos 🚧 (Sprint 3-4)
**Estado:** 75% completado - En desarrollo activo  
**Valor de Negocio:** Asegura seguridad y confidencialidad de datos clínicos

**Features:**
- ✅ HU-001: Creación y gestión de usuarios (CRUD completo)
- ✅ HU-002: Asignación de roles y permisos (admin, encoder, finance)
- 🚧 **HU-003: Acceso restringido por rol (EN DESARROLLO ACTIVO)**
- ✅ HU-004: Visualización de usuarios activos

**Estado de HU-003 (Prioridad Actual) - 35% Completado (Actualizado 3/Nov/2025):**

**PLAN COMPLETO DEFINIDO - 5 FASES:**

- ✅ **FASE 1 (60% completada):** Sistema de estados en Base de Datos
  - ✅ Migración SQL con ENUM `workflow_estado` (6 estados)
  - ✅ Campo `estado` agregado a `grd_fila`
  - ✅ Tipos TypeScript regenerados
  - ⚠️ **PENDIENTE CRÍTICO:** Agregar estado `rechazado` al ENUM (migración nueva)
  - ⏳ APIs de workflow pendientes

- 🚧 **FASE 2 (0%):** APIs de Control de Workflow
  - ⏳ API validar archivo único en flujo (`GET /api/v1/grd/active-workflow`)
  - ⏳ API submit encoder (`POST /api/v1/grd/[grdId]/submit-encoder`)
  - ⏳ API submit finance (`POST /api/v1/grd/[grdId]/submit-finance`)
  - ⏳ API review admin (`POST /api/v1/grd/[grdId]/review`)
  - ⏳ API filtro por estado (modificar GET de rows)
  - ⏳ Modificar API upload para validar unicidad

- 🚧 **FASE 3 (0%):** Modificaciones de Componentes Existentes
  - ⏳ Modificar `FileUpload.tsx` (validación archivo único)
  - ⏳ Modificar `Sidebar.tsx` (menú dinámico por rol)
  - ⏳ Modificar `ExcelEditor.tsx` (campos editables dinámicos + auto-guardado)
  - ⏳ Crear `SubmitConfirmModal.tsx` (modal doble confirmación)
  - ⏳ Crear `WorkflowAlert.tsx` (notificaciones simples)
  - ⏳ Hook `useWorkflowStatus.ts` (estado de workflow compartido)

- 🚧 **FASE 4 (0%):** Integración en Páginas Existentes
  - ⏳ Modificar `/visualizator/page.tsx` (botones Submit/Aprobar/Rechazar)
  - ⏳ Modificar `/dashboard/page.tsx` (agregar WorkflowAlert)
  - ⏳ Modificar `/sigesa/page.tsx` (modo read-only estricto)
  - ⏳ Modificar `/upload/page.tsx` (validación de carga única)

- 🚧 **FASE 5 (0%):** Exportación y Cierre de Flujo
  - ⏳ API exportación con cambio de estado (`GET /api/v1/grd/[grdId]/export`)
  - ⏳ Lógica de re-descarga
  - ⏳ Sistema de liberación de workflow

**Criterios de Aceptación:**
- ✅ Admin puede crear/eliminar usuarios
- ✅ Sistema de roles: Admin, Encoder, Finance
- ✅ RLS policies en Supabase correctamente configuradas
- 🚧 Workflow de estados implementado (60% completado)
- ⏳ Validación de archivo único antes de carga (pendiente)
- ⏳ Acceso restringido por rol en dashboards (pendiente)
- ⏳ Bloqueo de campos según estado y rol (pendiente)
- ⏳ Sistema de notificaciones entre roles (pendiente)
- ⏳ Aprobación/rechazo por admin con flujo de regreso (pendiente)

---

### EP-02: Carga Estructurada de Egresos 🚧 (Sprint 3-4)
**Estado:** En desarrollo  
**Valor de Negocio:** Estandariza y agiliza el proceso de codificación

**Features:**
- 🚧 HU-005: Carga inicial de Excel desde SIGESA
- ⏳ HU-006: Validación de datos automática
- 🚧 HU-007: Cruce automático con Norma MINSAL

**Criterios de Aceptación:**
- Parser de Excel robusto (maneja 1,000+ registros)
- Validación de campos críticos: RUT, fechas, códigos
- Cruce con tabla `norma_minsal` por GRD
- Mensajes de error claros al usuario
- Progreso de carga visible (loading states)

---

### EP-03: Visualizador y Enriquecimiento de Datos ⏳ (Sprint 5)
**Estado:** No iniciado  
**Valor de Negocio:** Facilita revisión y completado de datos clínicos

**Features:**
- ⏳ HU-008: Cálculo automático de montos
- ⏳ HU-009: Visualización tipo Excel editable
- ⏳ HU-010: Registro de Ajustes Tecnológicos (AT)
- ⏳ HU-011: Asignación de precio base por convenio
- ⏳ HU-012: Guardado de progreso
- ⏳ HU-013: Complemento financiero

**Criterios de Aceptación:**
- Interfaz Excel-like responsive y performante
- Celdas editables con validación en tiempo real
- Dropdown de AT desde tabla maestra
- Cálculo automático de montos finales
- Auto-guardado cada 30 segundos

---

### EP-04: Motor de Validación y Alertas ⏳ (Sprint 5-6)
**Estado:** No iniciado  
**Valor de Negocio:** Previene errores y mejora calidad de datos

**Features:**
- ⏳ HU-014: Validación automática de outliers
- ⏳ HU-015: Validación de campos obligatorios
- ⏳ HU-016: Alertas de valores fuera de rango
- ⏳ HU-019: Notificaciones de inconsistencias en tarifas

**Criterios de Aceptación:**
- Sistema de alertas por prioridad (error, warning, info)
- Notificaciones en tiempo real
- Dashboard de alertas pendientes
- Reglas de validación configurables

---

### EP-05: Revisión Administrativa y Exportación ⏳ (Sprint 6)
**Estado:** No iniciado  
**Valor de Negocio:** Control de calidad final antes de facturación

**Features:**
- ⏳ HU-017: Visualización administrativa final
- ⏳ HU-018: Aprobación/rechazo de registros
- ⏳ HU-019: Filtrado de usuarios con AT vigente
- ⏳ HU-020: Exportación de Excel final
- ⏳ HU-021: Revisión de archivo SIGESA original

**Criterios de Aceptación:**
- Vista consolidada de todos los egresos
- Workflow de aprobación con estados
- Exportación en formato FONASA oficial
- Trazabilidad completa del proceso

---

## 👥 Roles de Usuario (Actualizado según HU-003)

### 1. Administrador (Admin)
**Permisos:**
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Asignación de roles y permisos
- 🚧 **Acceso a página `/dashboard/users` (Gestión de Usuarios)**
- 🚧 **Acceso a página `/sigesa` (Visualización SIGESA en modo lectura)**
- 🚧 **Acceso a página `/visualizator` (Visualizador en modo lectura)**
- 🚧 **Visualiza archivos en estado: `pendiente_admin`, `aprobado`, `exportado`**
- 🚧 **NO puede editar datos** (solo visualización)
- 🚧 **Filtro visual:** "Solo filas con AT = 'S'" (no afecta exportación)
- 🚧 **Puede aprobar archivos** (cambia estado a `aprobado`)
- 🚧 **Puede rechazar archivos** (cambia estado a `rechazado`, notifica a Encoder)
- 🚧 **Puede exportar archivos aprobados** (genera Excel formato FONASA, cambia estado a `exportado`)
- 🚧 **Puede re-descargar archivos exportados** (sin cambiar estado)
- 🚧 **Recibe notificación cuando Finance entrega archivo** (banner en dashboard)
- Acceso al sistema de auditoría y logs
- Exportación de archivo final
- Acceso a logs y auditoría

**Restricciones:**
- No puede eliminar su propio usuario
- Debe existir siempre al menos un admin
- 🚧 **No puede editar ningún dato** (visualización únicamente)

**Workflow:**
```
1. Admin recibe notificación: "🔔 Archivo pendiente de aprobación" → Estado: pendiente_admin
2. Admin revisa archivo en modo lectura
3. Admin puede filtrar visualmente filas con AT = 'S'
4. Admin decide:
   ✅ Aprobar → Estado: aprobado → Habilita botón "Exportar"
   ❌ Rechazar → Estado: rechazado → Notifica a Encoder → Vuelve a borrador_encoder
5. Si aprobó: Admin exporta → Genera Excel FONASA → Estado: exportado
6. Admin puede re-descargar sin cambiar estado
```

---

### 2. Codificador (Encoder)
**Permisos:**
- ✅ Carga de archivos Excel desde SIGESA (vía `/api/v1/sigesa/upload`)
- 🚧 **Solo puede cargar si NO existe archivo en flujo activo**
- 🚧 **Acceso a página `/upload` (Subir Archivo)**
- 🚧 **Acceso a página `/sigesa` (Visualización SIGESA en modo lectura)**
- 🚧 **Acceso a página `/visualizator` (Editor)**
- 🚧 **Acceso a página `/norma` (Consulta Norma MINSAL en modo lectura)**
- 🚧 **Visualiza archivos en estado: `borrador_encoder`**
- 🚧 **Edita SOLO filas (no columnas), campos específicos:** `AT` (boolean), `AT_detalle` (dropdown multi-select)
- 🚧 **Auto-guardado cada 5 segundos**
- 🚧 **Puede hacer Submit con doble confirmación** (cambia estado a `pendiente_finance`)
- 🚧 **Recibe notificación si admin rechaza archivo**
- Visualización de alertas y validaciones

**Campos Editables:**
- `AT` (Ajustes Tecnológicos - boolean)
- `AT_detalle` (Detalle de AT - dropdown desde tabla `ajuste_tecnologico`)
- Cálculo automático de `monto_AT`

**Restricciones:**
- 🚧 **NO puede editar después de Submit** (campos bloqueados)
- 🚧 **NO puede editar columnas** (solo filas)
- 🚧 **NO puede editar datos clínicos originales de SIGESA** (83 columnas bloqueadas)
- No puede aprobar registros finales
- No puede exportar archivo final
- No puede editar campos de Finance
- No puede ver archivos en otros estados

**Workflow:**
```
1. Encoder valida que NO exista archivo en flujo → Si existe: Error, no puede cargar
2. Encoder carga Excel → Estado: borrador_encoder
3. Encoder edita AT en filas → Auto-guardado cada 5s
4. Encoder hace Submit (doble confirmación) → Estado: pendiente_finance (BLOQUEADO)
5. Si Admin rechaza → Notificación → Puede editar de nuevo
```

---

### 3. Usuario de Finanzas (Finance)
**Permisos:**
- 🚧 **Acceso a página `/sigesa` (Visualización SIGESA en modo lectura)**
- 🚧 **Acceso a página `/visualizator` (Editor) - solo si hay archivo en `pendiente_finance`**
- 🚧 **Visualiza archivos en estado: `pendiente_finance`, `borrador_finance`**
- 🚧 **Edita SOLO filas (no columnas), campos específicos:** `validado`, `n_folio`, `estado_rn`, `monto_rn`, `documentacion`
- 🚧 **Auto-guardado cada 5 segundos**
- 🚧 **Puede hacer Submit con doble confirmación** (cambia estado a `pendiente_admin`)
- 🚧 **Recibe notificación cuando Encoder entrega archivo** (banner en dashboard)
- 🚧 **Pierde acceso al archivo si Admin rechaza**
- Ver reportes financieros
- Notificaciones de inconsistencias en tarifas

**Campos Editables:**
- `validado` (Sí/No - texto)
- `n_folio` (N° de Folio - número)
- `estado_rn` (Estado RN - texto)
- `monto_rn` (Monto RN - número)
- `documentacion` (Observaciones - texto)

**Campos de Solo Lectura (Bloqueados):**
- Todos los campos de SIGESA (83 columnas)
- Todos los campos editados por Encoder (AT, AT_detalle, monto_AT)

**Restricciones:**
- 🚧 **NO puede editar después de Submit** (campos bloqueados)
- 🚧 **NO puede editar columnas** (solo filas)
- No puede modificar datos clínicos ni de Encoder
- No puede cargar archivos SIGESA
- No puede ver archivos en estado `borrador_encoder`
- No puede aprobar ni exportar
- 🚧 **Pierde acceso si archivo es rechazado por Admin**

**Workflow:**
```
1. Finance recibe notificación: "🔔 Archivo pendiente" → Estado: pendiente_finance
2. Finance edita sus campos en filas → Auto-guardado cada 5s
3. Cambios automáticos cambian estado a: borrador_finance
4. Finance hace Submit (doble confirmación) → Estado: pendiente_admin (BLOQUEADO)
5. Si Admin rechaza → Pierde acceso, vuelve a Encoder
```

---

## 🔒 Políticas de Seguridad de Usuarios

### Creación de Usuarios

**Política Principal:** Solo los administradores pueden crear nuevos usuarios en el sistema.

#### Flujo de Creación de Usuarios

1. **No existe registro público**
   - No hay página de signup accesible públicamente
   - Los trabajadores no pueden auto-registrarse
   - La única forma de crear usuarios es a través del dashboard de administración

2. **Proceso de creación por Admin**
   - Admin solicita correo electrónico del nuevo trabajador
   - Admin ingresa: email, nombre completo y rol
   - Sistema genera contraseña temporal automáticamente (12 caracteres, alfanumérica + símbolos)
   - Admin recibe la contraseña temporal en pantalla con opción de copiar
   - Admin entrega credenciales manualmente al trabajador (email, WhatsApp, etc.)

3. **Contraseñas Temporales**
   - Generadas con algoritmo criptográficamente seguro (crypto.randomBytes)
   - 12 caracteres mínimo
   - Combinación de mayúsculas, minúsculas, números y símbolos
   - Flag `must_change_password = true` en base de datos
   - No se envían automáticamente por email (entrega manual)

4. **Primer Login Obligatorio**
   - Trabajador recibe email y contraseña temporal del admin
   - Trabajador ingresa a `/login` con credenciales temporales
   - Sistema detecta `must_change_password = true`
   - Redirección forzada a `/change-password`
   - No puede acceder al sistema hasta cambiar contraseña
   - Nueva contraseña debe cumplir requisitos de seguridad:
     - Mínimo 8 caracteres
     - Al menos una mayúscula
     - Al menos un número
     - Al menos un carácter especial

5. **Gestión de Contraseñas**
   - Después de cambio exitoso: `must_change_password = false`
   - Usuario puede cambiar contraseña en cualquier momento desde su perfil
   - Contraseñas almacenadas con hash seguro (Supabase Auth)
   - No se almacenan contraseñas en texto plano

### Seguridad de Acceso

#### Protección de Rutas

- **Rutas públicas:** `/login` únicamente
- **Rutas protegidas:** Todo bajo `/dashboard/*`
- Middleware valida sesión activa antes de acceder
- Redirección automática a `/login` si no autenticado

#### Control de Permisos por Rol

**Administrador:**
- CRUD completo de usuarios
- Generación de contraseñas temporales
- Visualización de todos los módulos
- Aprobación/rechazo de registros
- Exportación de archivos finales
- Acceso a logs de auditoría

**Codificador:**
- Solo lectura de su propio perfil
- No puede crear usuarios
- No puede ver otros usuarios
- Acceso limitado a sus egresos asignados

**Usuario de Finanzas:**
- Solo lectura de su propio perfil
- No puede crear usuarios
- No puede ver otros usuarios
- Acceso limitado a reportes financieros

#### Row Level Security (RLS)

Todas las operaciones sobre `public.users` están protegidas por políticas RLS:

```sql
-- Solo admins pueden crear usuarios
CREATE POLICY "Allow admins to insert new users"
ON public.users FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users 
  WHERE auth_id = auth.uid() AND role = 'admin'
));

-- Solo admins pueden ver todos los usuarios
CREATE POLICY "Allow admins to view all user profiles"
ON public.users FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE auth_id = auth.uid() AND role = 'admin'
));

-- Usuarios pueden ver solo su propio perfil
CREATE POLICY "Allow authenticated users to view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = auth_id);
```

### Auditoría y Trazabilidad

#### Logs de Acceso

- Todos los logins se registran con timestamp en `users.last_login`
- Intentos fallidos de login se registran en logs del sistema
- Creación de usuarios registrada en `audit_log`
- Cambios de contraseña registrados en `audit_log`

#### Información Registrada

Para cada acción crítica se registra:
- `user_id`: Usuario que ejecuta la acción
- `action`: Tipo de acción (create_user, change_password, etc.)
- `table_name`: Tabla afectada
- `record_id`: ID del registro afectado
- `old_values`: Valores anteriores (si aplica)
- `new_values`: Valores nuevos
- `ip_address`: IP del cliente
- `user_agent`: Navegador utilizado
- `created_at`: Timestamp de la acción

### Mejores Prácticas Implementadas

1. **Principio de Mínimo Privilegio**
   - Usuarios solo tienen permisos estrictamente necesarios
   - Roles claramente definidos y separados
   - RLS enforcement a nivel de base de datos

2. **Defensa en Profundidad**
   - Validación en frontend (UX)
   - Validación en API routes (seguridad)
   - Validación en base de datos (integridad)
   - RLS policies (última línea de defensa)

3. **Contraseñas Seguras**
   - Generación aleatoria criptográficamente segura
   - Cambio obligatorio en primer login
   - Validación de complejidad
   - Hash seguro con Supabase Auth

4. **Sin Superficie de Ataque Externa**
   - No hay signup público
   - No hay recuperación de contraseña sin admin
   - Rate limiting en endpoints de autenticación
   - Logs de intentos fallidos

---

## 🗄️ Modelo de Datos

### Tablas Principales

#### `users`
```sql
id: uuid (PK)
auth_id: uuid (FK -> auth.users.id) UNIQUE
email: varchar(255) UNIQUE
full_name: varchar(255)
role: enum('admin', 'encoder', 'finance')
is_active: boolean
must_change_password: boolean DEFAULT TRUE
created_at: timestamp
updated_at: timestamp
last_login: timestamp
```
**Nota:** Esta tabla se sincroniza automáticamente con `auth.users` mediante trigger.

#### `egresos_raw` (Datos originales de SIGESA)
```sql
id: uuid (PK)
file_upload_id: uuid (FK -> file_uploads)
rut_paciente: varchar(12)
fecha_egreso: date
diagnostico_principal: varchar(10)
procedimiento: varchar(10)
dias_estadia: integer
tramo_fonasa: varchar(2)
motivo_atencion: varchar(10)
-- Más campos según formato SIGESA
created_at: timestamp
```

#### `egresos_enriched` (Datos enriquecidos)
```sql
id: uuid (PK)
egreso_raw_id: uuid (FK -> egresos_raw)
grd: varchar(10)
peso_relativo: decimal(10,4)
punto_corte_inferior: integer
punto_corte_superior: integer
valor_grd: decimal(12,2)
ajustes_tecnologicos: jsonb[]
precio_base: decimal(12,2)
monto_total: decimal(12,2)
estado: enum('pendiente', 'en_revision', 'aprobado', 'rechazado')
codificador_id: uuid (FK -> users)
aprobador_id: uuid (FK -> users)
observaciones: text
created_at: timestamp
updated_at: timestamp
```

#### `norma_minsal`
```sql
id: uuid (PK)
grd: varchar(10) UNIQUE
descripcion: text
peso_relativo: decimal(10,4)
punto_corte_inferior: integer
punto_corte_superior: integer
vigencia_desde: date
vigencia_hasta: date (nullable)
created_at: timestamp
updated_at: timestamp
```

#### `ajustes_tecnologicos`
```sql
id: uuid (PK)
codigo: varchar(20) UNIQUE
descripcion: text
monto: decimal(12,2)
vigente: boolean
created_at: timestamp
updated_at: timestamp
```

#### `file_uploads`
```sql
id: uuid (PK)
user_id: uuid (FK -> users)
filename: varchar(255)
file_path: text
file_size: bigint
status: enum('pending', 'processing', 'completed', 'error')
rows_total: integer
rows_processed: integer
error_message: text (nullable)
created_at: timestamp
completed_at: timestamp (nullable)
```

#### `exportaciones`
```sql
id: uuid (PK)
user_id: uuid (FK -> users)
filename: varchar(255)
file_path: text
egresos_count: integer
periodo_inicio: date
periodo_fin: date
created_at: timestamp
```

#### `audit_log`
```sql
id: uuid (PK)
user_id: uuid (FK -> users)
action: varchar(100)
table_name: varchar(100)
record_id: uuid
old_values: jsonb (nullable)
new_values: jsonb (nullable)
ip_address: varchar(45)
user_agent: text
created_at: timestamp
```

---

## 📅 Roadmap y Sprints

### Sprint 1: Setup y Fundamentos (Completado - 22/sep/2025)
- ✅ Configuración inicial del proyecto Next.js
- ✅ Setup de Supabase y variables de entorno
- ✅ Estructura base de carpetas
- ✅ CI/CD en Vercel
- ✅ Primeros componentes UI

### Sprint 2: Iteración 2 (En Curso - hasta 29/sep/2025)
- 🚧 Refinamiento de arquitectura
- 🚧 Ajustes de diseño UX/UI
- 🚧 Testing inicial

### Sprint 3: Auth y Carga de Datos (6/oct/2025)
**HU Comprometidas:** HU-005, HU-009
- Sistema de autenticación (Login/Logout)
- Carga de archivos Excel
- Parser de SIGESA
- Vista tipo Excel básica

### Sprint 4: Gestión de Usuarios y Validación (20/oct/2025 - 5/nov/2025) ✅ COMPLETADO
**HU Comprometidas:** HU-001, HU-002, HU-003, HU-004
- ✅ CRUD de usuarios (HU-001)
- ✅ Sistema de roles y permisos (HU-002)
- ✅ Workflow completo por roles (HU-003) - 7/8 bloques completados
- ✅ Vista de usuarios (HU-004)
- ✅ TECH-006: Validaciones de campos re-habilitadas
- ✅ TECH-007: FASE 1 - Fix Admin UX (sin redirección después de aprobar)
- ✅ TECH-008: FASE 2 - Lista de archivos aprobados para Admin

**Logros principales:**
- Workflow end-to-end funcional: Encoder → Finance → Admin
- Estados implementados: borrador_encoder, pendiente_finance, borrador_finance, pendiente_admin, aprobado, exportado, rechazado
- Admin puede aprobar/rechazar sin perder contexto
- Admin tiene vista centralizada de archivos aprobados
- Sistema de archivo único en proceso (restricción implementada)

**Pendientes para Sprint 5:**
- BLOQUE 8: Testing manual E2E completo
- HU-007: Cruce con Norma MINSAL
- HU-012: Guardado de progreso
- HU-013: Complemento financiero
- HU-020: Exportación básica

### Sprint 5: Enriquecimiento y Validaciones (10/nov/2025 - estimado)
**HU Comprometidas:** HU-006, HU-007, HU-008, HU-010, HU-011, HU-012, HU-013, HU-014, HU-016, HU-018, HU-019, HU-020
- Testing end-to-end del workflow (BLOQUE 8 de HU-003)
- Cruce con Norma MINSAL (HU-007)
- Validación automática de datos (HU-006)
- Cálculo de montos (HU-008)
- Ajustes Tecnológicos (HU-010)
- Precio base por convenio (HU-011)
- Guardado de progreso (HU-012)
- Complemento financiero (HU-013)
- Motor de alertas (HU-014, HU-016)
- Aprobación de registros (HU-018)
- Filtrado de ATs (HU-019)
- Exportación formato FONASA (HU-020)

**⚠️ ACTUALIZACIÓN 5/Nov/2025:** Sprint 4 completado exitosamente. Admin UX mejorada significativamente con FASE 1+2.

### Sprint 6: Revisión Final y Exportación (17/nov/2025)
**HU Comprometidas:** HU-015, HU-017
- Validación de campos obligatorios
- Vista administrativa final
- Exportación formato FONASA oficial
- Testing end-to-end
- Documentación final

---

## 🛡️ Requisitos No Funcionales

### RNF-01: Seguridad de Acceso y Autenticación
- **Métrica:** 100% de accesos validados contra permisos de rol
- **Implementación:**
  - Supabase Auth con JWT
  - Row Level Security (RLS) en todas las tablas
  - Hash de contraseñas con bcrypt
  - Rate limiting en endpoints críticos
  - Logs de auditoría de todos los accesos

### RNF-02: Mantenibilidad del Código
- **Métrica:** Deploy < 30 minutos
- **Implementación:**
  - Código documentado con JSDoc/TSDoc
  - Tests unitarios (cobertura > 70%)
  - PR reviews obligatorios
  - Linting y formatting automatizado
  - CI/CD automatizado

### RNF-03: Exportación de Datos
- **Métrica:** 100% de reportes exportables sin pérdida de datos
- **Implementación:**
  - Soporte Excel, PDF, CSV
  - Mantener formato y fórmulas
  - Compresión para archivos grandes
  - Validación de integridad post-exportación

### RNF-04: Rendimiento de Carga de Archivos
- **Métrica:** 1,000 registros procesados en < 30 segundos
- **Implementación:**
  - Procesamiento batch asíncrono
  - Progress bar en tiempo real
  - Worker threads para parsing
  - Caching de Norma MINSAL

### RNF-06: Tiempo de Respuesta de Interfaz
- **Métrica:** Acciones críticas < 5 segundos
- **Implementación:**
  - Server-side rendering para first load
  - Lazy loading de componentes
  - Optimistic UI updates
  - Debouncing en búsquedas
  - Virtual scrolling para tablas grandes

### RNF-07: Integridad de Datos
- **Métrica:** 0% pérdida o corrupción de datos
- **Implementación:**
  - Transacciones ACID en PostgreSQL
  - Validaciones en múltiples capas (client, API, DB)
  - Backups automáticos diarios
  - Versionado de cambios críticos
  - Checksums en archivos cargados

---

## ⚠️ Riesgos y Mitigación

### Riesgos Críticos (Alto Impacto)

#### R-05: Llenado inconsistente de planillas Excel
**Impacto:** ALTO | **Probabilidad:** MEDIA  
**Mitigación:**
- Definir y documentar formato estándar de Excel SIGESA
- Validación estricta en el parser
- Feedback claro de errores al usuario
**Plan de Contingencia:**
- Procedimiento de revisión manual rápida
- Herramienta de corrección de formato

#### R-06: Exposición de datos sensibles
**Impacto:** ALTO | **Probabilidad:** BAJA  
**Mitigación:**
- Cifrado end-to-end de datos sensibles
- RLS policies estrictas en Supabase
- Logs de acceso y auditoría
- Rate limiting y firewall
**Plan de Contingencia:**
- Protocolo de respuesta a incidentes
- Suspensión inmediata de accesos comprometidos

#### R-10: Fallos en integración Next.js/Supabase
**Impacto:** ALTO | **Probabilidad:** MEDIA  
**Mitigación:**
- Tests de integración automatizados
- Monitoring de logs y errores
- Manejo robusto de errores
**Plan de Contingencia:**
- Fallback a storage local temporal
- Reinstanciación rápida de conexiones

---

## 📐 Convenciones de Código

### TypeScript

```typescript
// Interfaces con I- prefix
interface IUser {
  id: string;
  email: string;
  role: UserRole;
}

// Types para enums y unions
type UserRole = 'admin' | 'codificador' | 'finanzas';

// Naming conventions
// - camelCase para variables y funciones
// - PascalCase para componentes y tipos
// - UPPER_SNAKE_CASE para constantes

// Ejemplo de componente
import React from 'react';

interface UserCardProps {
  user: IUser;
  onEdit: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.email}</h3>
      <button onClick={() => onEdit(user.id)}>Editar</button>
    </div>
  );
};
```

### Estructura de Archivos

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group para auth
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Route group para dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── usuarios/
│   │   ├── egresos/
│   │   └── exportaciones/
│   └── api/               # API Routes
│       ├── auth/
│       ├── upload/
│       └── export/
├── components/            # Componentes reutilizables
│   ├── ui/               # shadcn/ui components
│   ├── forms/
│   ├── tables/
│   └── layouts/
├── lib/                  # Utilidades y configuración
│   ├── supabase/
│   ├── validators/
│   └── utils/
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── constants/            # Constantes globales
```

### Git Workflow

```bash
# Branches
main          # Producción
develop       # Desarrollo
feature/*     # Nuevas features
bugfix/*      # Correcciones
hotfix/*      # Fixes urgentes en producción

# Commit messages (Conventional Commits)
feat: agregar módulo de carga de archivos
fix: corregir validación de RUT
docs: actualizar README con instrucciones de deploy
style: formatear código con prettier
refactor: reorganizar componentes de usuario
test: agregar tests para parser de Excel
chore: actualizar dependencias
```

### Code Style

```typescript
// ✅ CORRECTO
export async function uploadFile(file: File): Promise<UploadResult> {
  try {
    const validatedFile = await validateFile(file);
    const result = await supabase.storage
      .from('uploads')
      .upload(validatedFile.path, validatedFile.data);
    
    return {
      success: true,
      fileId: result.data.id,
    };
  } catch (error) {
    logger.error('Error uploading file', { error, fileName: file.name });
    throw new UploadError('Failed to upload file', error);
  }
}

// ❌ INCORRECTO
export async function uploadFile(file) {
  let result = await supabase.storage.from('uploads').upload(file.name, file);
  return result;
}
```

---

## 🏗️ Estructura de Carpetas

```
DataUnion/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   └── nuevo/
│   │   │   ├── egresos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── cargar/
│   │   │   │   └── [id]/
│   │   │   └── exportaciones/
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts
│   │       ├── upload/
│   │       │   └── route.ts
│   │       └── export/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── table.tsx
│   │   ├── forms/
│   │   │   ├── UserForm.tsx
│   │   │   └── UploadForm.tsx
│   │   ├── tables/
│   │   │   └── ExcelViewer.tsx
│   │   └── layouts/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── validators/
│   │   │   ├── user.ts
│   │   │   └── egreso.ts
│   │   └── utils/
│   │       ├── excel.ts
│   │       └── format.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEgresos.ts
│   │   └── useUpload.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── egreso.ts
│   │   └── api.ts
│   └── constants/
│       ├── roles.ts
│       └── estados.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── package.json
├── tsconfig.json
├── PLANNING.md          # Este archivo
├── TASK.md              # Backlog de tareas
└── README.md
```

---

## 📚 Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Norma MINSAL GRD](https://www.fonasa.cl/)

---

## 📝 Notas Finales

Este documento debe ser revisado y actualizado al menos una vez por sprint durante la retrospectiva. Cualquier cambio en la arquitectura, stack tecnológico o épicas debe reflejarse aquí inmediatamente.

**Última revisión por:** Equipo de Desarrollo  
**Próxima revisión:** Sprint 4 Retrospective (17/nov/2025)

---

## 📝 Changelog

### Versión 1.3 - 3 de Noviembre, 2025
**Actualización Mayor: Plan Completo de HU-003 Definido**

- ✅ **Flujo de Workflow Completamente Detallado:**
  - Regla de archivo único en flujo activo documentada
  - Workflow completo: Encoder → Finance → Admin → Export con todos los casos
  - Flujo de rechazo y vuelta a Encoder especificado
  - Auto-guardado cada 5 segundos
  - Doble confirmación en Submit (2 pasos)
  - Sistema de notificaciones simples (banners)

- ✅ **Plan de Implementación 5 Fases:**
  - FASE 1: Base de Datos (60% completado) - **BLOQUEANTE:** agregar estado `rechazado`
  - FASE 2: APIs de Control de Workflow (6 APIs nuevas)
  - FASE 3: Modificación de Componentes Existentes (7 tareas)
  - FASE 4: Integración en Páginas Existentes (4 páginas)
  - FASE 5: Exportación y Cierre de Flujo (2 tareas)

- ✅ **Revisión Completa del Codebase:**
  - Identificadas páginas existentes: `/sigesa`, `/norma`, `/upload`, `/visualizator`, `/dashboard`, `/dashboard/users`
  - Identificados componentes existentes: `SigesaPreview`, `ExcelEditor`, `NormaMinsal`, `FileUpload`, `Sidebar`
  - **Evitar duplicación de trabajo:** Modificar lo existente en lugar de crear nuevo

- ✅ **Roles Actualizados:**
  - Encoder: Edita solo filas, no columnas. Solo campos AT. Notificación de rechazo.
  - Finance: Recibe notificación. Pierde acceso si rechazado.
  - Admin: Solo visualización. Puede aprobar, rechazar o exportar. Re-descarga permitida.

- ✅ **Modelo de Datos Actualizado:**
  - Estado `rechazado` pendiente de agregar al ENUM

- ✅ **Estimaciones de Tiempo:**
  - Total: 18-20 horas distribuidas en 5 fases
  - Progreso actual: 35% (FASE 1 al 60%)

**Próximos Pasos Inmediatos:**
1. Crear migración para agregar estado `rechazado` (BLOQUEANTE)
2. Implementar APIs de workflow (FASE 2)
3. Modificar componentes existentes (FASE 3)

