import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { AuthContext } from "../src/domain/AuthContext";
import { createMockAuthContext } from "./setup";

const mockRepository: ArticleRepository = {
  getAllArticles: jest.fn(),
  getArticlesByUser: jest.fn().mockResolvedValue([
    {
      id: "1",
      title: "Artículo con valoración IA",
      url: "http://ejemplo.com",
      isRead: false,
      dateAdded: new Date(),
      authors: ["Autor Test"],
      topics: [],
      less_15: false,
      aiRating: 8,
      aiRatingReason: "Encaja con tus temas favoritos",
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

describe("RandomArticle - Valoración IA", () => {
  test("muestra la valoración IA en la card cuando existe", async () => {
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <ArticleRepositoryContext.Provider value={mockRepository}>
          <RandomArticle articlesVersion={0} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Valoración IA")).toBeInTheDocument();
      expect(screen.getByText("8/10")).toBeInTheDocument();
    });

    const rating = screen.getByText("8/10").closest(".article-ai-rating");
    expect(rating).toHaveClass("rating-high");
    expect(rating).toHaveAttribute(
      "title",
      "Encaja con tus temas favoritos"
    );
  });

  test("no muestra la valoración IA si no existe", async () => {
    const repoWithoutRating: ArticleRepository = {
      ...mockRepository,
      getArticlesByUser: jest.fn().mockResolvedValue([
        {
          id: "2",
          title: "Artículo sin valoración",
          url: "http://ejemplo.com/2",
          isRead: false,
          dateAdded: new Date(),
          authors: [],
          topics: [],
          less_15: false,
        },
      ]),
    };

    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <ArticleRepositoryContext.Provider value={repoWithoutRating}>
          <RandomArticle articlesVersion={0} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 4, name: /Artículo sin valoración/i })
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Valoración IA")).not.toBeInTheDocument();
  });
});
