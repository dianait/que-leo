import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { renderWithProviders } from "./renderWithProviders";

// Mock del repositorio
const mockRepository: ArticleRepository = {
  getAllArticles: jest.fn(),
  getArticlesByUser: jest.fn().mockResolvedValue([]),
  getArticlesByUserFromUserArticles: jest.fn().mockResolvedValue([
    {
      id: "1",
      title: "Artículo de prueba",
      url: "http://ejemplo.com",
      isRead: false,
      userId: "123",
      dateAdded: new Date(),
      readAt: null,
      authors: [],
      topics: [],
      less_15: false,
    },
  ]),
  getArticlesByUserPaginated: jest
    .fn()
    .mockResolvedValue({ articles: [], total: 0 }),
  addArticle: jest.fn(),
  deleteArticle: jest.fn(),
  markAsRead: jest.fn(),
  markAsFavorite: jest.fn(),
};

test("RandomArticle muestra un artículo usando el caso de uso", async () => {
  renderWithProviders(<RandomArticle />, mockRepository);

  await waitFor(() => {
    const articleTitle = screen.getByRole("heading", { level: 4 });
    expect(articleTitle).toBeInTheDocument();
    expect(articleTitle).toHaveTextContent("Artículo de prueba");
  });
});

test("RandomArticle solo carga artículos del usuario logueado", async () => {
  const repoWithUserScope = {
    ...mockRepository,
    getArticlesByUserFromUserArticles: jest.fn().mockResolvedValue([
      {
        id: "99",
        title: "Solo para mí",
        url: "http://ejemplo.com/mio",
        isRead: false,
        dateAdded: new Date(),
        authors: [],
        topics: [],
        less_15: false,
      },
    ]),
  };

  renderWithProviders(<RandomArticle />, repoWithUserScope);

  await waitFor(() => {
    expect(
      repoWithUserScope.getArticlesByUserFromUserArticles
    ).toHaveBeenCalledWith("123");
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
      "Solo para mí"
    );
  });
});
