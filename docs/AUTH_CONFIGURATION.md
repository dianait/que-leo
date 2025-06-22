# Configuración de Autenticación

## URLs de Redirección

Para que el login con GitHub funcione correctamente, necesitas configurar las URLs de redirección en dos lugares:

### 1. Supabase Dashboard

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. Configura:
   - **Site URL**: Tu URL de producción (ej: `https://tu-app.vercel.app`)
   - **Redirect URLs**: Agrega todas las URLs donde quieres que redirija después del login

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication Redirect URL (opcional)
VITE_AUTH_REDIRECT_URL=https://tu-dominio.vercel.app
```

### 3. Configuración en el Código

El archivo `src/config/auth.ts` contiene la configuración de URLs permitidas:

```typescript
export const AUTH_CONFIG = {
  REDIRECT_URL:
    import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin,

  ALLOWED_REDIRECT_URLS: [
    "http://localhost:5173", // Desarrollo local
    "http://localhost:3000", // Puerto alternativo
    "https://tu-dominio.vercel.app", // Tu dominio de producción
    "https://tu-dominio.com", // Tu dominio personalizado
  ],
};
```

## URLs Recomendadas

### Desarrollo Local

- `http://localhost:5173`
- `http://localhost:3000`

### Producción (Vercel)

- `https://tu-app.vercel.app`
- `https://tu-dominio.com` (si tienes dominio personalizado)

## Solución de Problemas

### Error: "Invalid redirect URL"

1. Verifica que la URL esté en la lista de `ALLOWED_REDIRECT_URLS`
2. Asegúrate de que la URL esté configurada en Supabase Dashboard
3. Verifica que no haya espacios o caracteres extra en la URL

### Error: "Provider not enabled"

1. Ve a Supabase Dashboard → Authentication → Providers
2. Habilita GitHub como proveedor
3. Configura el Client ID y Client Secret de GitHub
