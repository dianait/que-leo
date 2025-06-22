import { createContext, useContext } from "react";
import { ArticleRepository } from "./ArticleRepository";

// Creamos el Context con un valor por defecto nulo.
export const ArticleRepositoryContext = createContext<ArticleRepository | null>(
  null
);

// Hook personalizado para usar el contexto.
// Lanza un error si se intenta usar fuera de un proveedor,
// lo que previene errores por no tener un repositorio configurado.
export const useArticleRepository = (): ArticleRepository => {
  const context = useContext(ArticleRepositoryContext);
  if (!context) {
    throw new Error(
      "useArticleRepository debe ser usado dentro de un ArticleRepositoryProvider"
    );
  }
  return context;
};
