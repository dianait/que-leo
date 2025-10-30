import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import { createMockAuthContext } from "./setup";

function renderWith(repoMock: any) {
  return render(
    <AuthContext.Provider value={createMockAuthContext()}>
      <ArticleRepositoryContext.Provider value={repoMock}>
        <RandomArticle articlesVersion={0} />
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );
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
    expect(repoMock.markAsRead).toHaveBeenCalledWith(1, true);
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
  await waitFor(() => expect(repoMock.markAsRead).toHaveBeenCalledWith(2, true));
  const toUnread = await screen.findByRole("button", { name: /Marcar como no leído/i });
  // Read -> Unread
  fireEvent.click(toUnread);
  await waitFor(() => expect(repoMock.markAsRead).toHaveBeenCalledWith(2, false));
  expect(await screen.findByRole("button", { name: /Marcar como leído/i })).toBeInTheDocument();
});


