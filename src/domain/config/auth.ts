// Auth URL configuration
export const AUTH_CONFIG = {
  // Redirect URL after successful login
  // Auto-detect environment
  REDIRECT_URL: (() => {
    // If a specific env var exists, use it
    if (import.meta.env.VITE_AUTH_REDIRECT_URL) {
      return import.meta.env.VITE_AUTH_REDIRECT_URL;
    }

    // In local development always use localhost
    if (import.meta.env.DEV || window.location.hostname === 'localhost') {
      return window.location.origin;
    }

    // In production, use production URL
    return "https://que-leo.vercel.app";
  })(),

  // Allowed redirect URLs (configure in Supabase Dashboard)
  ALLOWED_REDIRECT_URLS: [
    "http://localhost:5173", // local dev
    "http://localhost:5174", // alternate port
    "http://localhost:5175", // alternate port
    "http://localhost:3000", // alternate port
    "https://que-leo.vercel.app", // production domain
  ],
};
