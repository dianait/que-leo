import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { renderWithProviders } from "./renderWithProviders";

function makeRepo() {
  return {
    getAllArticles: jest.fn(),
    getArticlesByUser: jest.fn().mockResolvedValue([
      {
        id: 7,
        title: "Para leer",
        url: "https://example.com/leer",
        isRead: false,
        dateAdded: new Date("2026-01-01"),
      },
    ]),
    getArticlesByUserPaginated: jest.fn().mockResolvedValue({ articles: [], total: 0 }),
    deleteArticle: jest.fn(),
    markAsRead: jest.fn().mockResolvedValue(undefined),
  };
}

function comeBackToTab() {
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

beforeEach(() => {
  jest.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("asks whether the article was read after coming back from it", async () => {
  const repo = makeRepo();
  renderWithProviders(<RandomArticle />, repo);

  const link = await screen.findByRole("link", { name: /Leer: Para leer/i });
  expect(screen.queryByText(/¿Lo has leído\?/)).not.toBeInTheDocument();

  fireEvent.click(link);
  comeBackToTab();

  fireEvent.click(await screen.findByRole("button", { name: /Sí, marcar leído/i }));

  await waitFor(() => {
    expect(repo.markAsRead).toHaveBeenCalledWith(7, true, "123");
  });
  await waitFor(() => {
    expect(screen.queryByText(/¿Lo has leído\?/)).not.toBeInTheDocument();
  });
});

test("'Todavía no' closes the question without marking it", async () => {
  const repo = makeRepo();
  renderWithProviders(<RandomArticle />, repo);

  fireEvent.click(await screen.findByRole("link", { name: /Leer: Para leer/i }));
  comeBackToTab();

  fireEvent.click(await screen.findByRole("button", { name: /Todavía no/i }));

  expect(screen.queryByText(/¿Lo has leído\?/)).not.toBeInTheDocument();
  expect(repo.markAsRead).not.toHaveBeenCalled();
});

test("does not ask if the article was never opened", async () => {
  renderWithProviders(<RandomArticle />, makeRepo());

  await screen.findByRole("link", { name: /Leer: Para leer/i });
  comeBackToTab();

  expect(screen.queryByText(/¿Lo has leído\?/)).not.toBeInTheDocument();
});
