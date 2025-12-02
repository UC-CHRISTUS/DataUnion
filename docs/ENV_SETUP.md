# Configuración de Variables de Entorno

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cgjeiyevnlypgghsfemc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## ¿Dónde obtener estas credenciales?

1. Ve al dashboard de Supabase: <https://supabase.com/dashboard/project/cgjeiyevnlypgghsfemc/settings/api>

2. Copia los valores:
   - **URL del proyecto**: `https://cgjeiyevnlypgghsfemc.supabase.co`
   - **anon/public key**: La clave pública que aparece en "Project API keys"

## ⚠️ IMPORTANTE

- El archivo `.env.local` NO debe ser commiteado al repositorio (ya está en .gitignore)
- La `ANON_KEY` es segura para usar en el cliente (tiene permisos limitados por RLS)
- NUNCA expongas la `SERVICE_ROLE_KEY` en el cliente

## Verificar configuración

Después de crear el archivo `.env.local`, reinicia el servidor de desarrollo:

```bash
npm run dev
```

Si las variables están correctas, deberías poder acceder a:

- Login: <http://localhost:3000/login>
- Sign Up: <http://localhost:3000/signup>
