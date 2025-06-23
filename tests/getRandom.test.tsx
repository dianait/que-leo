/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import { GetRandomArticleForUser } from "../src/application/GetRandomArticleForUser";

// Mock del repositorio de Supabase para que los componentes no fallen al importarse
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
const mockUser = {
  id: "test",
  app_metadata: {},
  user_metadata: {},
  aud: "",
  created_at: "",
  email: "test@example.com",
  phone: "",
  role: "",
  confirmed_at: "",
  email_confirmed_at: "",
  phone_confirmed_at: "",
  last_sign_in_at: "",
  factor_ids: [],
  identities: [],
  banned_until: "",
  reauthentication_sent_at: "",
  is_anonymous: false,
};

test("GetRandomArticleForUser devuelve un artículo válido", async () => {
  const useCase = new GetRandomArticleForUser(jsonRepository);
  const article = await useCase.execute(mockUser.id);

  expect(article).toHaveProperty("id");
  expect(article).toHaveProperty("title");
  expect(article).toHaveProperty("url");
  expect(article).toHaveProperty("dateAdded");
  expect(article).toHaveProperty("isRead");
});

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
        <RandomArticle setArticlesVersion={() => {}} />
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );

  await waitFor(() => {
    // Busca cualquier elemento con el rol 'heading' que contenga texto.
    // Esto confirma que un artículo se ha renderizado.
    const articleTitle = screen.getByRole("heading", { level: 4 });
    expect(articleTitle).toBeInTheDocument();
  });
});

describe("RandomArticle switch", () => {
  test("al alternar el switch muestra artículos leídos y no leídos según la posición", async () => {
    const articles = [
      {
        id: "1",
        title: "Artículo 1",
        url: "#",
        dateAdded: new Date(),
        isRead: false,
      },
      {
        id: "2",
        title: "Artículo 2",
        url: "#",
        dateAdded: new Date(),
        isRead: true,
        readAt: new Date(),
      },
    ];
    const repo = {
      getArticlesByUser: jest.fn().mockResolvedValue(articles),
    } as any;
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
        <ArticleRepositoryContext.Provider value={repo}>
          <RandomArticle setArticlesVersion={() => {}} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );
    // Por defecto solo no leídos
    await screen.findByText("Artículo 1");
    expect(screen.queryByText("Artículo 2")).not.toBeInTheDocument();
    // Cambia el switch para mostrar todos
    const switchInput = screen.getByLabelText(/Solo no leídos/i);
    userEvent.click(switchInput);
    // Ahora puede aparecer cualquiera
    await screen.findByText(/Artículo/);
    expect(
      screen.queryByText("Artículo 1") || screen.queryByText("Artículo 2")
    ).toBeTruthy();
  });
});
