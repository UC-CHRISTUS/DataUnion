# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

For more specific information about the project, refer to the [docs](./docs) folder.

## Project Overview

DataUnion is a healthcare data management system for UC-Christus hospital. It handles GRD (Grupos Relacionados por el Diagnóstico) episode data, SIGESA file uploads, and financial workflow processing. The UI is in Spanish.

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack

- Next.js 15.5.4 with App Router
- TypeScript (strict mode)
- Supabase (PostgreSQL + Auth with RLS)
- Tailwind CSS 4
- Zod for validation
- AG-Grid/Handsontable for data tables

### User Authentication System

Two-table architecture synced via database trigger:

- `auth.users` (Supabase native) - handles authentication
- `public.users` - stores business data (role, is_active, must_change_password)

Roles are defined in `src/lib/constants/roles.ts`:

- `admin` - full system access
- `encoder` - episode coding (can access /upload)
- `finance` - financial management

Always use `USER_ROLES` constants, never hardcode role strings.

### Workflow States

Episodes (`grd_fila`) follow this workflow (`workflow_estado` enum):

```plaintext
borrador_encoder → pendiente_finance → borrador_finance → pendiente_admin → aprobado → exportado
                                                                         ↘ rechazado
```

### API Structure

Routes use versioned paths: `/api/v1/{resource}`

Key patterns in `src/lib/api/`:

- `response.ts` - standardized JSON responses (`successResponse`, `errorResponse`, `handleError`)
- `validation.ts` - common Zod schemas (`paginationSchema`, `idSchema`, `episodioSchema`)
- `pagination.ts` - paginated response helpers

Route schemas are colocated: `route.ts` with `route.schema.ts`

### Key Data Tables

- `sigesa` / `sigesa_fila` - uploaded SIGESA file data
- `grd_oficial` / `grd_fila` - GRD episode records (linked to sigesa via episodio)
- `norma_minsal` - MINSAL reference data
- `ajustes_tecnologias` / `episodio_AT` - technology adjustments per episode

### Database Types

Generated types in `src/types/database.types.ts`. Use `Database` type with Supabase client:

```typescript
import { Database } from '@/types/database.types'
```

### Middleware

`src/middleware.ts` handles:

- Auth protection (redirects unauthenticated to /login)
- Role-based route restrictions (/dashboard/users = admin only, /upload = encoder only)

### Path Aliases

Use `@/*` for imports from `src/`:

```typescript
import { USER_ROLES } from '@/lib/constants/roles'
```

## Environment Variables

Required in `.env.local`:

```plaintext
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```
