# Testing E2E - Funcionalidad de Rechazo Admin → Encoder

**Fecha:** 2 de Diciembre, 2025  
**Objetivo:** Validar el flujo completo de rechazo desde Admin hasta Encoder y vuelta a Finance

---

## 🎯 Flujo a Validar

```
Encoder subida → Finance edición → Admin rechazo → Encoder notificación → Encoder reedición → Finance continuación
```

---

## 📋 Datos Necesarios

### Usuarios de Prueba (verificar en BD)

1. **Encoder:** `codificador@dataunion.cl` / `Admin123!`
2. **Finance:** `finanzas@dataunion.cl` / `Admin123!`
3. **Admin:** `admin@dataunion.cl` / `Admin123!`

### Archivo de Prueba

Usaremos un archivo Excel SIGESA con al menos 2-3 episodios para pruebas.

---

## ✅ CASE 1: Admin Rechaza Archivo

### Prerequisitos
- ✅ Archivo debe estar en estado `pendiente_admin`
- ✅ Admin debe tener acceso a `/visualizator`

### Pasos

**1.1) Acceder como Admin**
```
1. Ir a https://dataunion.vercel.app/login
2. Email: admin@dataunion.cl
3. Password: Admin123!
4. Click "Iniciar Sesión"
```

**Verificar:**
- [ ] Admin logueado correctamente
- [ ] Puede ver dashboard

**1.2) Ir a Visualizator**
```
1. Click en "Editor" del sidebar O navegar a /visualizator
2. El sistema debe cargar el archivo pendiente_admin automáticamente
```

**Verificar:**
- [ ] Se carga archivo con múltiples filas (episodios)
- [ ] Estado mostrado: `pendiente_admin`
- [ ] Botones visibles: "✅ Aprobar Archivo" y "❌ Rechazar Archivo"

**1.3) Click en "❌ Rechazar Archivo"**
```
1. Ubicar botón rojo "❌ Rechazar Archivo" (arriba a la derecha del grid)
2. Click en botón
```

**Verificar:**
- [ ] Modal "Rechazar Archivo" se abre
- [ ] Modal muestra:
  - Ícono de alerta ⚠️
  - Título: "Rechazar Archivo"
  - Subtitle: "Proporciona una razón clara para el rechazo"
  - ID del archivo GRD

**1.4) Ingresar Razón del Rechazo**
```
1. En textarea ingresarse un motivo claro, ej:
   "Faltan datos en campos AT_detalle de episodios 2-5. Por favor completar con los ajustes tecnológicos específicos antes de reenviar."
2. Verificar que se muestra contador de caracteres
```

**Verificar:**
- [ ] Se puede escribir en textarea
- [ ] Mínimo 10 caracteres validado
- [ ] Botón "❌ Rechazar Archivo" se activa después de 10+ caracteres

**1.5) Confirmar Rechazo**
```
1. Click en botón "❌ Rechazar Archivo"
2. Sistema procesa...
```

**Verificar:**
- [ ] Botón muestra loading: "⌛ Rechazando..."
- [ ] Modal permanece abierto durante procesamiento
- [ ] Después de 2-3 segundos:
  - Alert: "✅ Archivo rechazado. El Encoder ha sido notificado."
  - Modal se cierra
  - Página se recarga

**1.6) Verificar Resultado**
```
1. Después del reload, si intentas ver el archivo nuevamente:
2. El estado debería ser ahora "rechazado"
```

**Verificar:**
- [ ] Página recargó completamente
- [ ] Botones de Admin (Aprobar/Rechazar) desaparecen
- [ ] Se muestra nueva información del estado

---

## ✅ CASE 2: Encoder Recibe Notificación

### Prerequisitos
- ✅ Archivo fue rechazado en CASE 1
- ✅ Estado en BD: `rechazado`

### Pasos

**2.1) Acceder como Encoder**
```
1. Cerrar sesión de Admin (logout)
2. Ir a https://dataunion.vercel.app/login
3. Email: codificador@dataunion.cl
4. Password: Admin123!
5. Click "Iniciar Sesión"
```

