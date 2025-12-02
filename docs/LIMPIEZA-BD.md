# Plan de Limpieza de Base de Datos - Documentos en Flujo

**Fecha:** 2 de Diciembre, 2025  
**Objetivo:** Limpiar la BD de documentos en flujo para resetear el ambiente de testing

---

## 📊 Estado Actual de la Base de Datos

### Resumen de Documentos en Flujo

| Estado | Total Filas | Total Archivos | Descripción |
|--------|------------|-----------------|------------|
| `borrador_encoder` | 0 | 0 | Archivos en edición por Encoder |
| `pendiente_finance` | 544 | 1 | Archivos esperando revisión de Finance ⚠️ |
| `borrador_finance` | 0 | 0 | Archivos en edición por Finance |
| `pendiente_admin` | 0 | 0 | Archivos esperando aprobación de Admin |
| `rechazado` | 0 | 0 | Archivos rechazados |
| **TOTAL** | **544** | **1** | - |

### Archivo en Flujo

- **ID GRD Oficial:** 68
- **Total de Filas (Episodios):** 544
- **Estado Actual:** `pendiente_finance`
- **Acción Requerida:** Limpiar este archivo para liberar el flujo

---

## 🧹 Opciones de Limpieza

### Opción 1: Limpiar Completamente (RECOMENDADO para Testing Fresh)

**Impacto:** Borra el archivo GRD completo  
**Tiempo:** < 1 segundo  
**Reversible:** No (pero se puede reimportar desde SIGESA)

```sql
-- Opción 1: Borrar todo el archivo GRD ID 68
DELETE FROM grd_fila WHERE id_grd_oficial = 68;
```

**Resultado:** Sistema completamente limpio para nuevo testing

---

### Opción 2: Cambiar Estado a "Exportado" (PRESERVA DATOS)

**Impacto:** Cierra el flujo pero conserva los datos  
**Tiempo:** < 1 segundo  
**Reversible:** Sí (cambiar estado de vuelta)

```sql
-- Opción 2: Cambiar estado a exportado (finaliza flujo normalmente)
UPDATE grd_fila SET estado = 'exportado' WHERE id_grd_oficial = 68;
```

**Resultado:** Archivo cierra el flujo sin errores, datos preservados

---

### Opción 3: Cambiar Estado a "Borrador Encoder" (REINICIAR FLUJO)

**Impacto:** Devuelve el archivo a Encoder para re-edición  
**Tiempo:** < 1 segundo  
**Reversible:** Sí

```sql
-- Opción 3: Volver a borrador_encoder para re-editar
UPDATE grd_fila SET estado = 'borrador_encoder' WHERE id_grd_olivier = 68;
```

**Resultado:** Encoder puede volver a editar desde el principio

---

## 🎯 Recomendación

**Para TESTING E2E de Rechazo:**

### Plan Recomendado

1. **Primero:** Exportar archivo actual (Opción 2)
   ```sql
   UPDATE grd_fila SET estado = 'exportado' WHERE id_grd_oficial = 68;
   ```
   - Cierra flujo correctamente sin perder datos
   - Si algo sale mal, datos están disponibles

2. **Luego:** Reimportar archivo SIGESA nuevo
   - Usar la función de upload en `/upload`
   - Comenzar testing desde cero con archivo fresco

3. **O simplemente:** Borrar el archivo viejo (Opción 1)
   ```sql
   DELETE FROM grd_fila WHERE id_grd_oficial = 68;
   ```
   - Limpia completamente
   - Testing comienza desde archivo nuevo

---

## ⚠️ Consideraciones Importantes

### Antes de Ejecutar la Limpieza

- [ ] ¿Hay datos en producción que necesites preservar?
- [ ] ¿Este es ambiente de testing o producción?
- [ ] ¿Tus usuarios necesitan datos históricos?

### Impacto en Usuarios

- **Encoder:** Perderá acceso a archivos en borrador_encoder
- **Finance:** Perderá acceso a archivos en pendiente_finance
- **Admin:** Perderá acceso a archivos en pendiente_admin

---

## 🔄 Paso a Paso - Opción Recomendada

### PASO 1: Exportar Archivo (Cierre Normal)

```sql
-- Cambiar estado a exportado
UPDATE grd_fila SET estado = 'exportado' WHERE id_grd_oficial = 68;

-- Verificar que cambió
SELECT estado, COUNT(*) FROM grd_fila WHERE id_grd_oficial = 68 GROUP BY estado;
```

**Resultado esperado:** 544 filas con estado `exportado`

---

### PASO 2: Verificar Limpieza

```sql
-- Verificar que no hay archivos en flujo activo
SELECT estado, COUNT(*) FROM grd_fila 
WHERE estado IN ('borrador_encoder', 'pendiente_finance', 'borrador_finance', 'pendiente_admin', 'rechazado')
GROUP BY estado;
```

**Resultado esperado:** 0 resultados (vacío)

---

### PASO 3: Reimportar Archivo SIGESA (Opcional)

Si quieres volver a probar desde cero:

1. En la aplicación, ir a `/upload`
2. Login como Encoder
3. Seleccionar nuevo archivo SIGESA
4. Cargarlo
5. Comenzar testing

---

## ✅ Checklist de Limpieza

- [ ] Verificar ambiente (¿testing o producción?)
- [ ] Hacer backup de datos (si es crítico)
- [ ] Ejecutar opción de limpieza elegida
- [ ] Verificar que se ejecutó correctamente
- [ ] Confirmar que sistema está limpio

---

## 🔍 Verificación Post-Limpieza

Después de ejecutar la limpieza, verificar:

```sql
-- 1. Ver estado de archivos en flujo
SELECT estado, COUNT(*) as total FROM grd_fila 
WHERE estado IN ('borrador_encoder', 'pendiente_finance', 'borrador_finance', 'pendiente_admin', 'rechazado')
GROUP BY estado;

-- 2. Si fue limpieza completa, verificar que GRD 68 no existe
SELECT COUNT(*) as total_filas FROM grd_fila WHERE id_grd_oficial = 68;

-- 3. Ver próximo archivo disponible para testing
SELECT DISTINCT id_grd_oficial, MIN(id) FROM grd_fila 
WHERE estado NOT IN ('borrador_encoder', 'pendiente_finance', 'borrador_finance', 'pendiente_admin', 'rechazado')
GROUP BY id_grd_oficial LIMIT 5;
```

---

## 📞 Soporte

Si hay problemas durante la limpieza:

1. **Error de conexión:** Verificar credenciales de Supabase
2. **Permiso denegado:** Verificar que tienes acceso admin en Supabase
3. **Datos no borrados:** Verificar que la consulta SQL fue correcta

---

## 🎯 Resultado Esperado

**Ambiente Limpio para Testing:**
- ✅ Sistema sin archivos en flujo activo
- ✅ Encoder puede subir archivo nuevo
- ✅ Finance/Admin sin notificaciones pendientes
- ✅ Dashboard limpio
- ✅ Listo para PASO 3 de Testing E2E

---

**¿Ejecutar limpieza?** Sí / No

Si sí, elegir opción:
- [ ] Opción 1: Borrar completamente
- [ ] Opción 2: Cambiar a exportado (RECOMENDADO)
- [ ] Opción 3: Volver a borrador_encoder
