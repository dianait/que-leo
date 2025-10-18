import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { AuthContext } from "../src/domain/AuthContext";
import { createMockAuthContext } from "./setup";

// Mock del repositorio
const mockRepository: ArticleRepository = {
  getAllArticles: jest.fn(),
  getArticlesByUser: jest.fn().mockResolvedValue([
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
};

test("RandomArticle muestra un artículo usando el caso de uso", async () => {
  render(
    <BrowserRouter>
      <AuthContext.Provider value={createMockAuthContext()}>
        <ArticleRepositoryContext.Provider value={mockRepository}>
          <RandomArticle articlesVersion={0} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );

  await waitFor(() => {
    const articleTitle = screen.getByRole("heading", { level: 4 });
    expect(articleTitle).toBeInTheDocument();
    expect(articleTitle).toHaveTextContent("Artículo de prueba");
  });
});
