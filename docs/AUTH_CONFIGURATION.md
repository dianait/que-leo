# Configuración de Autenticación

## URLs de Redirección

Para que el login con GitHub funcione correctamente, necesitas configurar las URLs de redirección en dos lugares:

### 1. Supabase Dashboard

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. Configura:
   - **Site URL**: Tu URL de producción (ej: `https://que-leo.vercel.app`)
   - **Redirect URLs**: Agrega todas las URLs donde quieres que redirija después del login

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication Redirect URL (opcional)
# Si no se especifica, se detecta automáticamente según el entorno
VITE_AUTH_REDIRECT_URL=https://que-leo.vercel.app
```

### 3. Configuración Automática

El archivo `src/domain/config/auth.ts` ahora detecta automáticamente el entorno:

```typescript
export const AUTH_CONFIG = {
  REDIRECT_URL: (() => {
    // Si hay una variable de entorno específica, úsala
    if (import.meta.env.VITE_AUTH_REDIRECT_URL) {
      return import.meta.env.VITE_AUTH_REDIRECT_URL;
    }

    // En desarrollo local, usa la URL actual
    if (import.meta.env.DEV) {
      return window.location.origin;
    }

    // En producción, usa la URL de producción
    return "https://que-leo.vercel.app";
  })(),

  ALLOWED_REDIRECT_URLS: [
    "http://localhost:5173", // Desarrollo local
    "http://localhost:3000", // Puerto alternativo
    "https://que-leo.vercel.app", // Tu dominio de producción
  ],
};
```

## Cómo Funciona

### Desarrollo Local (`npm run dev`)

- ✅ Usa automáticamente `http://localhost:5173`
- ✅ No necesitas configurar `VITE_AUTH_REDIRECT_URL`
- ✅ Funciona inmediatamente sin configuración adicional

### Producción (Vercel)

- ✅ Usa automáticamente la URL de producción configurada
- ✅ O puedes especificar `VITE_AUTH_REDIRECT_URL` en las variables de entorno de Vercel

## URLs Recomendadas

### Desarrollo Local

- `http://localhost:5173`
- `http://localhost:3000`

### Producción (Vercel)

- `https://que-leo.vercel.app`

## Solución de Problemas

### Error: "Invalid redirect URL"

1. Verifica que la URL esté en la lista de `ALLOWED_REDIRECT_URLS`
2. Asegúrate de que la URL esté configurada en Supabase Dashboard
3. Verifica que no haya espacios o caracteres extra en la URL

### Error: "Provider not enabled"

1. Ve a Supabase Dashboard → Authentication → Providers
2. Habilita GitHub como proveedor
3. Configura el Client ID y Client Secret de GitHub