**Verificar:**
- [ ] Encoder logueado correctamente
- [ ] Se muestra dashboard

**2.2) Verificar Notificación en Dashboard**
```
1. En la página /dashboard debe aparecer banner rojo
```

**Verificar:**
- [ ] Banner rojo visible en el top (debajo de la navegación)
- [ ] Icono: ⚠️
- [ ] Mensaje dice: "Tu archivo fue rechazado"
- [ ] Incluye la razón: "Faltan datos en campos AT_detalle..."
- [ ] Botón visible: "Ver archivo"

**2.3) Click en "Ver archivo"**
```
1. Click en botón "Ver archivo" del banner
```

**Verificar:**
- [ ] Navega a `/visualizator`
- [ ] El archivo se carga correctamente

---

## ✅ CASE 3: Encoder Puede Reeditarlo

### Prerequisitos
- ✅ Encoder en `/visualizator`
- ✅ Estado archivo: `rechazado`

### Pasos

**3.1) Verificar Alerta Visual**
```
1. En la página /visualizator debe haber alerta roja
```

**Verificar:**
- [ ] Alerta roja en top del contenido
- [ ] Ícono: ⚠️
- [ ] Título: "Archivo Rechazado por el Administrador"
- [ ] Mensaje: "Este archivo fue rechazado. Por favor revisa..."

**3.2) Intentar Editar Campo AT en una Fila**
```
1. Buscar columna "AT" en el grid
2. Hacer doble-click en una celda AT en cualquier fila
3. Intentar editar (ej: cambiar de vacío a "Sí")
```

**Verificar:**
- [ ] La celda se vuelve editable (no está bloqueada)
- [ ] Cursor aparece en la celda
- [ ] Se puede escribir/cambiar el valor

**3.3) Editar Campo AT_detalle**
```
1. Buscar columna "AT_detalle" en el grid
2. Hacer doble-click en una celda AT_detalle
3. Se debe abrir dropdown con opciones de AT vigentes
```

**Verificar:**
- [ ] Campo editable (dropdown o textarea)
- [ ] Se pueden seleccionar ajustes tecnológicos
- [ ] El valor se actualiza

**3.4) Guardar Cambios**
```
1. Press ENTER o click fuera de la celda para confirmar cambio
2. Esperar confirmación visual
```

**Verificar:**
- [ ] Cambio se guarda en la celda
- [ ] No hay errores en la consola (F12 → Console)
- [ ] La fila se marca como modificada (si hay indicador visual)

**3.5) Editar Múltiples Filas**
```
1. Repetir pasos 3.2-3.4 para 2-3 filas más
2. Cambiar valores de AT, AT_detalle, o documentación
```

**Verificar:**
- [ ] Todas las ediciones se guardan correctamente
- [ ] No hay conflictos entre cambios
- [ ] El grid responde rápidamente

---

## ✅ CASE 4: Encoder Hace Submit Nuevamente

### Prerequisitos
- ✅ Encoder ha editado al menos 1 fila
- ✅ Cambios guardados en BD

### Pasos

**4.1) Buscar Botón Submit**
```
1. Desplazarse a la derecha del grid (botones están en la esquina superior derecha)
2. Buscar botón azul "Entregar a Finanzas"
```

**Verificar:**
- [ ] Botón visible
- [ ] Etiqueta: "Entregar a Finanzas"
- [ ] Botón NO está deshabilitado

**4.2) Click en "Entregar a Finanzas"**
```
1. Click en botón
```

**Verificar:**
- [ ] Se abre Modal SubmitConfirmModal
- [ ] Modal muestra confirmación doble
- [ ] Mensaje: "¿Estás seguro de que deseas enviar este archivo a Finanzas?"

**4.3) Confirmar Submit en Modal**
```
1. Verificar información en modal (GRD ID, número de filas, etc.)
2. Click en "Sí, Enviar a Finanzas"
```

**Verificar:**
- [ ] Botón de confirmación activo (no deshabilitado)
- [ ] Modal muestra loading después del click

**4.4) Esperar Resultado**
```
1. Sistema procesa (POST /api/v1/grd/[grdId]/submit-encoder)
2. Debería tomar 2-5 segundos
```

