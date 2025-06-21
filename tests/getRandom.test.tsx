/// <reference types="@testing-library/jest-dom" />

import { GetRandomArticle } from "../src/application/GetRandomArticle";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { Article } from "../src/domain/Article";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";

test("getRandomArticle devuelve un artículo aleatorio", async () => {
  // Mock repository con datos conocidos
  const mockArticles = [
    new Article("1", "Artículo 1", "http://ejemplo1.com", new Date()),
    new Article("2", "Artículo 2", "http://ejemplo2.com", new Date()),
    new Article("3", "Artículo 3", "http://ejemplo3.com", new Date()),
  ];

  const mockRepo = {
    getAllArticles: jest.fn().mockResolvedValue(mockArticles),
  };

  const useCase = new GetRandomArticle(mockRepo as ArticleRepository);
  const article = await useCase.execute();

  expect(mockArticles).toContain(article);
  expect(mockRepo.getAllArticles).toHaveBeenCalledTimes(1);
});

test("getRandomArticle devuelve un artículo válido del JSON", async () => {
  const repo = new JsonArticleRepository();
  const useCase = new GetRandomArticle(repo);

  const article = await useCase.execute();

  expect(article).toHaveProperty("id");
  expect(article).toHaveProperty("title");
  expect(article).toHaveProperty("url");
  expect(article.dateAdded).toBeInstanceOf(Date);
});

test("botón muestra loading y luego artículo real", async () => {
  render(<RandomArticle />);

  const button = screen.getByRole("button");
  fireEvent.click(button);

  // Verificar estado loading
  expect(screen.getByText(/buscando/i)).toBeInTheDocument();

  // Esperar que aparezca un artículo (verificar que ya no está en estado de carga)
  await waitFor(
    () => {
      // Verificar que ya no aparece el texto de loading
      expect(screen.queryByText(/buscando/i)).not.toBeInTheDocument();

      // Verificar que se muestra un título de artículo (cualquier encabezado h4)
      expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
});
