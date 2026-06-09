import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { renderWithProviders } from "./renderWithProviders";

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
  getArticlesByUserFromUserArticles: jest.fn().mockResolvedValue([
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
    renderWithProviders(<RandomArticle />, mockRepository);

    await waitFor(() => {
      expect(screen.getByText("Valoración:")).toBeInTheDocument();
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
    const articleWithoutRating = {
      id: "2",
      title: "Artículo sin valoración",
      url: "http://ejemplo.com/2",
      isRead: false,
      dateAdded: new Date(),
      authors: [],
      topics: [],
      less_15: false,
    };
    const repoWithoutRating: ArticleRepository = {
      ...mockRepository,
      getArticlesByUser: jest
        .fn()
        .mockResolvedValue([articleWithoutRating]),
      getArticlesByUserFromUserArticles: jest
        .fn()
        .mockResolvedValue([articleWithoutRating]),
    };

    renderWithProviders(<RandomArticle />, repoWithoutRating);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 4, name: /Artículo sin valoración/i })
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Valoración:")).not.toBeInTheDocument();
  });
});
