import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ArticleTable } from "../src/ui/ListOfArticles/ArticleTable";
import { AuthContext } from "../src/domain/AuthContext";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { createMockAuthContext, mockUser } from "./setup";

function renderWithProviders(ui: React.ReactElement, repoMock: unknown) {
  return render(
    <AuthContext.Provider value={createMockAuthContext({ user: mockUser })}>
      <ArticleRepositoryContext.Provider value={repoMock as never}>
        {ui}
      </ArticleRepositoryContext.Provider>
    </AuthContext.Provider>
  );
}

describe("ArticleTable - Orden por valoración IA", () => {
  it("muestra los artículos ordenados por valoración IA descendente", async () => {
    const articles = [
      {
        id: 1,
        title: "Baja valoración",
        url: "https://example.com/1",
        isRead: false,
        dateAdded: new Date(),
        aiRating: 4,
      },
      {
        id: 2,
        title: "Alta valoración",
        url: "https://example.com/2",
        isRead: false,
        dateAdded: new Date(),
        aiRating: 9,
      },
      {
        id: 3,
        title: "Sin valoración",
        url: "https://example.com/3",
        isRead: false,
        dateAdded: new Date(),
      },
    ];

    const repo = {
      getArticlesByUserPaginated: jest
        .fn()
        .mockResolvedValue({ articles, total: articles.length }),
      markAsRead: jest.fn(),
      markAsFavorite: jest.fn(),
      deleteArticle: jest.fn(),
    };

    renderWithProviders(
      <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />,
      repo
    );

    await waitFor(() => {
      expect(screen.getByTitle("Alta valoración")).toBeInTheDocument();
    });

    const titles = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("title"))
      .filter(Boolean);

    expect(titles).toEqual([
      "Alta valoración",
      "Baja valoración",
      "Sin valoración",
    ]);
  });
});
