import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { AuthContext } from "../src/domain/AuthContext";
import { User } from "@supabase/supabase-js";

// Mock del repositorio
const jsonRepository: ArticleRepository = {
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

const mockUser: User = {
  id: "123",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

test("RandomArticle muestra un artículo usando el caso de uso", async () => {
  render(
    <AuthContext.Provider
      value={{
        user: mockUser,
        session: null,
        signInWithGitHub: async () => {},
        signOut: async () => {},
        loading: false,
      }}
    >
      <ArticleRepositoryContext.Provider value={jsonRepository}>
        <RandomArticle articlesVersion={0} setArticlesVersion={() => {}} />
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );

  await waitFor(() => {
    const articleTitle = screen.getByRole("heading", { level: 4 });
    expect(articleTitle).toBeInTheDocument();
    expect(articleTitle).toHaveTextContent("Artículo de prueba");
  });
});
