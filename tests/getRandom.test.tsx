/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom";

import { GetRandomArticle } from "../src/application/GetRandomArticle";
import { Article } from "../src/domain/Article";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { render, screen, waitFor } from "@testing-library/react";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";

const jsonRepository = new JsonArticleRepository();

test("GetRandomArticle devuelve un artículo válido del JSON", async () => {
  const useCase = new GetRandomArticle(jsonRepository);
  const article = await useCase.execute();

  expect(article).toBeInstanceOf(Article);
});

test("RandomArticle muestra un artículo del repositorio JSON", async () => {
  render(
    <ArticleRepositoryContext.Provider value={jsonRepository}>
      <RandomArticle />
    </ArticleRepositoryContext.Provider>
  );

  await waitFor(() => {
    // Busca cualquier elemento con el rol 'heading' que contenga texto.
    // Esto confirma que un artículo se ha renderizado.
    const articleTitle = screen.getByRole("heading", { level: 4 });
    expect(articleTitle).toBeInTheDocument();
  });
});
