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

describe("ArticleTable - Manejo de Errores", () => {
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

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maneja error al cargar artículos inicialmente", async () => {
    const repo = {
      getArticlesByUserPaginated: jest
        .fn()
        .mockRejectedValue(new Error("Error de red")),
      markAsRead: jest.fn(),
      markAsFavorite: jest.fn(),
      deleteArticle: jest.fn(),
    };

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalled();
    });

    // Debería mostrar el skeleton inicialmente y luego desaparecer
    // El componente debería manejar el error sin crashear
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("revierte actualización optimista cuando falla marcar como leído", async () => {
    const repo = makeRepoMock();
    repo.markAsRead = jest
      .fn()
      .mockRejectedValueOnce(new Error("Error al marcar como leído"));

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Encontrar el botón de "No leído" y hacer clic
    const readButtons = screen.getAllByTitle(/Marcar como leído/i);
    expect(readButtons.length).toBeGreaterThan(0);
    const firstButton = readButtons[0];
    fireEvent.click(firstButton);

    // Esperar a que se intente marcar como leído
    await waitFor(() => {
      expect(repo.markAsRead).toHaveBeenCalled();
    });

    // Esperar un poco para que se procese el error
    await waitFor(() => {
      // El artículo debería volver a su estado original (no leído)
      // Verificamos que el botón sigue siendo "Marcar como leído"
      const buttons = screen.getAllByTitle(/Marcar como leído/i);
      expect(buttons.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it("revierte actualización optimista cuando falla marcar como favorito", async () => {
    const repo = makeRepoMock();
    repo.markAsFavorite = jest
      .fn()
      .mockRejectedValueOnce(new Error("Error al marcar como favorito"));

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Encontrar el botón de favorito y hacer clic
    const favoriteButtons = screen.getAllByTitle(/Añadir a favoritos/i);
    expect(favoriteButtons.length).toBeGreaterThan(0);
    const firstButton = favoriteButtons[0];
    fireEvent.click(firstButton);

    // Esperar a que se intente marcar como favorito
    await waitFor(() => {
      expect(repo.markAsFavorite).toHaveBeenCalled();
    });

    // Esperar un poco para que se procese el error
    await waitFor(() => {
      // El artículo debería volver a su estado original (no favorito)
      // Verificamos que el botón sigue siendo "Añadir a favoritos"
      const buttons = screen.getAllByTitle(/Añadir a favoritos/i);
      expect(buttons.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it("maneja error al eliminar artículo", async () => {
    const repo = makeRepoMock();
    repo.deleteArticle = jest
      .fn()
      .mockRejectedValueOnce(new Error("Error al eliminar"));

    // Mock de window.alert
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Abrir modal de confirmación
    const deleteButtons = screen.getAllByTitle(/Borrar artículo/i);
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);

    // Confirmar eliminación
    await waitFor(() => {
      expect(screen.getByText(/¿Borrar artículo?/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", {
      name: /Borrar definitivamente/i,
    });
    fireEvent.click(confirmButton);

    // Esperar a que se intente eliminar
    await waitFor(() => {
      expect(repo.deleteArticle).toHaveBeenCalled();
    });

    // Verificar que se muestra el alert de error
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error al borrar el artículo")
      );
    });

    // El artículo debería seguir visible (no se eliminó)
    expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();

    alertSpy.mockRestore();
  });

  it("maneja error al cargar todos los artículos para búsqueda", async () => {
    const repo = makeRepoMock();
    // Primera llamada funciona, segunda (para búsqueda) falla
    repo.getArticlesByUserPaginated = jest
      .fn()
      .mockResolvedValueOnce({
        articles: baseArticles,
        total: baseArticles.length,
      })
      .mockRejectedValueOnce(new Error("Error al cargar todos los artículos"));

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Activar búsqueda
    const input = screen.getByPlaceholderText(/Buscar por título/i);
    fireEvent.change(input, { target: { value: "React" } });

    // Esperar a que se intente cargar todos los artículos
    await waitFor(() => {
      expect(repo.getArticlesByUserPaginated).toHaveBeenCalledTimes(2);
    });

    // El componente debería manejar el error sin crashear
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("mantiene el estado correcto cuando falla actualización y hay filtros activos", async () => {
    const articlesWithUnreadFavorite = [
      {
        id: 1,
        title: "React Hooks Tutorial",
        url: "https://example.com/react-hooks",
        language: "English",
        authors: ["John"],
        isRead: false,
        isFavorite: true, // Favorito pero no leído
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
    ];

    const repo = makeRepoMock(articlesWithUnreadFavorite);
    repo.markAsRead = jest
      .fn()
      .mockRejectedValueOnce(new Error("Error de red"));

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    });

    // Activar filtro de favoritos (esto carga allArticles)
    const favoritesBtn = screen.getByRole("button", { name: /⭐ Favoritos/i });
    fireEvent.click(favoritesBtn);

    // Esperar a que se carguen todos los artículos y se muestren los favoritos
    await waitFor(() => {
      expect(screen.getByText(/React Hooks Tutorial/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Intentar marcar como leído (debería fallar)
    const readButtons = screen.getAllByTitle(/Marcar como leído/i);
    expect(readButtons.length).toBeGreaterThan(0);
    fireEvent.click(readButtons[0]);

    await waitFor(() => {
      expect(repo.markAsRead).toHaveBeenCalled();
    });

    // El estado debería revertirse tanto en articles como en allArticles
    await waitFor(() => {
      // Verificar que el artículo sigue sin estar leído (el botón sigue siendo "Marcar como leído")
      const buttons = screen.getAllByTitle(/Marcar como leído/i);
      expect(buttons.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });
});

