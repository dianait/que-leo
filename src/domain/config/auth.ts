// Configuración de URLs de autenticación
export const AUTH_CONFIG = {
  // URL de redirección después del login exitoso
  // Detecta automáticamente el entorno
  REDIRECT_URL: (() => {
    // Si hay una variable de entorno específica, úsala
    if (import.meta.env.VITE_AUTH_REDIRECT_URL) {
      return import.meta.env.VITE_AUTH_REDIRECT_URL;
    }

    // En desarrollo local, siempre usa localhost
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      return window.location.origin;
    }

    // En producción, usa la URL de producción
    return "https://que-leo.vercel.app";
  })(),

  // URLs permitidas para redirección (configurar en Supabase Dashboard)
  ALLOWED_REDIRECT_URLS: [
    "http://localhost:5173", // Desarrollo local
    "http://localhost:5174", // Puerto alternativo
    "http://localhost:5175", // Puerto alternativo
    "http://localhost:3000", // Puerto alternativo
    "https://que-leo.vercel.app", // Tu dominio de producción
  ],
};
