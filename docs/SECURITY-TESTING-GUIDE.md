# 🔐 Security Testing Guide

## Cómo Ejecutar los Tests de Seguridad

Este proyecto incluye 40 tests críticos de seguridad organizados en 8 categorías.

### Prerequisitos

1. **Servidor en ejecución:**
   ```bash
   npm run dev
   ```

2. **Variables de entorno configuradas:**
   - `.env.local` debe contener:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Usuarios de prueba creados en Supabase:**
   - `codificador@dataunion.cl` (rol: encoder)
   - `finanzas@dataunion.cl` (rol: finance)
   - `admin@dataunion.cl` (rol: admin)

---

## 🚀 Ejecución Rápida

### Opción 1: Ejecutar TODOS los tests (recomendado)

```bash
node scripts/run-security-tests.js
```

### Opción 2: Ejecutar por categoría

```bash
# Tests de Autenticación (5 tests)
npm test -- src/__tests__/security/auth.security.test.ts

# Tests de Autorización - Encoder (4 tests)
npm test -- src/__tests__/security/authz-encoder.security.test.ts

# Tests de Autorización - Finance & Admin (3 tests)
npm test -- src/__tests__/security/authz-finance-admin.security.test.ts

# Tests de Validación (2 tests)
npm test -- src/__tests__/security/validation.security.test.ts

# Tests de Workflow (3 tests)
npm test -- src/__tests__/security/workflow.security.test.ts

# Tests de API (5 tests)
npm test -- src/__tests__/security/api.security.test.ts

# Tests de Upload (3 tests)
npm test -- src/__tests__/security/upload.security.test.ts

# Tests de Export (3 tests)
npm test -- src/__tests__/security/export.security.test.ts
```

### Opción 3: Ejecutar un test específico

```bash
npm test -- src/__tests__/security/auth.security.test.ts -t "AUTH-001"
```

---

## 📋 Categorías de Tests

### 🔑 1. Authentication (5 tests)
- **AUTH-001:** Acceso sin login
- **AUTH-002:** Token expirado
- **AUTH-004:** Manipulación de localStorage
- **AUTH-005:** SQL Injection en login

### 👤 2. Authorization - Encoder (4 tests)
- **AUTHZ-001:** Encoder accede a gestión de usuarios
- **AUTHZ-002:** Encoder aprueba archivo vía API
- **AUTHZ-003:** Encoder edita campos de Finance
- **AUTHZ-004:** Encoder edita en estado pendiente_finance

### 👥 3. Authorization - Finance & Admin (3 tests)
- **AUTHZ-005:** Finance edita campos de Encoder
- **AUTHZ-006:** Finance aprueba archivo
- **AUTHZ-007:** Admin edita datos (debería ser read-only)

### 🛡️ 4. Input Validation (2 tests)
- **VAL-002:** XSS en campos de texto
- **VAL-003:** SQL Injection en campos

### 🔄 5. Workflow & State (3 tests)
- **WF-001:** Cambiar estado manualmente vía API
- **WF-005:** Múltiples archivos en flujo simultáneamente
- **WF-008:** Editar archivo exportado

### 🌐 6. API Security (5 tests)
- **API-001:** APIs sin autenticación
- **API-002:** POST endpoints sin autenticación
- **API-003:** Datos sensibles sin autenticación
- **API-004:** Encoder llama API de admin
- **API-005:** SQL Injection en query params

### 📤 7. File Upload (3 tests)
- **UPLOAD-001:** Archivo ejecutable
- **UPLOAD-008:** Path traversal en nombre
- **UPLOAD-009:** Race condition (10 archivos simultáneos)

### 📥 8. Export (3 tests)
- **EXPORT-001:** Exportar sin aprobar
- **EXPORT-002:** Encoder exporta archivo
- **EXPORT-005:** Integridad de datos exportados

---

## 📊 Interpretación de Resultados

### ✅ Test Pasado
El sistema está protegido contra esa vulnerabilidad.

### ❌ Test Fallado
**¡VULNERABILIDAD ENCONTRADA!** Requiere atención inmediata.

### ⚠️ Test con Warning
Posible problema, revisar manualmente.

---

## 🐛 Reportar Bugs

Si encuentras una vulnerabilidad:

1. **No la divulgues públicamente**
2. Documenta en `docs/EVIL-USER-TESTING.md` usando el template
3. Asigna severidad: 🔴 CRÍTICO / 🟡 IMPORTANTE / 🟢 MEJORA
4. Crea issue en el repositorio con label `security`

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@jest/globals'"
```bash
npm install
```

### Error: "Dev server not running"
```bash
npm run dev
```

### Error: "Login failed"
Verifica que los usuarios existan en Supabase con las contraseñas correctas.

### Tests muy lentos
Los tests de seguridad pueden tardar 5-10 minutos en total.

---

## 📚 Recursos

- **Documentación completa:** `docs/EVIL-USER-TESTING.md`
- **Setup de tests:** `src/__tests__/security/setup.ts`
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/

---

## ⚡ Quick Reference

```bash
# Ver todos los tests disponibles
npm test -- --listTests | grep security

# Ejecutar con coverage
npm test -- src/__tests__/security --coverage

# Ejecutar en modo watch
npm test -- src/__tests__/security --watch

# Ejecutar con output detallado
npm test -- src/__tests__/security --verbose
```

---

**Última actualización:** Diciembre 3, 2025
