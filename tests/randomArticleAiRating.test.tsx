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
  deleteArticle: jest.fn(),
  markAsRead: jest.fn(),
  markAsFavorite: jest.fn(),
};

describe("RandomArticle - Etiquetas de temas", () => {
  test("enseña como mucho 3 etiquetas", async () => {
    const withManyTopics = { ...ratedArticle, topics: ["swift", "testing", "tdd", "ios", "arquitectura"] };
    renderWithProviders(<RandomArticle />, {
      ...mockRepository,
      getArticlesByUser: jest.fn().mockResolvedValue([withManyTopics]),
      getArticlesByUserFromUserArticles: jest.fn().mockResolvedValue([withManyTopics]),
    });

    expect(await screen.findByText("swift")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
    expect(screen.getByText("tdd")).toBeInTheDocument();
    expect(screen.queryByText("ios")).not.toBeInTheDocument();
    expect(screen.queryByText("arquitectura")).not.toBeInTheDocument();
  });
});

describe("RandomArticle - Valoración IA", () => {
  test("muestra el badge de valoración; el popover aparece al hacer clic y se cierra al volver a clicar", async () => {
    renderWithProviders(<RandomArticle />, mockRepository);

    const badge = await screen.findByRole("button", {
      name: /Nota IA: 8 de 10/i,
    });
    expect(badge).toHaveClass("rating-high");
    expect(badge).toHaveClass("has-popover");
    expect(badge).not.toHaveAttribute("title");
    expect(badge).toHaveTextContent("IA: ¡Muy recomendable!");
    expect(badge).not.toHaveTextContent("/10");

    // El popover no está en el DOM antes de clicar
    expect(
      screen.queryByText("Encaja con tus temas favoritos")
    ).not.toBeInTheDocument();

    // Al clicar aparece el popover con la razón
    fireEvent.click(badge);
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Según tus gustos, la IA le da un 8 de 10: Encaja con tus temas favoritos"
    );

    // Al clicar de nuevo se cierra
    fireEvent.click(badge);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
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
    expect(badge).toHaveTextContent("Nota IA");
    expect(badge).not.toHaveTextContent("/10");

    // El popover con el mensaje de Telegram aparece al clicar
    fireEvent.click(badge);
    expect(screen.getByText(/\/gustos/)).toBeInTheDocument();
    expect(screen.getByText(/Telegram/)).toBeInTheDocument();
  });
});

describe("RandomArticle - Nota IA en palabras", () => {
  test.each([
    [9, "IA: ¡Muy recomendable!"],
    [6, "IA: Interesante"],
    [3, "IA: Flojo"],
  ])("un %i se ve como «%s»", async (aiRating, label) => {
    const article = { ...ratedArticle, aiRating };
    renderWithProviders(<RandomArticle />, {
      ...mockRepository,
      getArticlesByUser: jest.fn().mockResolvedValue([article]),
      getArticlesByUserFromUserArticles: jest.fn().mockResolvedValue([article]),
    });

    const badge = await screen.findByRole("button", { name: new RegExp(`Nota IA: ${aiRating} de 10`) });
    expect(badge).toHaveTextContent(label);
  });
});
