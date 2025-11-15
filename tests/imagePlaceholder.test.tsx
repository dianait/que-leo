import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RandomArticle } from "../src/ui/RandomArticle/RandomArticle";
import { ArticleRepositoryContext } from "../src/domain/ArticleRepositoryContext";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { AuthContext } from "../src/domain/AuthContext";
import { createMockAuthContext } from "./setup";

type ArticleType = {
  id: string;
  title: string;
  url: string;
  isRead: boolean;
  userId: string;
  dateAdded: Date;
  readAt: Date | null;
  authors: string[];
  topics: string[];
  less_15: boolean;
  featuredImage?: string | null;
};

describe("Imágenes en RandomArticle", () => {
  test("muestra imagen cuando featuredImage está disponible", async () => {
    const articleWithImage: ArticleType = {
      id: "1",
      title: "Artículo con imagen",
      url: "http://ejemplo.com",
      isRead: false,
      userId: "123",
      dateAdded: new Date(),
      readAt: null,
      authors: ["Autor Test"],
      topics: ["test"],
      less_15: false,
      featuredImage: "https://ejemplo.com/imagen.jpg",
    };
    const mockRepository: ArticleRepository = {
      getAllArticles: jest.fn(),
      getArticlesByUser: jest.fn().mockResolvedValue([articleWithImage]),
      getArticlesByUserPaginated: jest
        .fn()
        .mockResolvedValue({ articles: [], total: 0 }),
      addArticle: jest.fn(),
      deleteArticle: jest.fn(),
      markAsRead: jest.fn(),
      markAsFavorite: jest.fn(),
    };
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <ArticleRepositoryContext.Provider value={mockRepository}>
          <RandomArticle articlesVersion={0} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );
    await waitFor(() => {
      const image = screen.getByAltText("Featured Image");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "https://ejemplo.com/imagen.jpg");
    });
  });

  test("muestra placeholder cuando no hay featuredImage", async () => {
    const articleWithoutImage: ArticleType = {
      id: "2",
      title: "Artículo sin imagen",
      url: "http://ejemplo2.com",
      isRead: false,
      userId: "123",
      dateAdded: new Date(),
      readAt: null,
      authors: ["Autor Test 2"],
      topics: ["test2"],
      less_15: false,
      featuredImage: null,
    };
    const mockRepository: ArticleRepository = {
      getAllArticles: jest.fn(),
      getArticlesByUser: jest.fn().mockResolvedValue([articleWithoutImage]),
      getArticlesByUserPaginated: jest
        .fn()
        .mockResolvedValue({ articles: [], total: 0 }),
      addArticle: jest.fn(),
      deleteArticle: jest.fn(),
      markAsRead: jest.fn(),
      markAsFavorite: jest.fn(),
    };
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <ArticleRepositoryContext.Provider value={mockRepository}>
          <RandomArticle articlesVersion={0} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );
    await waitFor(() => {
      const image = screen.getByAltText("Imagen por defecto");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/placeholder.webp");
    });
  });

  test("maneja errores de carga de imagen correctamente", async () => {
    const articleWithBrokenImage: ArticleType = {
      id: "3",
      title: "Artículo con imagen rota",
      url: "http://ejemplo3.com",
      isRead: false,
      userId: "123",
      dateAdded: new Date(),
      readAt: null,
      authors: ["Autor Test 3"],
      topics: ["test3"],
      less_15: false,
      featuredImage: "https://imagen-que-no-existe.com/error.jpg",
    };
    const mockRepository: ArticleRepository = {
      getAllArticles: jest.fn(),
      getArticlesByUser: jest.fn().mockResolvedValue([articleWithBrokenImage]),
      getArticlesByUserPaginated: jest
        .fn()
        .mockResolvedValue({ articles: [], total: 0 }),
      addArticle: jest.fn(),
      deleteArticle: jest.fn(),
      markAsRead: jest.fn(),
      markAsFavorite: jest.fn(),
    };
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <ArticleRepositoryContext.Provider value={mockRepository}>
          <RandomArticle articlesVersion={0} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );
    await waitFor(() => {
      const image = screen.getByAltText("Featured Image");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "https://imagen-que-no-existe.com/error.jpg"
      );
    });
    // Simular error de carga
    const image = screen.getByAltText("Featured Image");
    fireEvent.error(image);
    // Después del error, debería cambiar a placeholder
    await waitFor(() => {
      expect(image).toHaveAttribute("src", "/placeholder.webp");
    });
  });

  test("mantiene tamaño fijo de imagen", async () => {
    const articleWithImage: ArticleType = {
      id: "1",
      title: "Artículo con imagen",
      url: "http://ejemplo.com",
      isRead: false,
      userId: "123",
      dateAdded: new Date(),
      readAt: null,
      authors: ["Autor Test"],
      topics: ["test"],
      less_15: false,
      featuredImage: "https://ejemplo.com/imagen.jpg",
    };
    const mockRepository: ArticleRepository = {
      getAllArticles: jest.fn(),
      getArticlesByUser: jest.fn().mockResolvedValue([articleWithImage]),
      getArticlesByUserPaginated: jest
        .fn()
        .mockResolvedValue({ articles: [], total: 0 }),
      addArticle: jest.fn(),
      deleteArticle: jest.fn(),
      markAsRead: jest.fn(),
      markAsFavorite: jest.fn(),
    };
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <ArticleRepositoryContext.Provider value={mockRepository}>
          <RandomArticle articlesVersion={0} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );
    await waitFor(() => {
      const image = screen.getByAltText("Featured Image");
      expect(image).toHaveClass("article-featured-image");
    });
  });

  test("mantiene tamaño fijo de imagen con placeholder", async () => {
    const articleWithoutImage: ArticleType = {
      id: "2",
      title: "Artículo sin imagen",
      url: "http://ejemplo2.com",
      isRead: false,
      userId: "123",
      dateAdded: new Date(),
      readAt: null,
      authors: ["Autor Test 2"],
      topics: ["test2"],
      less_15: false,
      featuredImage: null,
    };
    const mockRepository: ArticleRepository = {
      getAllArticles: jest.fn(),
      getArticlesByUser: jest.fn().mockResolvedValue([articleWithoutImage]),
      getArticlesByUserPaginated: jest
        .fn()
        .mockResolvedValue({ articles: [], total: 0 }),
      addArticle: jest.fn(),
      deleteArticle: jest.fn(),
      markAsRead: jest.fn(),
      markAsFavorite: jest.fn(),
    };
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <ArticleRepositoryContext.Provider value={mockRepository}>
          <RandomArticle articlesVersion={0} />
        </ArticleRepositoryContext.Provider>
      </AuthContext.Provider>
    );
    await waitFor(() => {
      const image = screen.getByAltText("Imagen por defecto");
      expect(image).toHaveClass("article-featured-image");
    });
  });
});