**Verificar:**
- [ ] Alert de éxito: "✅ Archivo entregado a Finanzas exitosamente"
- [ ] Estado cambió: rechazado → pendiente_finance
- [ ] Página se recarga
- [ ] Botones desaparecen (Encoder pierde acceso)

---

## ✅ CASE 5: Finance Recibe y Continúa Flujo

### Prerequisitos
- ✅ Encoder hizo Submit
- ✅ Archivo está en estado `pendiente_finance`

### Pasos

**5.1) Acceder como Finance**
```
1. Cerrar sesión de Encoder (logout)
2. Ir a https://dataunion.vercel.app/login
3. Email: finanzas@dataunion.cl
4. Password: Admin123!
5. Click "Iniciar Sesión"
```

**Verificar:**
- [ ] Finance logueado correctamente
- [ ] Se muestra dashboard

**5.2) Verificar Notificación**
```
1. En dashboard debería haber banner
```

**Verificar:**
- [ ] Banner amarillo/naranja visible
- [ ] Mensaje: "Tienes un archivo pendiente de validación y completado de datos"
- [ ] Botón: "Ver archivo"

**5.3) Ir a Visualizator**
```
1. Click "Ver archivo" O navegar a /visualizator
```

**Verificar:**
- [ ] Se carga archivo correctamente
- [ ] Estado mostrado: `pendiente_finance`
- [ ] Finance puede ver los cambios que hizo Encoder (AT actualizado)

**5.4) Editar Campos de Finance**
```
1. Buscar campos editables para Finance: validado, n_folio, estado_rn, monto_rn
2. Hacer doble-click en una celda (ej: n_folio)
3. Ingresar un valor (ej: "2024-001234")
```

**Verificar:**
- [ ] Campo editable
- [ ] Se puede ingresar datos
- [ ] Cambios se guardan

**5.5) Finance Hace Submit a Admin**
```
1. Buscar botón azul "Entregar a Administración"
2. Click en botón
```

**Verificar:**
- [ ] Modal de confirmación aparece
- [ ] Finance confirma
- [ ] Alert de éxito
- [ ] Estado cambió: pendiente_finance → borrador_finance → pendiente_admin

---

## ✅ CASE 6: Admin Aprueba (Segunda Revisión)

### Prerequisitos
- ✅ Finance hizo Submit
- ✅ Archivo está en `pendiente_admin`

### Pasos

**6.1) Acceder como Admin**
```
1. Logout Finance
2. Login como Admin
```

**Verificar:**
- [ ] Admin logueado

**6.2) Ver Archivo**
```
1. Dashboard mostrará notificación de archivo pendiente
2. Click "Ver archivo" O ir a /visualizator
```

**Verificar:**
- [ ] Se carga archivo
- [ ] Estado: `pendiente_admin`
- [ ] Botones Aprobar/Rechazar visibles

**6.3) Revisar Cambios**
```
1. Revisar que los cambios del Encoder están presentes
2. Revisar que los datos de Finance están completos
```

**Verificar:**
- [ ] AT actualizado (del Encoder)
- [ ] n_folio completado (de Finance)
- [ ] Estado_rn, monto_rn completados (de Finance)

**6.4) Aprobar Archivo**
```
1. Click en "✅ Aprobar Archivo"
2. NO debe abrir modal (approval directo)
```

**Verificar:**
- [ ] Alert: "✅ Archivo aprobado exitosamente. Ahora puedes descargarlo."
- [ ] Página recarga
- [ ] Botón "✅ Aprobado" aparece (deshabilitado)
- [ ] Botón "📥 Descargar Excel" aparece

**6.5) Descargar Excel**
```
1. Click en "📥 Descargar Excel"
2. Se inicia descarga de archivo
```

**Verificar:**
- [ ] Archivo se descarga (ver en carpeta de descargas del navegador)
- [ ] Nombre del archivo algo como: `grd_export_[grdId]_[timestamp].xlsx`
- [ ] Archivo tiene datos correctos (abrir en Excel y revisar)

