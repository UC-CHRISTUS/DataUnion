# SUPUESTOS.md - Sistema de Prefacturación FONASA UC Christus

**Última actualización:** 31 de Octubre, 2025  
**Versión:** 1.0  
**Propósito:** Documentar supuestos críticos sobre el flujo de uso de la aplicación

---

## 📋 Índice

1. [Contexto General](#contexto-general)
2. [Flujo Principal de Trabajo](#flujo-principal-de-trabajo)
3. [Supuestos por Rol](#supuestos-por-rol)
4. [Supuestos de Concurrencia](#supuestos-de-concurrencia)
5. [Supuestos de Estados](#supuestos-de-estados)
6. [Supuestos de Datos](#supuestos-de-datos)

---

## 🎯 Contexto General

### Objetivo del Sistema
Generar el Excel de prefacturación por episodios de pacientes clínicos para FONASA (Chile).

### Equipo de Trabajo
- **2 Encoders** (Codificadores)
- **3 Finance** (Finanzas)
- **1 Admin** (Administrador)
- **Total:** 6 personas trabajando sobre UN SOLO ARCHIVO

### Frecuencia de Uso
- **Periodicidad:** Mensual
- **Proceso:** Un archivo único por mes que pasa por todos los roles secuencialmente

---

## 🔄 Flujo Principal de Trabajo

```
┌──────────────────────────────────────────────────────────────────┐
│  1. ENCODER: Upload desde SIGESA                                 │
│     Estado: borrador_encoder                                     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  2. ENCODER: Edita AT y campos clínicos                          │
│     Estado: borrador_encoder                                     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  3. ENCODER: Submit (con doble confirmación)                     │
│     Estado: pendiente_finance                                    │
│     ⚠️ BLOQUEO: Encoder ya no puede editar                       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  4. FINANCE: Recibe notificación                                 │
│     Estado: borrador_finance                                     │
│     ✅ Finance puede editar sus campos                           │
│     ❌ Finance NO puede editar campos de Encoder (bloqueados)    │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  5. FINANCE: Agrega N°Folio, Validación, Datos RN               │
│     Estado: borrador_finance                                     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  6. FINANCE: Submit (con doble confirmación)                     │
│     Estado: pendiente_admin                                      │
│     ⚠️ BLOQUEO: Finance ya no puede editar                       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  7. ADMIN: Revisa y filtra filas con AT                          │
│     Estado: pendiente_admin                                      │
│     ❌ Admin NO puede editar nada                                │
│     ✅ Admin puede APROBAR o RECHAZAR (Sprint futuro)            │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  8. ADMIN: Aprueba y exporta                                     │
│     Estado: aprobado → exportado                                 │
│     📥 Descarga Excel final para FONASA                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 👥 Supuestos por Rol

### 🔵 ENCODER (Codificador)

#### Permisos de Edición
- ✅ **Puede editar:**
  - Ajustes Tecnológicos (AT) - dropdown con múltiples opciones
  - Campos clínicos específicos (a definir según codebase existente)
  
- ❌ **NO puede editar:**
  - Campos de Finance (N°Folio, Validación, Datos RN)
  - Campos inmutables de SIGESA (RUT, fecha egreso, etc.)

#### Supuestos Clave
1. **Upload único:** Solo UN encoder del equipo sube el archivo inicial desde SIGESA
2. **Archivo base:** El archivo de SIGESA tiene columnas fijas y conocidas (parser automático)
3. **Submit irreversible:** Una vez que hace submit, **NO puede volver a editar**
4. **Doble confirmación:** Submit requiere confirmación estilo "danger" (como borrar repo en GitHub)
5. **Trabajo colaborativo:** Los 2 encoders pueden trabajar simultáneamente sobre el mismo archivo
6. **Estado borrador:** Mientras está en `borrador_encoder`, puede guardar progreso sin hacer submit

---

### 💚 FINANCE (Finanzas)

#### Permisos de Edición
- ✅ **Puede editar:**
  - N° Folio (campo manual)
  - Validación (campo de texto - **POR DEFINIR**)
  - Datos RN (Right Now) - ~2 columnas ingresadas manualmente
  
- ❌ **NO puede editar:**
  - Campos de Encoder (AT, campos clínicos) - **BLOQUEADOS**
  - Campos inmutables de SIGESA

#### Supuestos Clave
1. **Recibe notificación:** Cuando encoder hace submit, Finance recibe alerta en la app
2. **Campos bloqueados:** Los campos editados por Encoder quedan **read-only** para Finance
3. **Submit irreversible:** Una vez que hace submit, **NO puede volver a editar**
4. **Doble confirmación:** Submit requiere confirmación estilo "danger"
5. **Trabajo colaborativo:** Los 3 finance pueden trabajar simultáneamente sobre el mismo archivo
6. **Datos manuales:** Todos los campos de Finance se ingresan manualmente (no hay imports)
7. **Estado borrador:** Mientras está en `borrador_finance`, puede guardar progreso sin hacer submit

---

### 🔴 ADMIN (Administrador)

#### Permisos de Edición
- ❌ **NO puede editar nada:** Admin es solo revisor/aprobador

#### Permisos de Revisión
- ✅ **Puede revisar:**
  - Todo el archivo completo
  - Todas las columnas (Encoder + Finance + SIGESA)
  
- ✅ **Puede filtrar:**
  - Filas con AT (Ajustes Tecnológicos) aplicados
  - Tipo filtro Excel para facilitar revisión

#### Permisos de Aprobación
- ✅ **Puede aprobar:** Todo el archivo pasa a estado `aprobado`
- ✅ **Puede rechazar:** (Feature Sprint futuro)
  - Si rechaza columna de Encoder → Vuelve a `borrador_encoder`
  - Si rechaza columna de Finance → Vuelve a `borrador_finance`

#### Permisos de Exportación
- ✅ **Exporta TODO el archivo completo** (no por filas)
- ✅ **Descarga local:** Botón de descarga → archivo .xlsx en PC
- ✅ **No hay envío automático:** Admin descarga y luego sube manualmente a FONASA

#### Supuestos Clave
1. **Solo revisión:** Admin NO edita, solo aprueba/rechaza
2. **Export completo:** Siempre exporta el archivo completo (no parcial)
3. **Export local:** No hay integración directa con FONASA (por ahora)
4. **Filtros avanzados:** Necesita poder filtrar fácilmente filas con AT
5. **Rechazo granular:** (Sprint futuro) Puede rechazar por columna específica

---

## 🔄 Supuestos de Concurrencia

### ⚠️ CRÍTICO: Trabajo Colaborativo Simultáneo

#### Escenario Real
- **2 Encoders** trabajando simultáneamente en el mismo archivo
- **3 Finance** trabajando simultáneamente en el mismo archivo
- **1 Admin** revisando (no edita)

#### Supuestos de Implementación

##### 1. **Concurrencia a Nivel de Fila (Episodio)**
```
Supuesto: Cada usuario trabaja en FILAS diferentes al mismo tiempo

Ejemplo:
- Encoder A edita fila 1, 3, 5
- Encoder B edita fila 2, 4, 6
- Sistema bloquea automáticamente la fila que está siendo editada
```

**Ventajas:**
- ✅ No hay conflictos de versión
- ✅ Trabajo paralelo real
- ✅ Fácil de implementar

**Desventajas:**
- ❌ Necesita sistema de bloqueo de filas
- ❌ Necesita indicador visual de "quién está editando qué"


---

#### ⭐ Recomendación: **Opción 1 - Bloqueo de Filas**

**Implementación propuesta:**
1. Cuando usuario empieza a editar una fila → se bloquea automáticamente
2. Otros usuarios ven indicador visual: "🔒 Editando: [Nombre Usuario]"
3. Cuando usuario sale de la fila → se desbloquea automáticamente
4. Timeout de 10 minutos: si usuario no guarda, fila se desbloquea automáticamente

**Ventajas para UC Christus:**
- ✅ Evita conflictos entre los 2 encoders
- ✅ Evita conflictos entre los 3 finance
- ✅ Trabajo paralelo eficiente
- ✅ No hay pérdida de datos

---

### Supuestos Adicionales de Concurrencia

#### Durante Estado `borrador_encoder`
- ✅ Los 2 encoders pueden trabajar simultáneamente
- ✅ Sistema bloquea filas en edición activa
- ✅ Auto-guardado cada 30 segundos (sin submit)
- ⚠️ Solo UN encoder puede hacer el submit final

#### Durante Estado `borrador_finance`
- ✅ Los 3 finance pueden trabajar simultáneamente
- ✅ Sistema bloquea filas en edición activa
- ✅ Auto-guardado cada 30 segundos (sin submit)
- ⚠️ Solo UN finance puede hacer el submit final

#### Durante Estado `pendiente_admin`
- ✅ Admin solo lee, no hay conflictos de concurrencia
- ❌ Nadie más puede editar (archivo bloqueado)

---

## 📊 Supuestos de Estados

### Estados Definidos

| Estado | Rol Activo | Puede Editar | Puede Ver | Puede Submit |
|--------|-----------|--------------|-----------|--------------|
| `borrador_encoder` | Encoder | ✅ Encoder | ❌ Finance, Admin | ✅ Encoder |
| `pendiente_finance` | Finance | ❌ Nadie | ✅ Finance | ❌ Nadie |
| `borrador_finance` | Finance | ✅ Finance | ✅ Admin (read-only) | ✅ Finance |
| `pendiente_admin` | Admin | ❌ Nadie | ✅ Admin | ❌ Nadie |
| `aprobado` | Admin | ❌ Nadie | ✅ Admin | ❌ Nadie |
| `exportado` | - | ❌ Nadie | ✅ Todos (histórico) | ❌ Nadie |

### Transiciones de Estado

```
borrador_encoder
    ↓ [Encoder hace Submit con doble confirmación]
pendiente_finance (estado transitorio automático)
    ↓ [Finance inicia edición]
borrador_finance
    ↓ [Finance hace Submit con doble confirmación]
pendiente_admin
    ↓ [Admin aprueba]
aprobado
    ↓ [Admin exporta]
exportado (estado final)
```

### Supuestos de Transiciones

1. **Submit de Encoder:**
   - ⚠️ Requiere doble confirmación estilo "danger"
   - ⚠️ Irreversible - Encoder no puede volver atrás
   - ✅ Finance recibe notificación automática en app
   - 🔒 Campos de Encoder quedan bloqueados para Finance

2. **Submit de Finance:**
   - ⚠️ Requiere doble confirmación estilo "danger"
   - ⚠️ Irreversible - Finance no puede volver atrás
   - ✅ Admin recibe notificación automática en app
   - 🔒 Todo el archivo queda bloqueado para edición

3. **Aprobación de Admin:**
   - ✅ Admin puede exportar en cualquier momento después de aprobar
   - ❌ No se puede volver atrás después de exportar
   - 📊 Archivo queda como histórico/auditoría

4. **Rechazo de Admin (Sprint Futuro):**
   - Si rechaza columna de Encoder → Estado vuelve a `borrador_encoder`
   - Si rechaza columna de Finance → Estado vuelve a `borrador_finance`
   - Campos no rechazados mantienen sus valores

---

## 📋 Supuestos de Datos

### Ajustes Tecnológicos (AT)

1. **Fuente de datos:**
   - ✅ Dropdown con opciones fijas desde base de datos
   - ✅ Tabla `ajustes_tecnologicos` en Supabase (ya existe)

2. **Múltiples AT por episodio:**
   - ✅ Un episodio puede tener más de un AT
   - ✅ Implementación con multi-select o agregar múltiples

3. **Montos de AT:**
   - ✅ Cada AT tiene un monto asociado en base de datos
   - ✅ Montos se suman al valor total del episodio
   - ⚠️ Valores específicos por definir más adelante

4. **Filtrado por Admin:**
   - ✅ Admin puede filtrar para ver solo episodios con AT
   - ✅ Implementación tipo filtro de Excel

---

### Campos de Finance

1. **N° Folio:**
   - Tipo: Campo de texto/numérico
   - Ingreso: Manual
   - Obligatorio: Por definir

2. **Validación:**
   - Tipo: Campo de texto
   - Ingreso: Manual
   - **⚠️ POR DEFINIR:** Naturaleza exacta del campo

3. **Datos RN (Right Now):**
   - Cantidad: ~2 columnas
   - Ingreso: Manual
   - **⚠️ POR DEFINIR:** Nombres exactos de columnas
   - **⚠️ POR DEFINIR:** Valores específicos

---

### Campos de Encoder

**⚠️ POR REVISAR:** Necesario revisar codebase existente y estructura de Supabase para definir:
- Campos específicos editables por Encoder
- Campos inmutables de SIGESA
- Estructura actual de tablas

---

### Estructura de Tablas (Por Confirmar)

**Tablas Existentes en Supabase:**
- ✅ `sigesa` - Archivos SIGESA
- ✅ `sigesa_fila` - Datos de egresos/episodios
- ✅ `norma_minsal` - Tabla normativa GRD
- ✅ `grd_fila` - GRD procesados
- ✅ `ajustes_tecnologias` - Ajustes tecnológicos
- ✅ `users` - Usuarios del sistema

**⚠️ IMPORTANTE:** 
- Revisar estructura actual con MCP Supabase
- Entender relaciones entre tablas
- Construir sobre base existente (no reinventar)

---

## 🎯 Próximos Pasos

### Antes de Implementar

1. ✅ **Confirmar este documento** con el equipo
2. ⏳ **Revisar archivos Excel** de ejemplo para entender estructura
3. ⏳ **Analizar Supabase** con MCP para ver esquema actual
4. ⏳ **Definir campos específicos** de cada rol (Encoder vs Finance)
5. ⏳ **Actualizar PLANNING.md** con flujo correcto
6. ⏳ **Actualizar TASK.md** con historias de usuario ajustadas

### Decisiones Pendientes

- [ ] Definir exactamente qué campos edita Encoder
- [ ] Definir exactamente qué es "Validación" de Finance
- [ ] Definir nombres de las 2 columnas de RN
- [ ] Definir valores/montos de AT
- [ ] Confirmar estructura de tablas en Supabase
- [ ] Decidir estrategia de concurrencia (recomendación: bloqueo de filas)

---

## 📝 Notas Finales

Este documento debe actualizarse cada vez que se defina un supuesto nuevo o se confirme uno existente. Los supuestos marcados con ⚠️ requieren decisión/confirmación antes de implementar.

**Última revisión por:** Sistema  
**Próxima revisión:** Después de revisar Excel y Supabase

---

