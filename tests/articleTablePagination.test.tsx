import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { ArticleTable } from "../src/ui/ListOfArticles/ArticleTable";
import { AuthContext } from "../src/domain/AuthContext";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { mockUser, createMockAuthContext } from "./setup";

function renderWithProviders(ui: React.ReactElement, repoMock: any) {
  const authValue = createMockAuthContext({ user: mockUser });
  return render(
    <AuthContext.Provider value={authValue}>
      <ArticleRepositoryContext.Provider value={repoMock}>
        {ui}
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );
}

describe("ArticleTable - Paginación", () => {
  // Crear 20 artículos para probar paginación
  const createArticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Article ${i + 1}`,
      url: `https://example.com/article-${i + 1}`,
      language: "English",
      authors: [`Author ${i + 1}`],
      isRead: i % 2 === 0,
      isFavorite: i % 3 === 0,
      dateAdded: new Date(),
    }));
  };

  function makeRepoMock(articles: any[], total?: number) {
    return {
      getArticlesByUserPaginated: jest.fn().mockImplementation(
        (_userId: string, limit: number, offset: number) => {
          const paginatedArticles = articles.slice(offset, offset + limit);
          return Promise.resolve({
            articles: paginatedArticles,
            total: total ?? articles.length,
          });
        }
      ),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      markAsFavorite: jest.fn().mockResolvedValue(undefined),
      deleteArticle: jest.fn().mockResolvedValue(undefined),
    };
  }

  it("muestra la primera página de artículos por defecto", async () => {
    const articles = createArticles(20);
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled();
    });

    // Debería mostrar los primeros 15 artículos
    await waitFor(() => {
      const article1 = screen.getByTitle("Article 1");
      expect(article1).toBeInTheDocument();
      const article15 = screen.getByTitle("Article 15");
      expect(article15).toBeInTheDocument();
    });

    // No debería mostrar artículos de la segunda página
    expect(screen.queryByTitle("Article 16")).not.toBeInTheDocument();
  });

  it("navega a la siguiente página correctamente", async () => {
    const articles = createArticles(20);
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    // Hacer clic en "Siguiente"
    const nextButton = screen.getByRole("button", { name: /Siguiente/i });
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);

    // Debería mostrar los artículos de la segunda página
    await waitFor(() => {
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalledWith(
        expect.any(String),
        15,
        15
      );
    });

    await waitFor(() => {
      expect(screen.getByTitle("Article 16")).toBeInTheDocument();
    });
  });

  it("navega a la página anterior correctamente", async () => {
    const articles = createArticles(20);
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    // Ir a la página 2
    const nextButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTitle("Article 16")).toBeInTheDocument();
    });

    // Volver a la página 1
    const prevButton = screen.getByRole("button", { name: /Anterior/i });
    expect(prevButton).not.toBeDisabled();
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalledWith(
        expect.any(String),
        15,
        0
      );
    });

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });
  });

  it("deshabilita botón Anterior en la primera página", async () => {
    const articles = createArticles(20);
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    const prevButton = screen.getByRole("button", { name: /Anterior/i });
    expect(prevButton).toBeDisabled();
  });

  it("deshabilita botón Siguiente en la última página", async () => {
    const articles = createArticles(10); // Menos de 15 artículos
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: /Siguiente/i });
    expect(nextButton).toBeDisabled();
  });

  it("muestra el total correcto de artículos", async () => {
    const articles = createArticles(25);
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    // Verificar que muestra "Total: 25"
    expect(screen.getByText(/Total: 25/i)).toBeInTheDocument();
  });

  it("resetea a página 1 al cambiar filtro de lectura", async () => {
    const articles = createArticles(20);
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    // Ir a página 2
    const nextButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTitle("Article 16")).toBeInTheDocument();
    });

    // Activar filtro de leídos (debería resetear a página 1)
    const readBtn = screen.getByRole("button", { name: /✅ Leídos/i });
    fireEvent.click(readBtn);

    // Verificar que se resetea a página 1
    await waitFor(() => {
      const pageInfo = screen.getByText(/Página 1 de/i);
      expect(pageInfo).toBeInTheDocument();
    });
  });

  it("resetea a página 1 al cambiar filtro de favoritos", async () => {
    const articles = createArticles(20);
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    // Ir a página 2
    const nextButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTitle("Article 16")).toBeInTheDocument();
    });

    // Activar filtro de favoritos (debería resetear a página 1)
    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    fireEvent.click(favoritesBtn);

    // Verificar que se resetea a página 1
    await waitFor(() => {
      const pageInfo = screen.getByText(/Página 1 de/i);
      expect(pageInfo).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("resetea a página 1 al cambiar término de búsqueda", async () => {
    const articles = createArticles(20);
    const repo = makeRepoMock(articles);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    // Ir a página 2
    const nextButton = screen.getByRole("button", { name: /Siguiente/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTitle("Article 16")).toBeInTheDocument();
    });

    // Cambiar término de búsqueda (debería resetear a página 1)
    const input = screen.getByPlaceholderText(/Buscar por título/i);
    fireEvent.change(input, { target: { value: "Article 5" } });

    // Verificar que se resetea a página 1
    await waitFor(() => {
      const pageInfo = screen.getByText(/Página 1 de/i);
      expect(pageInfo).toBeInTheDocument();
    });
  });

  it("calcula el total efectivo correctamente con filtros activos", async () => {
    const articles = createArticles(20);
    // Hacer que algunos sean favoritos
    const articlesWithFavorites = articles.map((a, i) => ({
      ...a,
      isFavorite: i < 5, // Primeros 5 son favoritos
    }));

    const repo = makeRepoMock(articlesWithFavorites);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    // Activar filtro de favoritos
    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    fireEvent.click(favoritesBtn);

    // Esperar a que se carguen todos los artículos y se aplique el filtro
    await waitFor(() => {
      // Debería mostrar "Total: 5" (solo los favoritos)
      expect(screen.getByText(/Total: 5/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("aplica paginación correctamente cuando hay filtros activos", async () => {
    const articles = createArticles(20);
    // Hacer que algunos sean favoritos
    const articlesWithFavorites = articles.map((a, i) => ({
      ...a,
      isFavorite: i < 10, // Primeros 10 son favoritos
    }));

    const repo = makeRepoMock(articlesWithFavorites);

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
    });

    // Activar filtro de favoritos
    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    fireEvent.click(favoritesBtn);

    // Esperar a que se carguen todos los artículos y se aplique el filtro
    await waitFor(() => {
      expect(screen.getByText(/Total: 10/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Debería mostrar los primeros 15 favoritos (pero solo hay 10)
    // Verificar que muestra los favoritos disponibles
    await waitFor(() => {
      expect(screen.getByTitle("Article 1")).toBeInTheDocument();
      expect(screen.getByTitle("Article 9")).toBeInTheDocument();
    });
  });
});

