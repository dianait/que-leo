import { createContext, useContext } from "react";
import type { ArticleRepository } from "./ArticleRepository";

// Create the Context with a null default value.
export const ArticleRepositoryContext = createContext<ArticleRepository | null>(
  null
);

// Custom hook to use the context.
// Throws if used outside a provider, preventing misconfiguration.
export const useArticleRepository = (): ArticleRepository => {
  const context = useContext(ArticleRepositoryContext);
  if (!context) {
    throw new Error(
      "useArticleRepository debe ser usado dentro de un ArticleRepositoryProvider"
    );
  }
  return context;
};
