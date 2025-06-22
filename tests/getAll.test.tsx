import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { GetAllArticles } from "../src/application/GetAllArticles";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { ListOfArticles } from "../src/ui/ListOfArticles/ListOfArticles";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import { User } from "@supabase/supabase-js";

// Mock del repositorio de Supabase para que los componentes no fallen
jest.mock(
  "../src/infrastructure/repositories/SupabaseArticleRepository",
  () => ({
    SupabaseArticleRepository: {
      getInstance: jest.fn().mockReturnValue({
        getAllArticles: jest.fn().mockResolvedValue([]),
        getArticlesByUser: jest.fn().mockResolvedValue([]),
        addArticle: jest.fn().mockResolvedValue(null),
        deleteArticle: jest.fn().mockResolvedValue(null),
        supabase: {
          auth: {
            onAuthStateChange: jest.fn(() => ({
              data: { subscription: { unsubscribe: jest.fn() } },
            })),
            getSession: jest
              .fn()
              .mockResolvedValue({ data: { session: null } }),
          },
        },
      }),
    },
  })
);

const jsonRepository = new JsonArticleRepository();
const mockUser = { id: "123-test-user" } as User;

test("GetAllArticles devuelve artículos usando el repositorio JSON", async () => {
  const useCase = new GetAllArticles(jsonRepository);
  const articles = await useCase.execute();

  expect(Array.isArray(articles)).toBe(true);
  expect(articles.length).toBeGreaterThan(0);
  expect(articles[0]).toHaveProperty("id");
  expect(articles[0]).toHaveProperty("title");
  expect(articles[0]).toHaveProperty("url");
  expect(articles[0]).toHaveProperty("dateAdded");
  expect(articles[0].dateAdded).toBeInstanceOf(Date);
});

test("ListOfArticles muestra artículos del repositorio JSON para un usuario logueado", async () => {
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
        <ListOfArticles />
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );

  await waitFor(() => {
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBeGreaterThan(0);
    expect(screen.getByText(/Mis Artículos/)).toBeInTheDocument();
  });
});
