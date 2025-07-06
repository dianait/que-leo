import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { User } from "@supabase/supabase-js";

import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { GetArticlesByUser } from "../src/application/GetArticlesByUser";

// Mock del repositorio de Supabase para que los componentes no fallen al importarse
jest.mock(
  "../src/infrastructure/repositories/SupabaseArticleRepository",
  () => ({
    SupabaseArticleRepository: {
      getInstance: jest.fn().mockReturnValue({
        // No necesitamos implementar los métodos aquí si no se usan directamente
      }),
    },
  })
);

const jsonRepository = new JsonArticleRepository();
const mockUser = { id: "123-test-user" } as User;

describe("Obtención de artículos", () => {
  test("GetArticlesByUser devuelve artículos del repositorio", async () => {
    const useCase = new GetArticlesByUser(jsonRepository);
    const articles = await useCase.execute(mockUser.id);

    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0]).toHaveProperty("id");
    expect(articles[0]).toHaveProperty("title");
    expect(articles[0]).toHaveProperty("url");
    expect(articles[0]).toHaveProperty("dateAdded");
    expect(articles[0]).toHaveProperty("isRead");
  });

  // Nuevo test para la tabla de artículos
  test("ArticleTable muestra artículos en una tabla con los encabezados y acciones correctos", async () => {
    // Importación dinámica para evitar problemas de dependencias circulares
    const { ArticleTable } = await import(
      "../src/ui/ListOfArticles/ArticleTable"
    );
    render(
      <AuthContext.Provider
        value={{
          user: mockUser,
          session: null,
          signInWithGitHub: async () => {},
          signOut: async () => {},
          loading: false,
        }}
      >
        <ArticleRepositoryContext.Provider value={jsonRepository}>
          <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );

    // Espera a que se rendericen las filas de la tabla
    await waitFor(() => {
      // Encabezados con emojis
      expect(screen.getByText(/📖 Título/)).toBeInTheDocument();
      expect(screen.getByText(/🌎 Idioma/)).toBeInTheDocument();
      expect(screen.getByText(/👤 Autores/)).toBeInTheDocument();
      expect(screen.getByText(/⚡ Acciones/)).toBeInTheDocument();
      // Al menos una fila de artículo
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      // Botones de acción
      expect(
        screen.getAllByRole("button", { name: /Leído|No leído/i }).length
      ).toBeGreaterThan(0);
    });
  });
});
