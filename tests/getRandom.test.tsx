/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { User } from "@supabase/supabase-js";
import React from "react";

import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import type { Article } from "../src/domain/Article";
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
const mockUser = { id: "123-test-user" } as User;

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
        <RandomArticle />
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
