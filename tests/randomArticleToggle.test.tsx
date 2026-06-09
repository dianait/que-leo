import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { renderWithProviders } from "./renderWithProviders";

function renderWith(repoMock: unknown) {
  return renderWithProviders(<RandomArticle />, repoMock);
}

test("toggle from No leído to Leído updates UI and calls repository", async () => {
  const repoMock = {
    getAllArticles: jest.fn(),
    getArticlesByUser: jest.fn().mockResolvedValue([
      {
        id: 1,
        title: "Test",
        url: "https://example.com",
        isRead: false,
        dateAdded: new Date(),
      },
    ]),
    getArticlesByUserPaginated: jest.fn().mockResolvedValue({ articles: [], total: 0 }),
    addArticle: jest.fn(),
    deleteArticle: jest.fn(),
    markAsRead: jest.fn().mockResolvedValue(undefined),
  };

  renderWith(repoMock);

  // Wait for article to render
  await screen.findByText(/Test/i);

  // Button should have accessible name "Marcar como leído"
  const toggleBtn = screen.getByRole("button", { name: /Marcar como leído/i });
  fireEvent.click(toggleBtn);

  await waitFor(() => {
    expect(repoMock.markAsRead).toHaveBeenCalledWith(1, true, "123");
  });

  // Button text should change to "Leído"
  expect(await screen.findByRole("button", { name: /Marcar como no leído/i })).toBeInTheDocument();

  // No debe abrir el modal de compartir
  expect(screen.queryByText(/Comparte este artículo/i)).not.toBeInTheDocument();
});

test("toggle from No leído -> Leído -> No leído mantiene el UI y llama repo", async () => {
  const repoMock = {
    getAllArticles: jest.fn(),
    getArticlesByUser: jest.fn().mockResolvedValue([
      { id: 2, title: "Toggle", url: "https://example.com", isRead: false, dateAdded: new Date() },
    ]),
    getArticlesByUserPaginated: jest.fn().mockResolvedValue({ articles: [], total: 0 }),
    addArticle: jest.fn(),
    deleteArticle: jest.fn(),
    markAsRead: jest.fn().mockResolvedValue(undefined),
  };

  renderWith(repoMock);

  await screen.findByText(/Toggle/i);
  // Unread -> Read
  const toRead = screen.getByRole("button", { name: /Marcar como leído/i });
  fireEvent.click(toRead);
  await waitFor(() =>
    expect(repoMock.markAsRead).toHaveBeenCalledWith(2, true, "123")
  );
  const toUnread = await screen.findByRole("button", { name: /Marcar como no leído/i });
  // Read -> Unread
  fireEvent.click(toUnread);
  await waitFor(() =>
    expect(repoMock.markAsRead).toHaveBeenCalledWith(2, false, "123")
  );
  expect(await screen.findByRole("button", { name: /Marcar como leído/i })).toBeInTheDocument();
});


