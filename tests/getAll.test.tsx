import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { GetAllArticles } from "../src/application/GetAllArticles";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { ListOfArticles } from "../src/ui/ListOfArticles/ListOfArticles";

// Mock del repositorio de Supabase para que los componentes no fallen
jest.mock(
  "../src/infrastructure/repositories/SupabaseArticleRepository",
  () => ({
    SupabaseArticleRepository: {
      getInstance: jest.fn().mockReturnValue({
        getAllArticles: jest.fn().mockResolvedValue([]), // Devuelve vacío, no nos importa para este test
      }),
    },
  })
);

test("GetAllArticles devuelve artículos usando el repositorio JSON", async () => {
  const repo = new JsonArticleRepository();
  const useCase = new GetAllArticles(repo);
  const articles = await useCase.execute();

  expect(Array.isArray(articles)).toBe(true);
  expect(articles.length).toBeGreaterThan(0);
  expect(articles[0]).toHaveProperty("id");
  expect(articles[0]).toHaveProperty("title");
  expect(articles[0]).toHaveProperty("url");
  expect(articles[0]).toHaveProperty("dateAdded");
  expect(articles[0].dateAdded).toBeInstanceOf(Date);
});
