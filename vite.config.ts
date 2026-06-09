import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite config best practices:
// - Usa alias para imports absolutos
// - Expone variables públicas con define
// - Optimiza dependencias pesadas
// - Configura server para DX
// - Documenta cada sección

export default defineConfig({
  plugins: [react()],

  // Alias para imports absolutos
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // Variables públicas (solo las que empiezan por VITE_)
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Optimización de dependencias
  optimizeDeps: {
    include: ["date-fns", "@supabase/supabase-js"],
  },

  // Configuración del servidor de desarrollo
  server: {
    open: true,
    port: 5173,
  },

  // Directorio público
  publicDir: "public",
});
