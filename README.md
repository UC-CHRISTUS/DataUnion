# Frontend UC-Christus 🏥

## Deploy

[pincha aquí](https://dataunion.vercel.app/dashboard)

## Consideraciones

manejador de paquetes: **npm** ‼️

### Instalar dependencias

```bash
npm install
```

### Cómo correr 🏇🏻

```bash
npm run dev
```

## Tecnología utilizada

- Next JS 15.5.4
- TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS 4
- ESLint

## ⚙️ Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (ver `ENV_SETUP.md` para detalles):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://cgjeiyevnlypgghsfemc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Correr en desarrollo

```bash
npm run dev
```

El proyecto estará disponible en: `http://localhost:3000`

## 🔐 Autenticación

- **Login:** `/login`
- **Sign Up:** `/signup`
- **Dashboard:** `/dashboard` (requiere autenticación)

## 📊 Estado del Proyecto

### ✅ Completado (30/octubre/2025)

- Setup inicial de Next.js + TypeScript
- Integración con Supabase
- Tabla `users` en base de datos con RLS y triggers de sincronización
- Sistema de roles en inglés (`admin`, `encoder`, `finance`)
- Componentes de Sign In y Sign Up
- API routes de autenticación (`/api/auth/*`)
- Constantes de roles centralizadas

### 🚧 En Progreso

- Dashboard de administración
- CRUD de usuarios (HU-01)
- Gestión de permisos por rol (HU-02)

### 📖 Documentación

- `docs/ARCHITECTURE.md` - Arquitectura completa del sistema
- `ENV_SETUP.md` - Configuración de variables de entorno
- `planning/TASK.md` - Backlog y tareas

Ver `planning/TASK.md` para más detalles.
