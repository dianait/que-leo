import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { GetAllArticles } from "../../../src/application/GetAllArticles";
import { JsonArticleRepository } from "../../../src/infrastructure/repositories/JSONArticleRepository";
import { ListOfArticles } from "../../../src/ui/ListOfArticles/ListOfArticles";

test("muestra la lista de artículos desde el JSON", async () => {
  render(<ListOfArticles />);
  await waitFor(() => {
    expect(screen.getByRole("list").children.length).toBeGreaterThan(0);
    expect(screen.getByText(/Lista de Artículos/i)).toBeInTheDocument();
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
  expect(articles[0]).toHaveProperty("url");
  expect(articles[0]).toHaveProperty("dateAdded");
});
