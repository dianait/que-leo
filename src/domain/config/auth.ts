// Configuración de URLs de autenticación
export const AUTH_CONFIG = {
  // URL de redirección después del login exitoso
  // Cambia esto según tu entorno (desarrollo, staging, producción)
  REDIRECT_URL:
    import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin,

  // URLs permitidas para redirección (configurar en Supabase Dashboard)
  ALLOWED_REDIRECT_URLS: [
    "http://localhost:5173", // Desarrollo local
    "http://localhost:3000", // Puerto alternativo
    "https://tu-dominio.vercel.app", // Reemplaza con tu dominio de producción
    "https://tu-dominio.com", // Reemplaza con tu dominio personalizado
  ],
};
