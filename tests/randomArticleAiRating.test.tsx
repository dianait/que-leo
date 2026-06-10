import { screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { renderWithProviders } from "./renderWithProviders";

const ratedArticle = {
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
  aiSummary: "Resumen breve del artículo para el usuario.",
  aiDecision: "Te recomendamos leerlo por su relevancia.",
};

const mockRepository: ArticleRepository = {
  getAllArticles: jest.fn(),
  getArticlesByUser: jest.fn().mockResolvedValue([ratedArticle]),
  getArticlesByUserFromUserArticles: jest
    .fn()
    .mockResolvedValue([ratedArticle]),
  getArticlesByUserPaginated: jest
    .fn()
    .mockResolvedValue({ articles: [], total: 0 }),
  addArticle: jest.fn(),
  deleteArticle: jest.fn(),
  markAsRead: jest.fn(),
  markAsFavorite: jest.fn(),
};

describe("RandomArticle - Valoración IA", () => {
  test("muestra el badge de valoración; el popover aparece al hacer clic y se cierra al volver a clicar", async () => {
    renderWithProviders(<RandomArticle />, mockRepository);

    const badge = await screen.findByRole("button", {
      name: /Nota IA: 8 de 10/i,
    });
    expect(badge).toHaveClass("rating-high");
    expect(badge).toHaveClass("has-popover");
    expect(badge).not.toHaveAttribute("title");
    expect(badge).toHaveTextContent("8/10");

    // El popover no está en el DOM antes de clicar
    expect(
      screen.queryByText("Encaja con tus temas favoritos")
    ).not.toBeInTheDocument();

    // Al clicar aparece el popover con la razón
    fireEvent.click(badge);
    expect(
      screen.getByText("Encaja con tus temas favoritos")
    ).toBeInTheDocument();

    // Al clicar de nuevo se cierra
    fireEvent.click(badge);
    expect(
      screen.queryByText("Encaja con tus temas favoritos")
    ).not.toBeInTheDocument();
  });

  test("no muestra el badge de valoración IA si no existe", async () => {
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
      getArticlesByUser: jest.fn().mockResolvedValue([articleWithoutRating]),
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

    expect(document.querySelector(".article-ai-rating")).not.toBeInTheDocument();
  });
});
