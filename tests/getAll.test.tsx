import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { GetAllArticles } from "../src/application/GetAllArticles";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { ListOfArticles } from "../src/ui/ListOfArticles/ListOfArticles";

test("muestra la lista de artículos en el sidebar", async () => {
  render(<ListOfArticles />);

  // Ahora el sidebar se muestra automáticamente al cargar
  await waitFor(() => {
    // Verificar que el título del sidebar con el contador está presente
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /articles/i
    );

    // Verificar que la lista de artículos se cargó
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBeGreaterThan(0);
  });
});

test("getAllArticles devuelve artículos desde el JSON", async () => {
  const repo = new JsonArticleRepository();
  const useCase = new GetAllArticles(repo);
  const articles = await useCase.execute();
  expect(Array.isArray(articles)).toBe(true);
  expect(articles.length).toBeGreaterThan(0);
  expect(articles[0]).toHaveProperty("id");
  expect(articles[0]).toHaveProperty("title");
  expect(typeof articles[0].title).toBe("string");
  expect(articles[0]).toHaveProperty("url");
  expect(typeof articles[0].url).toBe("string");
  expect(articles[0]).toHaveProperty("created_at");
  expect(articles[0].created_at).toBeInstanceOf(Date);
});
