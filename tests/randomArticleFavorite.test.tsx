import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import { createMockAuthContext } from "./setup";

function renderWith(repoMock: any) {
  return render(
    <AuthContext.Provider value={createMockAuthContext()}>
      <ArticleRepositoryContext.Provider value={repoMock}>
        <RandomArticle articlesVersion={0} />
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );
}

describe("RandomArticle - Funcionalidad de favoritos", () => {
  const baseArticle = {
    id: 1,
    title: "Artículo de prueba",
    url: "https://example.com/test",
    isRead: false,
    isFavorite: false,
    dateAdded: new Date(),
    language: "Spanish",
    authors: ["Autor Test"],
  };

  function makeRepoMock(article = baseArticle) {
    return {
      getAllArticles: jest.fn(),
      getArticlesByUser: jest.fn().mockResolvedValue([article]),
      getArticlesByUserPaginated: jest
        .fn()
        .mockResolvedValue({ articles: [], total: 0 }),
      addArticle: jest.fn(),
      deleteArticle: jest.fn(),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      markAsFavorite: jest.fn().mockResolvedValue(undefined),
    };
  }

  it("muestra el botón de favorito en la card", async () => {
    const repoMock = makeRepoMock();
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Añadir a favoritos/i);
    expect(favoriteButton).toBeInTheDocument();
  });

  it("muestra la imagen star_unfilled.png cuando no es favorito", async () => {
    const repoMock = makeRepoMock();
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Añadir a favoritos/i);
    const image = favoriteButton.querySelector('img[src="/star_unfilled.png"]');
    expect(image).toBeInTheDocument();
  });

  it("muestra el emoji ⭐ cuando es favorito", async () => {
    const favoriteArticle = { ...baseArticle, isFavorite: true };
    const repoMock = makeRepoMock(favoriteArticle);
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Quitar de favoritos/i);
    expect(favoriteButton).toBeInTheDocument();
    expect(favoriteButton.textContent).toContain("⭐");
  });

  it("marca un artículo como favorito al hacer clic", async () => {
    const repoMock = makeRepoMock();
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Añadir a favoritos/i);
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(repoMock.markAsFavorite).toHaveBeenCalledWith(1, true);
    });
  });

  it("muestra el modal de favorito al marcar como favorito", async () => {
    const repoMock = makeRepoMock();
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Añadir a favoritos/i);
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(screen.getByText(/¡Genial! ⭐/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Has guardado este artículo como favorito/i)
      ).toBeInTheDocument();
    });
  });

  it("muestra los botones de compartir en el modal de favorito", async () => {
    const repoMock = makeRepoMock();
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Añadir a favoritos/i);
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(screen.getByText(/¡Genial! ⭐/i)).toBeInTheDocument();
    });

    // Verificar que aparecen los botones de compartir
    const blueskyButton = screen.getByText(/Bluesky/i);
    const linkedinButton = screen.getByText(/LinkedIn/i);

    expect(blueskyButton).toBeInTheDocument();
    expect(linkedinButton).toBeInTheDocument();
  });

  it("quita un artículo de favoritos sin mostrar modal", async () => {
    const favoriteArticle = { ...baseArticle, isFavorite: true };
    const repoMock = makeRepoMock(favoriteArticle);
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Quitar de favoritos/i);
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(repoMock.markAsFavorite).toHaveBeenCalledWith(1, false);
    });

    // No debe aparecer el modal
    expect(screen.queryByText(/¡Genial! ⭐/i)).not.toBeInTheDocument();
  });

  it("actualiza el estado visual al marcar como favorito", async () => {
    const repoMock = makeRepoMock();
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Añadir a favoritos/i);
    
    // Verificar que inicialmente muestra la imagen
    expect(favoriteButton.querySelector('img[src="/star_unfilled.png"]')).toBeInTheDocument();

    fireEvent.click(favoriteButton);

    // Esperar a que se actualice el estado
    await waitFor(() => {
      const updatedButton = screen.getByTitle(/Quitar de favoritos/i);
      expect(updatedButton.textContent).toContain("⭐");
    });
  });

  it("cierra el modal de favorito al hacer clic en la X", async () => {
    const repoMock = makeRepoMock();
    renderWith(repoMock);

    await waitFor(() => {
      expect(screen.getByText(/Artículo de prueba/i)).toBeInTheDocument();
    });

    const favoriteButton = screen.getByTitle(/Añadir a favoritos/i);
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(screen.getByText(/¡Genial! ⭐/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByTitle(/Cerrar/i);
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/¡Genial! ⭐/i)).not.toBeInTheDocument();
    });
  });
});

