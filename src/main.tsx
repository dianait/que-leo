import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { AuthProvider } from "./ui/Auth/AuthProvider.tsx";
import { createSupabaseClient } from "./infrastructure/repositories/SupabaseArticleRepository/supabaseConfig.ts";
import { SupabaseArticleRepository } from "./infrastructure/repositories/SupabaseArticleRepository/SupabaseArticleRepository.ts";
import { ArticleRepositoryContext } from "./domain/ArticleRepositoryContext.ts";
import { BrowserRouter } from "react-router-dom";
// Analytics se cargará de forma diferida tras la hidratación

const supabase = createSupabaseClient();
const articleRepository = SupabaseArticleRepository.getInstance({
  client: supabase,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ArticleRepositoryContext.Provider value={articleRepository}>
      <AuthProvider supabase={supabase}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ArticleRepositoryContext.Provider>
  </StrictMode>
);

// Defer Analytics loading after hydration
if (typeof window !== "undefined") {
  import("@vercel/analytics/react").then((mod) => {
    const Analytics = mod.Analytics;
    // Opcional: renderizar Analytics dinámicamente si se requiere
    // createRoot(document.getElementById("analytics-root")!).render(<Analytics />);
  });
}
