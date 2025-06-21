import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GetAllArticles } from "../src/application/GetAllArticles";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { ListOfArticles } from "../src/ui/ListOfArticles";

test("muestra la lista después de clickear el botón", async () => {
  render(<ListOfArticles />);

  const button = screen.getByRole("button", {
    name: /ver todos los artículos/i,
  });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/Lista de Artículos \(61\)/i)).toBeInTheDocument();
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
  expect(articles[0]).toHaveProperty("dateAdded");
  expect(articles[0].dateAdded).toBeInstanceOf(Date);
});
