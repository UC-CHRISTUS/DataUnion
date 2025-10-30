# 🏗️ Arquitectura del Sistema DataUnion

## 📊 **Arquitectura de Usuarios**

### **Dos tablas de usuarios: `auth.users` y `public.users`**

El sistema utiliza **dos tablas diferentes** para manejar usuarios:

#### **1. `auth.users` (Esquema `auth` - Nativo de Supabase)**

**Responsabilidad:** Autenticación y seguridad

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | ID único del usuario (auth_id) |
| `email` | `varchar` | Email de login |
| `encrypted_password` | `varchar` | Contraseña hasheada |
| `raw_user_meta_data` | `jsonb` | Metadata personalizada (full_name, role) |
| `created_at` | `timestamptz` | Fecha de creación |
| `last_sign_in_at` | `timestamptz` | Último login |

**Características:**
- ✅ Tabla **nativa de Supabase** (no modificable)
- 🔐 Maneja autenticación, tokens, sesiones
- 🚫 **NO se debe consultar directamente desde el frontend**

---

#### **2. `public.users` (Esquema `public` - Personalizada)**

**Responsabilidad:** Datos de negocio y permisos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `uuid` | ID único de la tabla (PK) |
| `auth_id` | `uuid` | **Vinculado a `auth.users.id`** |
| `email` | `varchar` | Email copiado (para consultas) |
| `full_name` | `varchar` | Nombre completo del usuario |
| `role` | `user_role` | **Rol del usuario (enum)** |
| `is_active` | `boolean` | Activo/Inactivo (soft delete) |
| `created_at` | `timestamptz` | Fecha de creación |
| `updated_at` | `timestamptz` | Última actualización |
| `last_login` | `timestamptz` | Último login registrado |

**Características:**
- ✅ Tabla **100% personalizable**
- 📝 Almacena datos de negocio
- 🔍 Se consulta desde el frontend con RLS

---

### **🔗 Sincronización Automática**

**Trigger:** `on_auth_user_created`  
**Función:** `handle_new_user()`

**Flujo de creación de usuario:**

```
1. Usuario se registra en /api/auth/signup
         ↓
2. Se crea en auth.users ✅
         ↓
3. TRIGGER automático se ejecuta ⚡
         ↓
4. Se crea en public.users ✅
         ↓
5. Usuario puede hacer login y acceder al sistema
```

**Código del trigger:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value public.user_role;
BEGIN
  -- Mapea el rol desde metadata
  user_role_value := CASE 
    WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role
    WHEN NEW.raw_user_meta_data->>'role' = 'encoder' THEN 'encoder'::public.user_role
    WHEN NEW.raw_user_meta_data->>'role' = 'finance' THEN 'finance'::public.user_role
    ELSE 'encoder'::public.user_role
  END;

  INSERT INTO public.users (auth_id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role_value,
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 👥 **Sistema de Roles**

### **Enum: `user_role` (en inglés)**

**¿Por qué en inglés?** 
- ✅ **Estándar de la industria**
- ✅ Evita problemas de encoding (tildes, ñ)
- ✅ Consistencia con APIs y librerías externas
- ✅ Facilita el código y la colaboración internacional

**Roles definidos:**

| Valor en DB | Label en UI | Descripción |
|-------------|-------------|-------------|
| `admin` | Administrador | Acceso completo al sistema |
| `encoder` | Codificador | Codificación de episodios |
| `finance` | Finanzas | Gestión financiera y reportes |

---

### **📁 Constantes de Roles**

**Archivo:** `src/lib/constants/roles.ts`

```typescript
export const USER_ROLES = {
  ADMIN: 'admin',
  ENCODER: 'encoder',
  FINANCE: 'finance',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.ENCODER]: 'Codificador',
  [USER_ROLES.FINANCE]: 'Finanzas',
};
```

**Uso en el código:**

```typescript
// ✅ CORRECTO - Usar constantes
import { USER_ROLES } from '@/lib/constants/roles';
if (user.role === USER_ROLES.ADMIN) { ... }

// ❌ INCORRECTO - Hardcodear strings
if (user.role === 'admin') { ... }
```

---

## 🔒 **Row Level Security (RLS)**

**Políticas activas en `public.users`:**

### **SELECT (Ver usuarios)**

1. **Usuarios pueden ver su propio perfil:**
```sql
CREATE POLICY "Allow authenticated users to view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = auth_id);
```

2. **Admins pueden ver todos los perfiles:**
```sql
CREATE POLICY "Allow admins to view all user profiles"
ON public.users FOR SELECT
USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));
```

### **INSERT (Crear usuarios)**

```sql
CREATE POLICY "Allow admins to insert new users"
ON public.users FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));
```

### **UPDATE (Actualizar usuarios)**

1. **Admins pueden actualizar cualquier usuario:**
```sql
CREATE POLICY "Allow admins to update any user profile"
ON public.users FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));
```

2. **Usuarios pueden actualizar su propio perfil:**
```sql
CREATE POLICY "Allow users to update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);
```

### **DELETE (Eliminar usuarios)**

```sql
CREATE POLICY "Allow admins to delete users"
ON public.users FOR DELETE
USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));
```

---

## 📚 **Stack Tecnológico**

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 15.5.4 | Framework React con SSR |
| TypeScript | Latest | Type safety |
| Supabase | Latest | Backend (Auth + DB) |
| PostgreSQL | 14+ | Base de datos |
| Tailwind CSS | 4 | Estilos |
| npm | Latest | Package manager |

---

## 🗂️ **Estructura de Carpetas**

```
src/
├── app/
│   ├── api/
│   │   └── auth/               # API routes de autenticación
│   │       ├── signin/
│   │       ├── signup/
│   │       ├── signout/
│   │       └── session/
│   ├── login/                  # Página de login
│   ├── signup/                 # Página de registro
│   └── dashboard/              # Dashboard (TODO)
├── components/
│   └── auth/                   # Componentes de autenticación
│       ├── SignIn.tsx
│       └── SignUp.tsx
├── lib/
│   ├── supabase.ts            # Cliente de Supabase
│   └── constants/
│       └── roles.ts           # Constantes de roles
└── types/
    └── database.types.ts      # Tipos generados de Supabase
```

---

## 🔄 **Flujo de Autenticación Completo**

### **Sign Up (Registro):**

```
1. Usuario completa formulario en /signup
         ↓
2. POST a /api/auth/signup con { email, password, fullName, role }
         ↓
3. supabase.auth.signUp() crea usuario en auth.users
         ↓
4. Trigger on_auth_user_created se ejecuta
         ↓
5. Se crea registro en public.users con role en inglés
         ↓
6. Redirect a /login
```

### **Sign In (Login):**

```
1. Usuario ingresa email y password en /login
         ↓
2. POST a /api/auth/signin con { email, password }
         ↓
3. supabase.auth.signInWithPassword() valida credenciales
         ↓
4. Se crea sesión con JWT token
         ↓
5. Redirect a /dashboard
```

---

## 🚀 **Próximos Pasos**

- [ ] Dashboard de administración
- [ ] CRUD de usuarios (HU-01)
- [ ] Sistema de permisos por rol (HU-02)
- [ ] Tests unitarios
- [ ] Tests E2E

---

**Última actualización:** 30 de Octubre, 2025  
**Responsable:** Joaquín Peralta

