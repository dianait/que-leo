/// <reference types="@testing-library/jest-dom" />

import { GetRandomArticle } from "../src/application/GetRandomArticle";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { Article } from "../src/domain/Article";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";

const mockArticle = new Article(
  1,
  "Mock Random Article",
  "http://example.com/random",
  new Date()
);

// Mock del repositorio de Supabase para que los componentes no fallen
jest.mock(
  "../src/infrastructure/repositories/SupabaseArticleRepository",
  () => ({
    SupabaseArticleRepository: {
      getInstance: jest.fn().mockReturnValue({
        getAllArticles: jest.fn().mockResolvedValue([]),
      }),
    },
  })
);

// Mockeamos la configuración para evitar el error de 'import.meta.env'
jest.mock(
  "../src/infrastructure/repositories/SupabaseArticleRepository/supabaseConfig.ts",
  () => ({
    createSupabaseClient: jest.fn(),
  })
);

test("GetRandomArticle devuelve un artículo válido del JSON", async () => {
  const repo = new JsonArticleRepository();
  const useCase = new GetRandomArticle(repo);
  const article = await useCase.execute();

  // Verificamos que el artículo devuelto es una instancia de Article y tiene las propiedades correctas
  expect(article).toBeInstanceOf(Article);
  expect(article).toHaveProperty("id");
  expect(article).toHaveProperty("title");
  expect(article).toHaveProperty("url");
  expect(article.dateAdded).toBeInstanceOf(Date);
});

test("botón muestra loading y luego el artículo mockeado", async () => {
  render(<RandomArticle />);

  await waitFor(() => {
    expect(
      screen.getByText("Mock Random Article", { exact: false })
    ).toBeInTheDocument();
  });

  const button = screen.getByRole("button", { name: /dame otro/i });
  fireEvent.click(button);

  expect(screen.getByText(/buscando/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(
      screen.getByText("Mock Random Article", { exact: false })
    ).toBeInTheDocument();
  });
});
