# Quick Start - Testing de Rechazo

**Duración estimada:** 15-20 minutos  
**Requisitos:** Navegador web, 3 cuentas de usuario (Encoder, Finance, Admin)

---

## 🚀 Inicio Rápido

### Paso 1: Preparar Ambiente

```bash
# 1. Asegurar que estamos en rama develop
git checkout develop

# 2. Actualizar dependencias (si es necesario)
npm install

# 3. Iniciar servidor local (si no está corriendo)
npm run dev
```

URL: http://localhost:3000 (local) o https://dataunion.vercel.app (producción)

---

### Paso 2: Preparar Datos (Estado Inicial)

Necesitamos un archivo en estado `pendiente_admin` para empezar.

**Opción A: Usar Archivo Existente**
- Si ya hay un archivo en `pending_admin` en BD, saltar a Paso 3

**Opción B: Crear Flujo Nuevo (5 min)**

```sql
-- En Supabase SQL Editor, ejecutar:

-- 1. Crear GRD simulado (si no existe)
INSERT INTO grd_fila (id_grd_oficial, episodio, estado, AT, AT_detalle)
VALUES 
  (999, 'EP001', 'pendiente_admin', false, NULL),
  (999, 'EP002', 'pendiente_admin', false, NULL),
  (999, 'EP003', 'pendiente_admin', true, 'Reintegro');

-- 2. Verificar que se creó
SELECT id, episodio, estado FROM grd_fila WHERE id_grd_oficial = 999;
```

---

### Paso 3: Ejecutar Testing

#### **CASE 1: Admin Rechaza (3 min)**

```
1. Login: admin@dataunion.cl / Admin123!
2. Go to: https://dataunion.vercel.app/visualizator
3. Find: "❌ Rechazar Archivo" button
4. Click: Rechazar
5. Modal: Ingresa razón > 10 caracteres
6. Confirm: "❌ Rechazar Archivo"
7. Verify: Alert "✅ Archivo rechazado"
```

**Resultado esperado:** Estado en BD cambió a `rechazado`

---

#### **CASE 2: Encoder Notificación (2 min)**

```
1. Logout: Admin
2. Login: codificador@dataunion.cl / Admin123!
3. Go to: https://dataunion.vercel.app/dashboard
4. Verify: Banner rojo con razón del rechazo
5. Click: "Ver archivo"
6. Verify: Alerta en /visualizator
```

**Resultado esperado:** Encoder ve notificación con razón

---

#### **CASE 3: Encoder Reedit (4 min)**

```
1. En /visualizator como Encoder
2. Doble-click en columna "AT" de una fila
3. Cambiar a: "Sí" o "No"
4. Doble-click en "AT_detalle"
5. Seleccionar un AT del dropdown
6. Press ENTER para guardar
```

**Resultado esperado:** Cambios se guardan sin error

---

#### **CASE 4: Encoder Submit (3 min)**

```
1. En /visualizator como Encoder
2. Find: "Entregar a Finanzas" button (azul)
3. Click: Entregar a Finanzas
4. Modal: Click "Sí, Enviar a Finanzas"
5. Verify: Alert "✅ Archivo entregado a Finanzas"
```

**Resultado esperado:** Estado cambió a `pendiente_finance`

---

#### **CASE 5: Finance Continúa (3 min)**

```
1. Logout: Encoder
2. Login: finanzas@dataunion.cl / Admin123!
3. Go to: https://dataunion.vercel.app/dashboard
4. Verify: Banner con archivo pendiente
5. Click: "Ver archivo"
6. Doble-click en "n_folio"
7. Ingresa: "2024-001"
8. Press ENTER
9. Click: "Entregar a Administración"
10. Confirm: "Sí, Enviar a Administración"
```

**Resultado esperado:** Estado cambió a `pendiente_admin`

---

#### **CASE 6: Admin Aprueba (2 min)**

```
1. Logout: Finance
2. Login: admin@dataunion.cl / Admin123!
3. Go to: https://dataunion.vercel.app/visualizator
4. Click: "✅ Aprobar Archivo"
5. Verify: Alert "✅ Archivo aprobado"
6. Verify: Botón "📥 Descargar Excel" aparece
7. Click: Descargar Excel
8. Verify: Archivo se descarga
```

**Resultado esperado:** Archivo descargado correctamente

---

## ✅ Checklist Rápido

Marcar cada CASE conforme se completa:

- [ ] CASE 1: Admin rechaza ✅
- [ ] CASE 2: Encoder ve notificación ✅
- [ ] CASE 3: Encoder puede reeditarlo ✅
- [ ] CASE 4: Encoder reenvia ✅
- [ ] CASE 5: Finance continúa ✅
- [ ] CASE 6: Admin aprueba ✅

---

## 🔍 Debugging

### Si hay error en CASE 1

```
1. Abrir DevTools (F12)
2. Console: ¿Hay errores rojo?
3. Network: Ver petición POST /api/v1/grd/[id]/review
4. Response: ¿Status 200?
```

### Si hay error en CASE 2

```
1. Verificar en BD: SELECT * FROM grd_fila WHERE estado = 'rechazado'
2. ¿Hay algún registro? Si no, CASE 1 falló
3. Si sí, verificar en Network que dashboard hace GET a active-workflow
```

### Si hay error en CASE 3-4

```
1. Network: Ver PUT /api/v1/grd/rows/[episodio]
2. Response: ¿Status 200? ¿Cambio se persistió en BD?
3. Refrescar página y verificar que el cambio está
```

---

## 📊 Resultado

Si todos los CASE pasan: ✅ **TESTING EXITOSO**

Si hay errores:
1. Documentar el error en el formato TESTING-RECHAZO-E2E.md
2. Crear issue en GitHub con: pasos, error, screenshot
3. Asignar a developer correspondiente

---

## 💾 Cleanup (Opcional)

Después de testing, limpiar datos:

```sql
-- Borrar datos de prueba
DELETE FROM grd_fila WHERE id_grd_oficial = 999;
```

---

## 📞 Soporte

Si hay problemas:
1. Verificar status de Supabase: https://status.supabase.com
2. Revisar logs en Vercel: https://vercel.com/dashboard
3. Contactar equipo: [contact info]

---

**¡Listo! Comenzar testing ahora →** https://dataunion.vercel.app/login
