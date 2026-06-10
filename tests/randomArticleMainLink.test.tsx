import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { renderWithProviders } from "./renderWithProviders";

const articleWithUrl = {
  id: "1",
  title: "Artículo enlazable",
  url: "http://ejemplo.com/articulo",
  isRead: false,
  dateAdded: new Date(),
  authors: ["Autor Enlace"],
  topics: [],
  less_15: false,
};

const mockRepository: ArticleRepository = {
  getAllArticles: jest.fn(),
  getArticlesByUser: jest.fn().mockResolvedValue([articleWithUrl]),
  getArticlesByUserFromUserArticles: jest
    .fn()
    .mockResolvedValue([articleWithUrl]),
  getArticlesByUserPaginated: jest
    .fn()
    .mockResolvedValue({ articles: [], total: 0 }),
  deleteArticle: jest.fn(),
  markAsRead: jest.fn(),
  markAsFavorite: jest.fn(),
};

describe("RandomArticle - Enlace unificado", () => {
  test("no muestra el botón Leer y el enlace principal apunta al artículo", async () => {
    renderWithProviders(<RandomArticle />, mockRepository);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /Leer: Artículo enlazable/i })
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("🔗 Leer")).not.toBeInTheDocument();

    const mainLink = screen.getByRole("link", {
      name: /Leer: Artículo enlazable/i,
    });
    expect(mainLink).toHaveAttribute("href", "http://ejemplo.com/articulo");
    expect(mainLink).toHaveClass("article-main-link");
    expect(mainLink).toHaveTextContent("Artículo enlazable");
    expect(mainLink).toHaveTextContent("Autor Enlace");
  });
});
