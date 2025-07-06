import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { User } from "@supabase/supabase-js";
import { BrowserRouter } from "react-router-dom";

import { Header } from "../src/ui/Header/Header";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { AuthContext } from "../src/domain/AuthContext";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";

const jsonRepository = new JsonArticleRepository();
const mockUser = {
  id: "123-test-user",
  email: "test@example.com",
  user_metadata: {
    user_name: "Test User",
    avatar_url: "https://example.com/avatar.jpg",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2023-01-01T00:00:00Z",
} as User;

const renderHeader = (user: User | null, repository = jsonRepository) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          user,
          session: null,
          signInWithGitHub: jest.fn(),
          signOut: jest.fn(),
          loading: false,
        }}
      >
        <ArticleRepositoryContext.Provider value={repository}>
          <Header />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe("Header", () => {
  test("muestra el logo y subtítulo", () => {
    renderHeader(mockUser);

    expect(screen.getByAltText("¿Qué leo? Logo")).toBeInTheDocument();
    expect(
      screen.getByText("Menos decisiones, más lectura.")
    ).toBeInTheDocument();
  });

  test("muestra información del usuario cuando está autenticado", () => {
    renderHeader(mockUser);

    expect(screen.getByAltText("Test User")).toBeInTheDocument();
    expect(screen.getByTitle("Test User")).toBeInTheDocument();
  });

  test("muestra el enlace 'Mis artículos' cuando el usuario tiene artículos", async () => {
    // Mock del repositorio con artículos
    const mockRepositoryWithArticles = {
      getAllArticles: jsonRepository.getAllArticles.bind(jsonRepository),
      addArticle: jsonRepository.addArticle.bind(jsonRepository),
      markAsRead: jsonRepository.markAsRead.bind(jsonRepository),
      deleteArticle: jsonRepository.deleteArticle.bind(jsonRepository),
      getArticlesByUserPaginated:
        jsonRepository.getArticlesByUserPaginated.bind(jsonRepository),
      getArticlesByUser: jest.fn().mockResolvedValue([
        {
          id: 1,
          title: "Test Article",
          url: "https://example.com",
          dateAdded: new Date(),
          isRead: false,
        },
      ]),
    };

    renderHeader(mockUser, mockRepositoryWithArticles);

    await waitFor(() => {
      expect(screen.getByText("Mis artículos")).toBeInTheDocument();
    });
  });

  test("NO muestra el enlace 'Mis artículos' cuando el usuario no tiene artículos", async () => {
    // Mock del repositorio sin artículos
    const mockRepositoryWithoutArticles = {
      getAllArticles: jsonRepository.getAllArticles.bind(jsonRepository),
      addArticle: jsonRepository.addArticle.bind(jsonRepository),
      markAsRead: jsonRepository.markAsRead.bind(jsonRepository),
      deleteArticle: jsonRepository.deleteArticle.bind(jsonRepository),
      getArticlesByUserPaginated:
        jsonRepository.getArticlesByUserPaginated.bind(jsonRepository),
      getArticlesByUser: jest.fn().mockResolvedValue([]),
    };

    renderHeader(mockUser, mockRepositoryWithoutArticles);

    await waitFor(() => {
      expect(screen.queryByText("Mis artículos")).not.toBeInTheDocument();
    });
  });

  test("no muestra información del usuario cuando no está autenticado", () => {
    renderHeader(null);

    expect(screen.queryByAltText("Test User")).not.toBeInTheDocument();
    expect(screen.queryByText("Mis artículos")).not.toBeInTheDocument();
  });

  test("muestra el email del usuario cuando no tiene avatar", () => {
    const userWithoutAvatar = {
      ...mockUser,
      user_metadata: {
        user_name: "Test User",
        avatar_url: null,
      },
    } as User;

    renderHeader(userWithoutAvatar);

    expect(screen.getByText("Test User")).toBeInTheDocument();
  });
});
