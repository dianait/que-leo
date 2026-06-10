import { screen, fireEvent } from "@testing-library/react";
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

  test("sin rating muestra badge neutro y popover con mensaje de Telegram", async () => {
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

    const badge = await screen.findByRole("button", {
      name: /Nota IA. Toca para saber cómo activarla/i,
    });
    expect(badge).toHaveClass("rating-none");
    expect(badge).not.toHaveTextContent("/10");

    // El popover con el mensaje de Telegram aparece al clicar
    fireEvent.click(badge);
    expect(screen.getByText(/\/gustos/)).toBeInTheDocument();
    expect(screen.getByText(/Telegram/)).toBeInTheDocument();
  });
});
