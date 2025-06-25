import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup2: resolve(__dirname, "extension/popup2.js"),
      },
      output: {
        entryFileNames: "popup2.bundle.js",
        dir: "extension",
        format: "iife",
      },
    },
    outDir: "extension",
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
    lib: undefined,
  },
});
