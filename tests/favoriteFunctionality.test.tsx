import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
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

describe("Favorite Functionality", () => {
  const baseArticles = [
    {
      id: 1,
      title: "React Hooks Tutorial",
      url: "https://example.com/react-hooks",
      language: "English",
      authors: ["John"],
      isRead: false,
      isFavorite: false,
      dateAdded: new Date(),
    },
    {
      id: 2,
      title: "TypeScript Best Practices",
      url: "https://example.com/ts",
      language: "English",
      authors: ["Jane"],
      isRead: true,
      isFavorite: true,
      dateAdded: new Date(),
    },
    {
      id: 3,
      title: "Accesibilidad Web",
      url: "https://example.com/a11y",
      language: "Spanish",
      authors: ["Carlos"],
      isRead: false,
      isFavorite: false,
      dateAdded: new Date(),
    },
  ];

  function makeRepoMock(list = baseArticles) {
    return {
      getArticlesByUserPaginated: jest.fn().mockResolvedValue({
        articles: list,
        total: list.length,
      }),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      markAsFavorite: jest.fn().mockResolvedValue(undefined),
      deleteArticle: jest.fn().mockResolvedValue(undefined),
    };
  }

  it("muestra el icono de estrella vacía para artículos no favoritos", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue (buscar un título de artículo)
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Buscar botones de favorito (deberían tener el emoji de estrella)
    const favoriteButtons = screen.getAllByTitle(/favorito/i);
    expect(favoriteButtons.length).toBeGreaterThan(0);

    // Verificar que hay al menos una estrella vacía (☆)
    const emptyStars = favoriteButtons.filter((btn) =>
      btn.textContent?.includes("☆")
    );
    expect(emptyStars.length).toBeGreaterThan(0);
  });

  it("muestra el icono de estrella llena para artículos favoritos", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/TypeScript Best Practices/i)).toBeInTheDocument();
    });

    // Buscar botones de favorito
    const favoriteButtons = screen.getAllByTitle(/favorito/i);
    
    // Verificar que hay al menos una estrella llena (⭐)
    const filledStars = favoriteButtons.filter((btn) =>
      btn.textContent?.includes("⭐")
    );
    expect(filledStars.length).toBeGreaterThan(0);
  });

  it("marca un artículo como favorito al hacer clic", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Buscar el primer botón de favorito (que no está marcado)
    const favoriteButtons = screen.getAllByTitle(/Añadir a favoritos/i);
    expect(favoriteButtons.length).toBeGreaterThan(0);
    const firstFavoriteBtn = favoriteButtons[0];

    // Hacer clic en el botón
    fireEvent.click(firstFavoriteBtn);

    // Verificar que se llamó al método markAsFavorite
    await waitFor(() => {
      expect(repo.markAsFavorite).toHaveBeenCalledWith(
        expect.any(Number),
        true
      );
    });
  });

  it("quita un artículo de favoritos al hacer clic en uno ya marcado", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/TypeScript Best Practices/i)).toBeInTheDocument();
    });

    // Buscar el botón de favorito que ya está marcado
    const favoriteButtons = screen.getAllByTitle(/Quitar de favoritos/i);
    expect(favoriteButtons.length).toBeGreaterThan(0);
    const favoriteBtn = favoriteButtons[0];

    // Hacer clic en el botón
    fireEvent.click(favoriteBtn);

    // Verificar que se llamó al método markAsFavorite con false
    await waitFor(() => {
      expect(repo.markAsFavorite).toHaveBeenCalledWith(
        expect.any(Number),
        false
      );
    });
  });

  it("actualiza el estado local optimísticamente al marcar como favorito", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Buscar el primer botón de favorito (no marcado)
    const favoriteButtons = screen.getAllByTitle(/Añadir a favoritos/i);
    expect(favoriteButtons.length).toBeGreaterThan(0);
    const firstFavoriteBtn = favoriteButtons[0];

    // Verificar que inicialmente muestra estrella vacía
    expect(firstFavoriteBtn.textContent).toContain("☆");

    // Hacer clic
    fireEvent.click(firstFavoriteBtn);

    // Verificar que cambia a estrella llena inmediatamente (optimistic update)
    await waitFor(() => {
      expect(firstFavoriteBtn.textContent).toContain("⭐");
    });
  });

  it("muestra tooltip correcto según el estado de favorito", async () => {
    const repo = makeRepoMock();
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Verificar tooltips
    const addFavoriteButtons = screen.getAllByTitle(/Añadir a favoritos/i);
    const removeFavoriteButtons = screen.getAllByTitle(/Quitar de favoritos/i);

    expect(addFavoriteButtons.length).toBeGreaterThan(0);
    expect(removeFavoriteButtons.length).toBeGreaterThan(0);
  });

  it("mantiene el estado de favorito después de recargar artículos", async () => {
    const articlesWithFavorite = [
      {
        id: 1,
        title: "React Hooks Tutorial",
        url: "https://example.com/react-hooks",
        language: "English",
        authors: ["John"],
        isRead: false,
        isFavorite: true,
        dateAdded: new Date(),
      },
    ];

    const repo = makeRepoMock(articlesWithFavorite);
    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() =>
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled()
    );

    // Esperar a que la tabla se cargue
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Verificar que el artículo se muestra como favorito
    const favoriteButtons = screen.getAllByTitle(/Quitar de favoritos/i);
    expect(favoriteButtons.length).toBeGreaterThan(0);
    expect(favoriteButtons[0].textContent).toContain("⭐");
  });
});

