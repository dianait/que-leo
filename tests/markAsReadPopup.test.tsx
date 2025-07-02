import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { User } from "@supabase/supabase-js";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";
import { ArticleTable } from "../src/ui/ListOfArticles/ArticleTable";

const jsonRepository = new JsonArticleRepository();
const mockUser = { id: "123-test-user", user_metadata: {} } as User;

describe("Pop-up al marcar como leído", () => {
  test("Aparece el pop-up de compartir al marcar un artículo como leído", async () => {
    render(
      <AuthContext.Provider
        value={{
          user: mockUser,
          session: null,
          signInWithGitHub: async () => {},
          signOut: async () => {},
          loading: false,
        }}
      >
        <ArticleRepositoryContext.Provider value={jsonRepository}>
          <ArticleTable articlesVersion={0} setArticlesVersion={() => {}} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );

    // Espera a que se rendericen los artículos
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /Leído|No leído/i }).length
      ).toBeGreaterThan(0);
    });

    // Haz click en el primer botón "No leído"
    const markAsReadButton = screen.getAllByRole("button", {
      name: /No leído/i,
    })[0];
    fireEvent.click(markAsReadButton);

    // Espera a que aparezca el pop-up
    await waitFor(() => {
      expect(
        screen.getByText(/Has marcado este artículo como leído/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Bluesky/i)).toBeInTheDocument();
      expect(screen.getByText(/LinkedIn/i)).toBeInTheDocument();
    });
  });
});
