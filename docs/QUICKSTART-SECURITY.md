# 🎯 QUICK START - Security Testing

## Paso a Paso para Ejecutar los Tests

### 1️⃣ Verificar Prerequisitos

```bash
# 1. Verificar que tienes Node.js instalado
node --version  # Debe ser v18+

# 2. Instalar dependencias (si aún no lo hiciste)
npm install

# 3. Verificar que .env.local existe
ls .env.local

# 4. Verificar variables de entorno
cat .env.local | grep SUPABASE
```

### 2️⃣ Iniciar el Servidor

```bash
# En una terminal separada
npm run dev

# Espera a ver:
# ✓ Ready in XXXms
# ○ Local: http://localhost:3000
```

### 3️⃣ Ejecutar Tests de Seguridad

```bash
# Opción A: Ejecutar TODOS los 40 tests (10-15 minutos)
npm run test:security

# Opción B: Ejecutar solo tests de autenticación (1-2 minutos)
npm run test:security:auth

# Opción C: Ejecutar solo tests de autorización (2-3 minutos)
npm run test:security:authz

# Opción D: Ejecutar todos con Jest directamente
npm run test:security:all
```

---

## 📋 Checklist Pre-Testing

Antes de ejecutar los tests, verifica:

- [ ] **Servidor corriendo:** `npm run dev` activo en otra terminal
- [ ] **Puerto 3000 libre:** No hay otro proceso usando el puerto
- [ ] **.env.local configurado:**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **Usuarios de prueba existen en Supabase:**
  - [ ] `codificador@dataunion.cl` - Password: `Admin123!`
  - [ ] `finanzas@dataunion.cl` - Password: `Admin123!`
  - [ ] `admin@dataunion.cl` - Password: `Admin123!`
- [ ] **Base de datos con data de prueba:**
  - [ ] Al menos 1 archivo GRD en la base de datos
  - [ ] Al menos 1 episodio con ID válido

---

## 🎬 Ejemplo de Ejecución Exitosa

```bash
$ npm run test:security:auth

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🔐 DATAUNION SECURITY TEST SUITE 🔐                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

🔑 Running: Authentication Tests

 PASS  src/__tests__/security/auth.security.test.ts
  🔴 CRITICAL - Authentication Security Tests
    ✓ AUTH-001: Access protected routes without login (245 ms)
    ✓ AUTH-002: Expired or invalid token (123 ms)
    ✓ AUTH-004: Backend validates role, not localStorage (456 ms)
    ✓ AUTH-005: SQL Injection in login form (789 ms)

════════════════════════════════════════════════════════════
📊 Authentication - Test Summary
════════════════════════════════════════════════════════════
Total: 5
✅ Passed: 5
❌ Failed: 0
Success Rate: 100.00%
════════════════════════════════════════════════════════════

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Time:        8.456 s
```

---

## ❌ Ejemplo de Test Fallido (Vulnerabilidad Encontrada)

```bash
 FAIL  src/__tests__/security/auth.security.test.ts
  🔴 CRITICAL - Authentication Security Tests
    ✕ AUTH-001: Access protected routes without login (523 ms)

  ● AUTH-001 › Access protected routes without login

    ❌ SECURITY BREACH: Route /api/v1/grd/1 returned 200 instead of 401/403

      42 |           if (response.status !== 401 && response.status !== 403) {
      43 |             throw new Error(
    > 44 |               `❌ SECURITY BREACH: Route ${route} returned ${response.status}`
         |                ^
      45 |             );
      46 |           }
```

**Cuando veas esto:**

1. 🔴 **Detén todo** - ¡Hay una vulnerabilidad crítica!
2. 📸 **Captura screenshot** del error completo
3. 📝 **Documenta en** `docs/EVIL-USER-TESTING.md`
4. 🐛 **Crea issue** con label `security`
5. 🔧 **Arregla inmediatamente** antes de continuar

---

## 🧪 Testing Individual

Para probar un test específico:

```bash
# Ejecutar solo TEST-AUTH-001
npm test -- src/__tests__/security/auth.security.test.ts -t "AUTH-001"

# Ejecutar con output detallado
npm test -- src/__tests__/security/auth.security.test.ts --verbose

# Ejecutar en modo watch (re-ejecuta al guardar cambios)
npm test -- src/__tests__/security/auth.security.test.ts --watch
```

---

## 📊 Ver Resultados Guardados

Los resultados se guardan automáticamente:

```bash
# Ver último resultado
cat jest-results.json | jq '.numPassedTests, .numFailedTests'

# Ver tests fallidos
cat jest-results.json | jq '.testResults[].assertionResults[] | select(.status == "failed")'
```

---

## 🆘 Solución de Problemas

### Error: "Command not found: jest"
```bash
npm install
```

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"
```bash
# Encuentra el proceso
lsof -i :3000

# Mátalo
kill -9 <PID>

# O cambia el puerto
PORT=3001 npm run dev
```

### Tests tardan mucho
- ✅ **Normal:** Los tests de seguridad tardan 10-15 minutos en total
- ⚡ **Acelerar:** Ejecuta por categoría en vez de todos juntos

### Tests fallan por timeout
```bash
# Aumenta el timeout en jest.config.ts
testTimeout: 30000  # 30 segundos
```

---

## 🎓 Próximos Pasos

Después de ejecutar los tests:

1. **Revisar resultados** en la terminal
2. **Documentar bugs** encontrados
3. **Priorizar fixes** (CRÍTICO primero)
4. **Re-ejecutar** después de cada fix
5. **Celebrar** cuando todos pasen ✅

---

## 📚 Documentación Completa

- **Lista completa de tests:** `docs/EVIL-USER-TESTING.md`
- **Guía detallada:** `docs/SECURITY-TESTING-GUIDE.md`
- **Setup de tests:** `src/__tests__/security/setup.ts`

---

**¿Listo para empezar?**

```bash
npm run test:security
```

🚀 **¡Buena suerte encontrando bugs!**
