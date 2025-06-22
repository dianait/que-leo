import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { User } from "@supabase/supabase-js";
import React from "react";

import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { ListOfArticles } from "../src/ui/ListOfArticles/ListOfArticles";
import { GetArticlesByUser } from "../src/application/GetArticlesByUser";
import { Article } from "../src/domain/Article";

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
const mockUser = { id: "123-test-user" } as User;

test("GetArticlesByUser devuelve artículos del repositorio", async () => {
  const useCase = new GetArticlesByUser(jsonRepository);
  const articles = await useCase.execute(mockUser.id);

  expect(Array.isArray(articles)).toBe(true);
  expect(articles.length).toBeGreaterThan(0);
  expect(articles[0]).toBeInstanceOf(Article);
});

test("ListOfArticles muestra artículos usando el caso de uso", async () => {
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