---

## 📊 Matriz de Validación

| Case | Paso | Acción | Verificación | ✓/✗ |
|------|------|--------|--------------|-----|
| 1 | 1.1 | Admin login | Logueado correctamente | [ ] |
| 1 | 1.2 | Ir a /visualizator | Archivo carga en pending_admin | [ ] |
| 1 | 1.3 | Botón rechazar | Modal abre | [ ] |
| 1 | 1.4 | Ingresar razón | Min 10 caracteres validado | [ ] |
| 1 | 1.5 | Confirmar | Alert y reload | [ ] |
| 2 | 2.1 | Encoder login | Logueado correctamente | [ ] |
| 2 | 2.2 | Ver dashboard | Banner rojo visible | [ ] |
| 2 | 2.3 | Click ver archivo | Navega a /visualizator | [ ] |
| 3 | 3.1 | Verificar alerta | Alerta roja visible en /visualizator | [ ] |
| 3 | 3.2 | Editar AT | Campo editable, cambio guardado | [ ] |
| 3 | 3.3 | Editar AT_detalle | Dropdown funciona | [ ] |
| 3 | 3.4 | Guardar | Cambios persistidos | [ ] |
| 4 | 4.1 | Buscar botón Submit | Botón visible | [ ] |
| 4 | 4.2 | Click Submit | Modal abre | [ ] |
| 4 | 4.3 | Confirmar | Modal procesa | [ ] |
| 4 | 4.4 | Esperar resultado | Estado cambió a pending_finance | [ ] |
| 5 | 5.1 | Finance login | Logueado correctamente | [ ] |
| 5 | 5.2 | Dashboard | Banner visible | [ ] |
| 5 | 5.3 | Ver archivo | Se carga correctamente | [ ] |
| 5 | 5.4 | Editar campos Finance | Campos editables, cambios guardados | [ ] |
| 5 | 5.5 | Submit Finance | Estado a pending_admin | [ ] |
| 6 | 6.1 | Admin login | Logueado correctamente | [ ] |
| 6 | 6.2 | Ver archivo | Se carga en pending_admin | [ ] |
| 6 | 6.3 | Revisar cambios | Todos los cambios visibles | [ ] |
| 6 | 6.4 | Aprobar | Estado aprobado, botón descargar visible | [ ] |
| 6 | 6.5 | Descargar | Archivo se descarga correctamente | [ ] |

---

## 🐛 Bugs Encontrados (si aplica)

Documentar aquí cualquier error o comportamiento inesperado:

### Bug #1
- **Description:** [Descripción del problema]
- **Steps to Reproduce:** [Pasos para reproducir]
- **Expected:** [Comportamiento esperado]
- **Actual:** [Comportamiento real]
- **Severity:** [Critical / High / Medium / Low]

---

## 📝 Notas de Testing

### Ambiente
- URL: https://dataunion.vercel.app
- Branch: develop
- Fecha de prueba: [Hoy]
- Tester: [Tu nombre]

### Observaciones Generales
- [Agregar aquí observaciones generales]

### Performance
- Tiempo promedio de carga de /visualizator: [ ] segundos
- Tiempo de Submit: [ ] segundos
- Tiempo de rechazo: [ ] segundos

---

## ✅ Checklist Final

- [ ] CASE 1 completado sin errores
- [ ] CASE 2 completado sin errores
- [ ] CASE 3 completado sin errores
- [ ] CASE 4 completado sin errores
- [ ] CASE 5 completado sin errores
- [ ] CASE 6 completado sin errores
- [ ] Todos los estados transicionan correctamente
- [ ] Todas las notificaciones se muestran correctamente
- [ ] No hay errores en la consola (F12 → Console)
- [ ] Archivo final se descarga y abre correctamente

---

## 🎯 Resultado Final

**TESTING E2E:** [ ] PASSED / [ ] FAILED

**Resumen:**
- Casos pasados: __/6
- Casos fallidos: __/6
- Issues críticas encontradas: __
- Issues menores encontradas: __

**Signature:**
Tester: ________________  
Date: ________________  
Time: ________________
