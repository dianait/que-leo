import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { AuthProvider } from "./ui/Auth/AuthProvider.tsx";
import { createSupabaseClient } from "./infrastructure/repositories/SupabaseArticleRepository/supabaseConfig.ts";

const supabase = createSupabaseClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider supabase={supabase}>
      <App />
    </AuthProvider>
  </StrictMode>
);
